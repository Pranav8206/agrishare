import express from "express";
import {
  createFertilizer,
  createFertilizerOrder,
  deleteFertilizer,
  getFertilizer,
  listAdminFertilizers,
  listFertilizers,
  listMyFertilizerOrders,
  updateFertilizer,
} from "../controllers/fertilizer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", listFertilizers);
router.post("/orders", protect, createFertilizerOrder);
router.get("/orders/my", protect, listMyFertilizerOrders);
router.get("/admin", protect, adminOnly, listAdminFertilizers);
router.post("/admin", protect, adminOnly, createFertilizer);
router.put("/admin/:id", protect, adminOnly, updateFertilizer);
router.delete("/admin/:id", protect, adminOnly, deleteFertilizer);
router.get("/:id", getFertilizer);

export default router;
