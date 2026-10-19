import mongoose from "mongoose";
import Expense from "../models/expense.js";

// ================= ADD EXPENSE =================
export const addExpense = async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 FROM TOKEN
    const { title, amount, category, date, notes } = req.body;

    // ✅ Basic validation
    if (!title || !amount || !category) {
      return res.status(400).json({
        message: "Title, amount, and category are required",
      });
    }

    const expense = await Expense.create({
      userid: userId, // 🔥 TOKEN USER
      title,
      amount,
      category,
      date,
      notes,
    });

    res.status(201).json({
      message: "Expense added successfully ✅",
      expense,
    });
  } catch (error) {
    console.error("Add expense error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET EXPENSES (LOGGED-IN USER) =================
export const getExpensesByUser = async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 FROM TOKEN

    const expenses = await Expense.find({ userid: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Fetch expenses error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE EXPENSE =================
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({
      message: "Expense deleted successfully ✅",
      expense: deletedExpense,
    });
  } catch (error) {
    console.error("Delete expense error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE EXPENSE =================
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { title, amount, category, date, notes },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({
      message: "Expense updated successfully ✅",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Update expense error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};
