import express from "express";
import {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getOwnerAnalytics,
  getOwnerEquipmentBookingStats,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  createPaymentOrder,
  verifyPayment,
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

//  CREATE
router.post("/", protect, createBooking);

//  USER
router.get("/my", protect, getMyBookings); // renter bookings

//  OWNER
router.get("/owner", protect, getOwnerBookings); // owner bookings
router.get("/owner/analytics", protect, getOwnerAnalytics);
router.get("/owner/equipment-stats", protect, getOwnerEquipmentBookingStats);

//  SINGLE
router.get("/:id", protect, getBookingById);

//  STATUS UPDATE
router.patch("/:id/status", protect, updateBookingStatus);

//  CANCEL
router.delete("/:id", protect, cancelBooking);

// ═══════════════════ PAYMENT ROUTES (Phase 2) ═══════════════════

// Create Razorpay payment order
router.post("/:bookingId/payment/order", protect, createPaymentOrder);

// Verify payment signature (client-side helper)
router.post("/:bookingId/payment/verify", protect, verifyPayment);

export default router;
