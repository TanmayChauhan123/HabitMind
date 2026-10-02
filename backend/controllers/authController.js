import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const normalizeName = (name) => (typeof name === "string" ? name.trim() : "");

export const register = async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Name validation
    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        message: "Name must be 50 characters or less",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        message: "Password must be 128 characters or less",
      });
    }

    // Check duplicate email
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: name.charAt(0).toUpperCase(),
    });

    const token = signToken(user._id);

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    // Handle MongoDB duplicate-key race condition
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    console.error("Register error:", err);

    res.status(500).json({
      message: "Unable to create account. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = signToken(user._id);

    res.json({
      user,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      message: "Unable to sign in. Please try again.",
    });
  }
};

export const me = async (req, res) => {
  res.json({
    user: req.user,
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { morningMotivation } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.body.name !== undefined) {
      const name = normalizeName(req.body.name);

      if (!name) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      if (name.length < 2) {
        return res.status(400).json({
          message: "Name must be at least 2 characters",
        });
      }

      if (name.length > 50) {
        return res.status(400).json({
          message: "Name must be 50 characters or less",
        });
      }

      user.name = name;
      user.avatar = name.charAt(0).toUpperCase();
    }

    if (morningMotivation !== undefined) {
      user.morningMotivation = morningMotivation;
    }

    await user.save();

    res.json({
      user,
    });
  } catch (err) {
    console.error("Update profile error:", err);

    res.status(500).json({
      message: "Unable to update profile. Please try again.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Don't reveal whether an account exists.
    if (!user) {
      return res.json({
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token expires after 15 minutes
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return res.json({
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);

    return res.status(500).json({
      message: "Unable to process password reset request.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!token || !password) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        message: "Password must be 128 characters or less",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);

    return res.status(500).json({
      message: "Unable to reset password. Please try again.",
    });
  }
};
