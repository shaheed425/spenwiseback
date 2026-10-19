import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  verifyOtp,
  getUserDashboard,
  forgotPassword,
  resetPassword,
} from "../controller/usercontroller.js";

const router = express.Router();

// ===== AUTH (PUBLIC) =====
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

// ===== DASHBOARD (PROTECTED) =====
// 🔐 Token verified here
// 🔐 User ID must come from JWT inside controller
router.get("/dashboard", authMiddleware, getUserDashboard);

// ===== FORGOT PASSWORD (PUBLIC) =====
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
