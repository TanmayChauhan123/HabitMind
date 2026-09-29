import express from "express";

import {
    weeklyReport,
    suggestHabits,
    recoveryPlan,
    chatAnalysis,
    morningMotivation,
} from "../controllers/AIcontroller.js";

import {protect} from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/weekly_report" , weeklyReport);
router.post("/suggest_habits" , suggestHabits);
router.post("/recovery_plan" , recoveryPlan);
router.post("/chat" , chatAnalysis);

export default router;