import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/CreateError.js";
import { Booking } from "../models/booking.model.js";
import { verifyWebhookSignature } from "../utils/razorpay.js";

const router = express.Router();

/**
 * Razorpay Webhook Handler
 * Receives payment events from Razorpay and updates booking status
 * Security: Signature verification is CRITICAL
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  // Get raw body for signature verification (Buffer from express.raw)
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString("utf8")
    : typeof req.body === "string"
    ? req.body
    : JSON.stringify(req.body || {});
  const webhookSignature = req.headers["x-razorpay-signature"];

  if (!webhookSignature) {
    throw createError("Missing webhook signature", 401);
  }

  // Verify webhook signature on raw body (most important security step)
  const isSignatureValid = verifyWebhookSignature(rawBody, webhookSignature);

  if (!isSignatureValid) {
    console.warn("Invalid webhook signature received:", {
      timestamp: new Date().toISOString(),
      signature: webhookSignature.substring(0, 10) + "...",
    });
    throw createError("Webhook signature verification failed", 401);
  }

  // Parse the raw body into JSON payload
  const payload = Buffer.isBuffer(req.body)
    ? JSON.parse(req.body.toString("utf8"))
    : typeof req.body === "string"
    ? JSON.parse(req.body)
    : req.body;
  const { event } = payload;

  console.log("Valid Razorpay Webhook Received:", {
    event,
    paymentId: payload?.payment?.id,
    orderId: payload?.order?.id,
    timestamp: new Date().toISOString(),
  });

  // Extract payment and order from payload
  const payment = payload?.payment;
  const order = payload?.order;

  // Handle payment.authorized event
  if (event === "payment.authorized") {
    const bookingId = order?.notes?.bookingId;
    const paymentId = payment?.id;
    const orderId = order?.id;

    if (!bookingId) {
      console.warn("No booking ID in webhook payload");
      return res.status(200).json({
        status: "received",
        warning: "No booking ID in payment notes",
      });
    }

    // Find and update booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.warn(`Booking not found for ID: ${bookingId}`);
      return res.status(200).json({
        status: "received",
        warning: "Booking not found",
      });
    }

    // Update booking with payment details
    booking.razorpayOrderId = orderId;
    booking.razorpayPaymentId = paymentId;
    booking.paymentStatus = "completed";
    booking.paymentCompletedAt = new Date();
    booking.webhookVerified = true;

    await booking.save();

    console.log(`Booking ${bookingId} payment verified and updated`);

    // Return 200 to acknowledge webhook received
    return res.status(200).json({
      status: "processed",
      message: "Payment verified and booking updated",
      bookingId,
    });
  }

  // Handle payment.failed event
  if (event === "payment.failed") {
    const bookingId = order?.notes?.bookingId;
    const paymentId = payment?.id;

    if (!bookingId) {
      console.warn("No booking ID in failed payment webhook");
      return res.status(200).json({
        status: "received",
        warning: "No booking ID in payment notes",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.warn(`Booking not found for ID: ${bookingId}`);
      return res.status(200).json({
        status: "received",
        warning: "Booking not found",
      });
    }

    // Update booking payment status to failed
    booking.paymentStatus = "failed";
    booking.razorpayPaymentId = paymentId;
    booking.webhookVerified = true;

    await booking.save();

    console.log(
      `Booking ${bookingId} payment failed - webhook processed`,
      payment
    );

    return res.status(200).json({
      status: "processed",
      message: "Payment failure recorded",
      bookingId,
    });
  }

  // Handle payment.captured event (alternative to authorized)
  if (event === "payment.captured") {
    const bookingId = order?.notes?.bookingId;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);

      if (booking && booking.paymentStatus !== "completed") {
        booking.paymentStatus = "completed";
        booking.razorpayPaymentId = payment?.id;
        booking.razorpayOrderId = order?.id;
        booking.paymentCompletedAt = new Date();
        booking.webhookVerified = true;

        await booking.save();

        console.log(`Booking ${bookingId} payment captured`);
      }
    }

    return res.status(200).json({
      status: "processed",
      message: "Payment captured",
    });
  }

  // For any other event, just acknowledge receipt
  return res.status(200).json({
    status: "received",
    message: `Event ${event} acknowledged`,
  });
});

/**
 * Health check endpoint for webhook configuration
 */
const webhookHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "razorpay-webhook",
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.post("/razorpay", handleRazorpayWebhook);
router.get("/health", webhookHealth);

export default router;