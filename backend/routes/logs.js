import express from "express";

import {
  markComplete,
  unmarkComplete,
  getToday,
  getRange,
  getHeatmap,
  getHabitStats,
  getAllStats,
} from "../controllers/logController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/" , markComplete);
router.delete("/" , unmarkComplete);
router.get("/today" , getToday);
router.get("/range" , getRange);
router.get("/heatmap" , getHeatmap);
router.get("/stats" , getAllStats);
router.get("/stats/:habitId" , getHabitStats);

export default router;
