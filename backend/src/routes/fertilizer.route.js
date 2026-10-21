import express from "express";
import {
  createFertilizer,
  createFertilizerOrder,
  deleteFertilizer,
  getFertilizer,
  listAdminFertilizers,
  listAdminFertilizerOrders,
  listFertilizers,
  listMyFertilizerOrders,
  updateFertilizerOrderStatus,
  updateFertilizer,
} from "../controllers/fertilizer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", listFertilizers);
router.post("/orders", protect, createFertilizerOrder);
router.get("/orders/my", protect, listMyFertilizerOrders);
router.get("/admin", protect, adminOnly, listAdminFertilizers);
router.get("/admin/orders", protect, adminOnly, listAdminFertilizerOrders);
router.post("/admin", protect, adminOnly, createFertilizer);
router.put("/admin/:id", protect, adminOnly, updateFertilizer);
router.delete("/admin/:id", protect, adminOnly, deleteFertilizer);
router.patch("/admin/orders/:id/status", protect, adminOnly, updateFertilizerOrderStatus);
router.get("/:id", getFertilizer);

export default router;
