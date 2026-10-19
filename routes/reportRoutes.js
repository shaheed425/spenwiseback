import express from "express";
import auth from "../middleware/authMiddleware.js";
import { getMonthlyReport } from "../controller/reportsController.js";

const router = express.Router();

router.get("/monthly", auth, getMonthlyReport);

export default router;
