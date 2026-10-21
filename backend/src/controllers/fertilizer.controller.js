import { randomUUID } from "node:crypto";
import { Fertilizer } from "../models/fertilizer.model.js";
import { FertilizerOrder } from "../models/fertilizer-order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/CreateError.js";

const cleanProductPayload = (body = {}) => ({
  ...body,
  price: Number(body.price),
  mrp: Number(body.mrp ?? body.price),
  quantity: Number(body.quantity),
  cropTypes: Array.isArray(body.cropTypes) ? body.cropTypes : [],
});

export const listFertilizers = asyncHandler(async (_req, res) => {
  const fertilizers = await Fertilizer.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ fertilizers });
});

export const getFertilizer = asyncHandler(async (req, res) => {
  const fertilizer = await Fertilizer.findOne({
    _id: req.params.id,
    isActive: true,
  }).lean();
  if (!fertilizer) throw createError("Fertilizer not found", 404);
  res.json({ fertilizer });
});

export const listAdminFertilizers = asyncHandler(async (_req, res) => {
  const fertilizers = await Fertilizer.find().sort({ createdAt: -1 });
  res.json({ fertilizers });
});

export const createFertilizer = asyncHandler(async (req, res) => {
  const payload = cleanProductPayload(req.body);
  if (!payload.name || !payload.brand || !payload.category || !payload.unit) {
    throw createError("name, brand, category and unit are required", 400);
  }
  const fertilizer = await Fertilizer.create(payload);
  res.status(201).json({ fertilizer });
});

export const updateFertilizer = asyncHandler(async (req, res) => {
  const fertilizer = await Fertilizer.findByIdAndUpdate(
    req.params.id,
    cleanProductPayload(req.body),
    { new: true, runValidators: true },
  );
  if (!fertilizer) throw createError("Fertilizer not found", 404);
  res.json({ fertilizer });
});

export const deleteFertilizer = asyncHandler(async (req, res) => {
  const fertilizer = await Fertilizer.findByIdAndDelete(req.params.id);
  if (!fertilizer) throw createError("Fertilizer not found", 404);
  res.json({ message: "Fertilizer deleted successfully" });
});

export const createFertilizerOrder = asyncHandler(async (req, res) => {
  const { fertilizerId, quantity, farmerName, farmerPhone, deliveryAddress } =
    req.body;
  const requestedQuantity = Number(quantity);
  if (
    !fertilizerId ||
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1 ||
    !farmerName?.trim() ||
    !farmerPhone?.trim() ||
    !deliveryAddress?.trim()
  ) {
    throw createError(
      "fertilizerId, quantity, farmerName, farmerPhone and deliveryAddress are required",
      400,
    );
  }

  const fertilizer = await Fertilizer.findOneAndUpdate(
    {
      _id: fertilizerId,
      isActive: true,
      quantity: { $gte: requestedQuantity },
    },
    { $inc: { quantity: -requestedQuantity } },
    { new: true },
  );
  if (!fertilizer) {
    throw createError("Fertilizer is inactive or insufficient stock", 409);
  }

  const deliveryCharge = fertilizer.price * requestedQuantity >= 1000 ? 0 : 70;
  const order = await FertilizerOrder.create({
    orderNumber: `AGRI-FERT-${randomUUID().slice(0, 8).toUpperCase()}`,
    fertilizer: fertilizer._id,
    buyer: req.user._id,
    quantity: requestedQuantity,
    unitPrice: fertilizer.price,
    deliveryCharge,
    totalAmount: fertilizer.price * requestedQuantity + deliveryCharge,
    farmerName: farmerName.trim(),
    farmerPhone: farmerPhone.trim(),
    deliveryAddress: deliveryAddress.trim(),
    paymentMethod: "cod",
  });

  res.status(201).json({ order });
});

export const listMyFertilizerOrders = asyncHandler(async (req, res) => {
  const orders = await FertilizerOrder.find({ buyer: req.user._id })
    .populate("fertilizer", "name unit image")
    .sort({ createdAt: -1 });
  res.json({ orders });
});
