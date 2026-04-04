import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    // ═══════════════════ PRICING BREAKDOWN ═══════════════════
    pricingBreakdown: {
      days: { type: Number },
      pricePerDay: { type: Number },
      baseAmount: { type: Number },
      surchargeRate: { type: Number, default: 0 },
      rentSurchargeAmount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      addonsAmount: { type: Number, default: 0 },
      totalAmount: { type: Number },
      advanceAmount: { type: Number, default: 0 },
      balanceAmount: { type: Number, default: 0 },
    },

    // ═══════════════════ BOOKING DETAILS ═══════════════════
    deliveryLocation: {
      type: String,
      trim: true,
    },
    selectedAddons: [
      {
        key: { type: String },
        label: { type: String },
        price: { type: Number },
      },
    ],
    specialRequirements: {
      type: String,
      trim: true,
    },

    // ═══════════════════ PAYMENT LIFECYCLE ═══════════════════
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      sparse: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "online",
        "cod",
        "pay_later",
        "card",
        "upi",
        "bank_transfer",
        "wallet",
      ],
      sparse: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    paymentCreatedAt: {
      type: Date,
      sparse: true,
    },
    paymentCompletedAt: {
      type: Date,
      sparse: true,
    },
    webhookVerified: {
      type: Boolean,
      default: false,
    },

    // ═══════════════════ REFUND TRACKING ═══════════════════
    refundStatus: {
      type: String,
      enum: ["none", "requested", "approved", "completed"],
      default: "none",
    },
    refundAmount: {
      type: Number,
      sparse: true,
    },
    refundReason: {
      type: String,
      trim: true,
      sparse: true,
    },
    refundProcessedAt: {
      type: Date,
      sparse: true,
    },

    // ═══════════════════ BLOCKCHAIN FIELDS ═══════════════════
    transactionHash: {
      type: String,
      sparse: true,
    },
    renterIdHash: {
      type: String,
      sparse: true,
    },
    bookingIdHash: {
      type: String,
      sparse: true,
    },
    equipmentIdHash: {
      type: String,
      sparse: true,
    },

    // ═══════════════════ LEGACY FIELDS (backward compatibility) ═══════════════════
    paymentId: {
      type: String,
    },

    // ═══════════════════ BOOKING STATUS ═══════════════════
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
