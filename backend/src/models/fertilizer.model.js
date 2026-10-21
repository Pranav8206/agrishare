import mongoose from "mongoose";

const fertilizerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    cropTypes: [{ type: String, trim: true }],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, min: 0, default: 0 },
    seller: {
      name: { type: String, trim: true },
      type: { type: String, trim: true },
      location: { type: String, trim: true },
      verifiedSince: { type: String, trim: true },
      badge: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    npk: {
      n: String,
      p: String,
      k: String,
    },
    purityScore: String,
    labReportNumber: String,
    labTestDate: String,
    testingLab: String,
    deliveryDays: String,
    subsidyEligible: { type: Boolean, default: false },
    description: String,
    quantity: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Fertilizer = mongoose.model("Fertilizer", fertilizerSchema);
