import mongoose from "mongoose";

const fertilizerOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    fertilizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fertilizer",
      required: true,
    },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    farmerName: { type: String, required: true, trim: true },
    farmerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    paymentMethod: { type: String, enum: ["cod"], default: "cod" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "dispatched", "delivered", "cancelled", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const FertilizerOrder = mongoose.model(
  "FertilizerOrder",
  fertilizerOrderSchema,
);
