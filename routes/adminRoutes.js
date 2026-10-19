import express from "express";
import auth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getAdminDashboard,
  deleteUserByAdmin
} from "../controller/admincontroller.js";

const router = express.Router();

// 🔐 ADMIN DASHBOARD (ADMIN ONLY)
router.get("/dashboard", auth, adminMiddleware, getAdminDashboard);

// 🔥 DELETE USER (ADMIN ONLY)
router.delete("/user/:id", auth, adminMiddleware, deleteUserByAdmin);

export default router;
