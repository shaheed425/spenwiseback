import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addExpense,
  getExpensesByUser,
  deleteExpense,
  updateExpense
} from "../controller/expensecontroller.js";

const router = express.Router();

// 🔐 ALL routes protected
router.post("/", auth, addExpense);
router.get("/", auth, getExpensesByUser);
router.delete("/:id", auth, deleteExpense);
router.put("/:id", auth, updateExpense);

export default router;
