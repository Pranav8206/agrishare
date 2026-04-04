import express from "express";
import {
  addEquipment,
  updateEquipment,
  deleteEquipment,
  viewAllEquipments,
  viewSingleEquipment,
  viewMyEquipments,
  viewEquipmentsByUser,
  getEquipmentAiAnalysis,
  refreshEquipmentAiAnalysis,
} from "../controllers/equipment.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ---------- PUBLIC ----------
router.get("/", viewAllEquipments);          // all equipments
// specific routes first
router.get("/user/:userId", viewEquipmentsByUser);
router.get("/my", protect, viewMyEquipments);


// ---------- PROTECTED ----------
router.post("/add", protect, addEquipment);
// then generic
router.get("/:id", viewSingleEquipment);
router.get("/:id/ai-analysis", protect, getEquipmentAiAnalysis);
router.post("/:id/ai-analysis/refresh", protect, refreshEquipmentAiAnalysis);
router.put("/:id", protect, updateEquipment);
router.delete("/:id", protect, deleteEquipment);

export default router;