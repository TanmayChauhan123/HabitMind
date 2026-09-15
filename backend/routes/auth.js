import express from "express";

import {
  register,
  login,
  me,
  updateProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register); // public
router.post("/login", login); // public
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);

export default router;
