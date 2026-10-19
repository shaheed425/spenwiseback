import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  deleteAccount
} from "../controller/profileController.js";

const router = express.Router();

router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);
router.delete("/", auth, deleteAccount);

export default router;
