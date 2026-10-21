import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import { Equipment } from "../models/equipment.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/CreateError.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
} from "../utils/razorpay.js";
import {
  recordRentalOnChain,
  userIdToBytes32,
  bookingIdToBytes32,
  equipmentIdToUint256,
} from "../utils/blockchain.js";
import {
  calculateTransportCharge,
  getPricingConfig,
} from "../config/pricing.js";

const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveEntityId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  if (entity._id) return entity._id.toString();
  return entity.toString?.() || "";
};

// ═══════════════════ ADDON DEFINITIONS & VALIDATION ═══════════════════
const ALLOWED_ADDONS = [
  { key: "trailers", label: "Trailers", price: 200 },
  { key: "operator", label: "Operator", price: 150 },
  { key: "fuel", label: "Fuel Pack", price: 80 },
  { key: "insurance", label: "Insurance", price: 120 },
];

const ADVANCE_PERCENTAGE = 1; // Online now collects full amount
const PAYMENT_MODES = ["online", "cod", "pay_later"];
const PAYMENT_MODE_SURCHARGE_MAP = {
  online: 0,
  cod: 0.05,
  pay_later: 0.1,
};

/**
 * Validate and extract addon objects from addon keys
 */
const validateAndGetAddons = (addonKeys) => {
  if (!addonKeys || !Array.isArray(addonKeys)) return [];

  return addonKeys
    .map((key) => {
      const addon = ALLOWED_ADDONS.find((a) => a.key === key);
      if (!addon) throw createError(`Invalid addon key: ${key}`, 400);
      return addon;
    })
    .filter((addon) => addon);
};

/**
 * Calculate pricing breakdown with advance/balance split
 */
const calculatePricingBreakdown = (
  days,
  pricePerDay,
  selectedAddons,
  hasDelivery,
  paymentMode = "online",
  distanceKm = null,
) => {
  const baseAmount = days * pricePerDay;
  const surchargeRate = PAYMENT_MODE_SURCHARGE_MAP[paymentMode] || 0;
  const rentSurchargeAmount = Math.ceil(baseAmount * surchargeRate);
  const addonsAmount = selectedAddons.reduce(
    (sum, addon) => sum + addon.price,
    0
  );
  const deliveryFee = hasDelivery
    ? calculateTransportCharge(distanceKm)
    : 0;
  const total = baseAmount + rentSurchargeAmount + addonsAmount + deliveryFee;
  const isOnlinePayment = paymentMode === "online";

  return {
    days,
    pricePerDay,
    baseAmount,
    surchargeRate,
    rentSurchargeAmount,
    deliveryFee,
    distanceKm: Number.isFinite(distanceKm) ? Number(distanceKm.toFixed(2)) : null,
    addonsAmount,
    totalAmount: total,
    advanceAmount: isOnlinePayment ? Math.ceil(total * ADVANCE_PERCENTAGE) : 0,
    balanceAmount: isOnlinePayment ? 0 : total,
  };
};

// ====================== CREATE (BOOKING INTENT: Phase 1) ======================
// Phase 1: Create booking as "pending" with full pricing breakdown
// Phase 2: Will transition to create-after-payment-success flow
const createBooking = asyncHandler(async (req, res) => {
  const {
    equipment: equipmentId,
    startDate,
    endDate,
    deliveryLocation,
    addons: addonKeys = [],
    specialRequirements,
    paymentMode,
    paymentMethod,
    renterLatitude,
    renterLongitude,
  } = req.body;

  if (!req.user?._id) throw createError("Not authorized", 401);

  if (!equipmentId || !startDate || !endDate) {
    throw createError("equipment, startDate and endDate are required", 400);
  }

  if (!isValidObjectId(equipmentId)) {
    throw createError("Invalid equipment id", 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) throw createError("Invalid date range", 400);

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) throw createError("Equipment not found", 404);
  if (!equipment.isAvailable) {
    throw createError("Equipment is currently unavailable", 409);
  }

  if (equipment.owner.toString() === req.user._id.toString()) {
    throw createError("Owner cannot rent own equipment", 400);
  }

  // Overlapping check includes pending bookings (holds availability during payment)
  const overlapping = await Booking.findOne({
    equipment: equipmentId,
    status: { $in: ["pending", "confirmed"] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (overlapping) {
    throw createError("Equipment not available for selected dates", 409);
  }

  let distanceKm = null;
  const hasRenterCoordinates =
    Number.isFinite(Number(renterLatitude)) &&
    Number.isFinite(Number(renterLongitude));
  const equipmentCoordinates = equipment.geoLocation?.coordinates;

  if (hasRenterCoordinates && Array.isArray(equipmentCoordinates)) {
    const { maxEquipmentDistanceKm } = getPricingConfig();
    const [equipmentLongitude, equipmentLatitude] = equipmentCoordinates;
    const toRadians = (value) => (value * Math.PI) / 180;
    const latitudeDelta = toRadians(Number(equipmentLatitude) - Number(renterLatitude));
    const longitudeDelta = toRadians(Number(equipmentLongitude) - Number(renterLongitude));
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(toRadians(Number(renterLatitude))) *
        Math.cos(toRadians(Number(equipmentLatitude))) *
        Math.sin(longitudeDelta / 2) ** 2;
    distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    if (distanceKm > maxEquipmentDistanceKm) {
      throw createError(
        `Equipment is outside the ${maxEquipmentDistanceKm} km service radius`,
        422,
      );
    }
  }

  // Validate and extract addon objects
  const selectedAddons = validateAndGetAddons(addonKeys);
  const resolvedPaymentMode = String(
    paymentMode || paymentMethod || "online"
  ).toLowerCase();

  if (!PAYMENT_MODES.includes(resolvedPaymentMode)) {
    throw createError("Invalid payment mode", 400);
  }

  // Calculate days and pricing breakdown
  const days = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
  const pricingBreakdown = calculatePricingBreakdown(
    days,
    equipment.pricePerDay,
    selectedAddons,
    !!deliveryLocation,
    resolvedPaymentMode,
    distanceKm,
  );

  const totalPrice = pricingBreakdown.totalAmount;

  const booking = await Booking.create({
    equipment: equipmentId,
    owner: equipment.owner,
    renter: req.user._id,
    startDate: start,
    endDate: end,
    totalPrice,
    pricingBreakdown,
    deliveryLocation: deliveryLocation || null,
    selectedAddons,
    specialRequirements: specialRequirements || null,
    paymentMethod: resolvedPaymentMode,
    status: "pending",
    paymentStatus: "pending",
  });

  // Write reservation proof on-chain for both online and COD bookings.
  // This is the immutable booking record, not the payment record.
  try {
    // Compute hashes that will be stored on-chain for verification
    const equipmentIdHash = String(equipmentIdToUint256(booking.equipment.toString()));
    const renterIdHashValue = userIdToBytes32(booking.renter.toString());
    const bookingIdHashValue = bookingIdToBytes32(booking._id.toString());

    const txHash = await recordRentalOnChain({
      equipmentId: booking.equipment.toString(),
      renterUserId: booking.renter.toString(),
      bookingId: booking._id.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
    });

    // Store all hashes for future verification and audit trails
    booking.transactionHash = txHash;
    booking.equipmentIdHash = equipmentIdHash;
    booking.renterIdHash = renterIdHashValue;
    booking.bookingIdHash = bookingIdHashValue;
    await booking.save();
  } catch (chainError) {
    console.error(
      `Blockchain booking proof failed for booking ${booking._id}:`,
      chainError?.message || chainError
    );
  }

  // Populate related data for response
  await booking.populate("equipment");

  res.status(201).json({
    message:
      resolvedPaymentMode === "online"
        ? "Booking intent created. Proceed to online payment."
        : "Booking created successfully.",
    booking,
  });
});

const getPricingConfiguration = asyncHandler(async (_req, res) => {
  res.json(getPricingConfig());
});

// ====================== MY BOOKINGS ======================
const getMyBookings = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const bookings = await Booking.find({ renter: req.user._id })
    .populate("equipment")
    .sort({ createdAt: -1 });

  res.json({ total: bookings.length, bookings });
});

// ====================== OWNER BOOKINGS ======================
const getOwnerBookings = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const bookings = await Booking.find({ owner: req.user._id })
    .populate("equipment renter")
    .sort({ createdAt: -1 });

  res.json({ total: bookings.length, bookings });
});

// ====================== OWNER ANALYTICS ======================
const getOwnerAnalytics = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const ownerId = new mongoose.Types.ObjectId(req.user._id);

  const [statusStats, monthlyStats, totals] = await Promise.all([
    Booking.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          bookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$totalPrice",
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
    Booking.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$totalPrice",
                0,
              ],
            },
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          activeBookings: {
            $sum: {
              $cond: [{ $in: ["$status", ["pending", "confirmed"]] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  const statusCounts = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  statusStats.forEach((item) => {
    if (
      item?._id &&
      Object.prototype.hasOwnProperty.call(statusCounts, item._id)
    ) {
      statusCounts[item._id] = item.count;
    }
  });

  const monthly = monthlyStats.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    bookings: item.bookings,
    revenue: item.revenue,
  }));

  const summary = totals[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    completedBookings: 0,
    activeBookings: 0,
  };

  const completionRate =
    summary.totalBookings > 0
      ? Math.round((summary.completedBookings / summary.totalBookings) * 100)
      : 0;

  return res.status(200).json({
    success: true,
    data: {
      summary: {
        ...summary,
        completionRate,
      },
      statusCounts,
      monthly,
    },
  });
});

// ====================== OWNER EQUIPMENT BOOKING STATS ======================
const getOwnerEquipmentBookingStats = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const ownerId = new mongoose.Types.ObjectId(req.user._id);

  const stats = await Booking.aggregate([
    { $match: { owner: ownerId } },
    {
      $group: {
        _id: "$equipment",
        totalBookings: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        confirmed: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  const equipmentIds = stats.map((item) => item._id);
  const equipmentList = await Equipment.find({
    _id: { $in: equipmentIds },
  }).select("_id name coverImage pricePerDay isAvailable");

  const equipmentMap = new Map(
    equipmentList.map((item) => [item._id.toString(), item])
  );

  const result = stats.map((item) => {
    const equipment = equipmentMap.get(item._id.toString());
    return {
      equipmentId: item._id,
      equipment,
      totalBookings: item.totalBookings,
      statusCounts: {
        pending: item.pending,
        confirmed: item.confirmed,
        completed: item.completed,
        cancelled: item.cancelled,
      },
    };
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// ====================== SINGLE ======================
const getBookingById = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw createError("Invalid booking id", 400);
  }

  const booking = await Booking.findById(req.params.id)
    .populate({
      path: "equipment",
      select:
        "name description pricePerDay coverImage location geoLocation address type condition manufacturingYear isAvailable owner",
    })
    .populate({
      path: "owner",
      select:
        "fullName email phone profilePic age isVerified isAvailableAsLabour createdAt",
    })
    .populate({
      path: "renter",
      select:
        "fullName email phone profilePic age isVerified isAvailableAsLabour createdAt",
    });

  if (!booking) throw createError("Booking not found", 404);

  const userId = req.user?._id?.toString();
  const bookingOwnerId = resolveEntityId(booking.owner);
  const bookingRenterId = resolveEntityId(booking.renter);
  const equipmentOwnerId = resolveEntityId(booking.equipment?.owner);

  if (
    bookingOwnerId !== userId &&
    bookingRenterId !== userId &&
    equipmentOwnerId !== userId
  ) {
    throw createError("Not authorized", 403);
  }

  res.json(booking);
});

// ====================== UPDATE STATUS ======================
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!req.user?._id) throw createError("Not authorized", 401);

  if (!BOOKING_STATUSES.includes(status)) {
    throw createError("Invalid status", 400);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw createError("Booking not found", 404);

  const isOwner = booking.owner.toString() === req.user._id.toString();
  const isRenter = booking.renter.toString() === req.user._id.toString();

  if (!isOwner && !isRenter) throw createError("Not authorized", 403);

  if (isRenter && status !== "cancelled") {
    throw createError("Renter can only cancel bookings", 403);
  }

  const transitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    cancelled: [],
    completed: [],
  };

  if (!transitions[booking.status].includes(status)) {
    throw createError("Invalid status transition", 400);
  }

  // ═══════════════════ PAYMENT GUARDRAILS ═══════════════════
  // Only owner can confirm, and only after payment verified
  // if (status === "confirmed" && isOwner && booking.paymentMethod === "online") {
  //   if (booking.paymentStatus !== "completed") {
  //     throw createError(
  //       "Cannot confirm booking: payment not completed. Payment status is " +
  //         booking.paymentStatus,
  //       402
  //     );
  //   }
  //   if (!booking.webhookVerified) {
  //     throw createError(
  //       "Cannot confirm booking: payment signature not verified",
  //       402
  //     );
  //   }
  // }

  // Only mark completed if booking dates have passed
  if (status === "completed") {
    const now = new Date();
    if (now < booking.endDate) {
      throw createError("Cannot mark booking completed before end date", 400);
    }
  }

  booking.status = status;
  await booking.save();

  res.json({ message: "Status updated", booking });
});

// ====================== CANCEL ======================
const cancelBooking = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw createError("Booking not found", 404);

  if (booking.renter.toString() !== req.user._id.toString()) {
    throw createError("Only renter can cancel", 403);
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    throw createError("Cannot cancel this booking", 400);
  }

  // Mark refund as "requested" if payment was completed
  if (booking.paymentStatus === "completed") {
    booking.refundStatus = "requested";
    booking.refundAmount = booking.totalPrice;
    booking.refundReason = "User cancellation";
  }

  booking.status = "cancelled";
  await booking.save();

  res.json({ message: "Booking cancelled", booking });
});

// ====================== CREATE RAZORPAY ORDER (PHASE 2) ======================
/**
 * Create a Razorpay payment order for a booking
 * Client calls this before opening Razorpay checkout modal
 * Returns orderId and amount to display in payment form
 */
const createPaymentOrder = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    throw createError("Invalid booking id", 400);
  }

  const booking =
    await Booking.findById(bookingId).populate("equipment renter");

  if (!booking) throw createError("Booking not found", 404);

  // Only renter can create payment order for their booking
  if (booking.renter._id.toString() !== req.user._id.toString()) {
    throw createError("Not authorized to pay for this booking", 403);
  }

  // Booking must be in pending state and payment not yet completed
  if (booking.status !== "pending") {
    throw createError("Booking is not in pending state", 400);
  }

  if (booking.paymentMethod !== "online") {
    throw createError(
      "Payment order is only available for online payment mode",
      400
    );
  }

  if (booking.paymentStatus === "completed") {
    throw createError("Payment already completed for this booking", 400);
  }

  // Prevent duplicate orders - check if one already exists
  if (booking.razorpayOrderId) {
    return res.status(200).json({
      message: "Payment order already exists",
      orderId: booking.razorpayOrderId,
      amount: booking.totalPrice,
      currency: "₹",
      bookingId: booking._id,
    });
  }

  try {
    // Create Razorpay order for full booking amount
    const payableAmount = booking.totalPrice;

    const orderResponse = await createRazorpayOrder({
      amount: payableAmount,
      bookingId: booking._id.toString(),
      userEmail: booking.renter.email,
      userName: booking.renter.name || "Guest",
      userPhone: booking.renter.phone,
    });

    // Store Razorpay order ID in booking
    booking.razorpayOrderId = orderResponse.orderId;
    booking.paymentCreatedAt = new Date();
    await booking.save();

    res.status(201).json({
      message: "Payment order created successfully",
      orderId: orderResponse.orderId,
      amount: orderResponse.amount,
      currency: orderResponse.currency,
      bookingId: booking._id,
      totalAmount: booking.totalPrice,
    });
  } catch (error) {
    console.error("Payment Order Creation Failed:", error);
    throw createError(
      error.message || "Failed to create payment order",
      error.statusCode || 500
    );
  }
});

// ====================== VERIFY PAYMENT (PHASE 2) ======================
/**
 * Verify payment signature from client
 * Client calls after Razorpay payment success
 * This is a client-side verification helper (webhook is the source of truth)
 */
const verifyPayment = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const bookingId = req.params.bookingId || req.body.bookingId;
  const { paymentId, signature } = req.body;

  if (!bookingId || !paymentId || !signature) {
    throw createError("bookingId, paymentId, and signature are required", 400);
  }

  if (!isValidObjectId(bookingId)) {
    throw createError("Invalid booking id", 400);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) throw createError("Booking not found", 404);

  if (booking.paymentMethod !== "online") {
    throw createError("Payment verification is only for online mode", 400);
  }

  // Only renter can verify payment for their booking
  if (booking.renter.toString() !== req.user._id.toString()) {
    throw createError("Not authorized", 403);
  }

  // Verify signature
  const isSignatureValid = verifyPaymentSignature(
    booking.razorpayOrderId,
    paymentId,
    signature
  );

  if (!isSignatureValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
      verified: false,
    });
  }

  // Update booking with payment details
  booking.razorpayPaymentId = paymentId;
  booking.paymentStatus = "completed";
  booking.paymentCompletedAt = new Date();

  // Local/dev fallback: Razorpay dashboard does not allow localhost webhooks.
  // Keep strict behavior in production unless explicitly bypassed.
  const allowDevWebhookBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.RAZORPAY_SKIP_WEBHOOK_IN_DEV === "true";

  booking.webhookVerified = allowDevWebhookBypass ? true : false;

  await booking.save();

  res.status(200).json({
    success: true,
    message: "Payment signature verified successfully",
    verified: true,
    bookingId: booking._id,
    paymentStatus: booking.paymentStatus,
    note: allowDevWebhookBypass
      ? "Webhook bypass enabled for local development"
      : "Awaiting webhook confirmation from Razorpay",
  });
});

export {
  createBooking,
  getPricingConfiguration,
  getMyBookings,
  getOwnerBookings,
  getOwnerAnalytics,
  getOwnerEquipmentBookingStats,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  createPaymentOrder,
  verifyPayment,
  validateAndGetAddons,
  calculatePricingBreakdown,
  ALLOWED_ADDONS,
  PAYMENT_MODES,
  PAYMENT_MODE_SURCHARGE_MAP,
  ADVANCE_PERCENTAGE,
};
