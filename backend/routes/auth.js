import express from "express";

import {
  register,
  login,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public auth routes
router.post("/register", register);
router.post("/login", login);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);

export default router;
