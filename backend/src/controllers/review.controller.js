import mongoose from "mongoose";
import { Review } from "../models/review.model.js";
import { Equipment } from "../models/equipment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/CreateError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


const updateEquipmentRating = async (equipmentId) => {
  const stats = await Review.aggregate([
    { $match: { equipment: new mongoose.Types.ObjectId(equipmentId) } },
    {
      $group: {
        _id: "$equipment",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Equipment.findByIdAndUpdate(equipmentId, {
      avgRating: stats[0].avgRating,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Equipment.findByIdAndUpdate(equipmentId, {
      avgRating: 0,
      numReviews: 0,
    });
  }
};

// ====================== ADD REVIEW ======================
const createReview = asyncHandler(async (req, res) => {
  const { equipment: equipmentId, rating, comment } = req.body;

  if (!req.user?._id) throw createError("Not authorized", 401);

  if (!equipmentId || rating === undefined) {
    throw createError("equipment and rating are required", 400);
  }

  if (!isValidObjectId(equipmentId)) {
    throw createError("Invalid equipment id", 400);
  }

  const ratingNumber = Number(rating);
  if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    throw createError("rating must be between 1 and 5", 400);
  }

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) throw createError("Equipment not found", 404);

  if (equipment.owner.toString() === req.user._id.toString()) {
    throw createError("Owner cannot review their own equipment", 400);
  }

  // const completedBooking = await Booking.findOne({
  //   equipment: equipmentId,
  //   renter: req.user._id,
  //   status: "completed",
  // });

  // if (!completedBooking) {
  //   throw createError("Review allowed only after completed booking", 403);
  // }

  const existingReview = await Review.findOne({
    user: req.user._id,
    equipment: equipmentId,
  });

  if (existingReview) {
    throw createError("You already reviewed this equipment", 409);
  }

  const review = await Review.create({
    user: req.user._id,
    equipment: equipmentId,
    rating: ratingNumber,
    comment,
  });

  await updateEquipmentRating(equipmentId);

  res.status(201).json({
    message: "Review added",
    review,
  });
});

// ====================== GET REVIEWS BY EQUIPMENT ======================
const getReviewsByEquipment = asyncHandler(async (req, res) => {
  const { equipmentId } = req.params;

  if (!isValidObjectId(equipmentId)) {
    throw createError("Invalid equipment id", 400);
  }

  const reviews = await Review.find({ equipment: equipmentId })
    .populate("user", "fullName email profilePic")
    .sort({ createdAt: -1 });

  res.json({
    total: reviews.length,
    reviews,
  });
});

// ====================== GET MY REVIEWS ======================
const getMyReviews = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const reviews = await Review.find({ user: req.user._id }).populate(
    "equipment",
    "name"
  );

  res.json({
    total: reviews.length,
    reviews,
  });
});

// ====================== DELETE REVIEW ======================
const deleteReview = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw createError("Not authorized", 401);

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw createError("Invalid review id", 400);
  }

  const review = await Review.findById(id);
  if (!review) throw createError("Review not found", 404);

  const isAuthor = review.user.toString() === req.user._id.toString();

  if (!isAuthor) {
    throw createError("Not authorized", 403);
  }

  const equipmentId = review.equipment;

  await review.deleteOne();

  await updateEquipmentRating(equipmentId);

  res.json({
    message: "Review deleted",
  });
});

export { createReview, getReviewsByEquipment, getMyReviews, deleteReview };
