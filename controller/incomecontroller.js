import mongoose from "mongoose";
import Income from "../models/income.js";

/**
 * =====================================
 * ADD INCOME
 * POST /api/income/addIncome/:id
 * =====================================
 */
export const addIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, date } = req.body;

    // ✅ Validate user id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // ✅ Basic validation
    if (!source || !amount) {
      return res
        .status(400)
        .json({ message: "Source and amount are required" });
    }

    // ✅ Create income (MATCHES MODEL)
    const income = await Income.create({
      userid: id,           // 🔥 MUST match schema
      source,
      amount,
      date,
    });

    res.status(201).json({
      message: "Income added successfully ✅",
      income,
    });
  } catch (error) {
    console.error("Add income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================
 * GET INCOME BY USER ID
 * GET /api/income/getbyid/:id
 * =====================================
 */
export const getbyid = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate user id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // ✅ Fetch income for user
    const incomeList = await Income.find({ userid: id }).sort({
      createdAt: -1,
    });

    res.status(200).json(incomeList);
  } catch (error) {
    console.error("Get income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================
 * DELETE INCOME
 * DELETE /api/income/:id
 * =====================================
 */
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate income id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income id" });
    }

    // ✅ Delete the income
    const deletedIncome = await Income.findByIdAndDelete(id);

    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({
      message: "Income deleted successfully ✅",
      income: deletedIncome,
    });
  } catch (error) {
    console.error("Delete income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================
 * UPDATE INCOME
 * PUT /api/income/:id
 * =====================================
 */
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, date } = req.body;

    // ✅ Validate income id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income id" });
    }

    // ✅ Update the income
    const updatedIncome = await Income.findByIdAndUpdate(
      id,
      { source, amount, date },
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({
      message: "Income updated successfully ✅",
      income: updatedIncome,
    });
  } catch (error) {
    console.error("Update income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};
