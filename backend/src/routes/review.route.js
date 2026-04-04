import express from "express";
import {
  createReview,
  getReviewsByEquipment,
  getMyReviews,
  deleteReview,
} from "../controllers/review.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE
router.post("/", protect, createReview);

// USER
router.get("/my", protect, getMyReviews);

// EQUIPMENT REVIEWS
router.get("/equipment/:equipmentId", getReviewsByEquipment);

// DELETE
router.delete("/:id", protect, deleteReview);

export default router;