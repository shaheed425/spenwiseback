import Expense from "../models/expense.js";
import Income from "../models/income.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const userId = req.user.id;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    // ✅ LOCAL TIME RANGE (CRITICAL FIX)
    const start = new Date(month + "-01");
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    // ✅ Fetch data
    const expenses = await Expense.find({
      userid: userId,
      date: { $gte: start, $lt: end },
    });

    const incomes = await Income.find({
      userid: userId,
      date: { $gte: start, $lt: end },
    });

    // ✅ Totals (same logic as Dashboard)
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    const totalIncome = incomes.reduce(
      (sum, i) => sum + Number(i.amount || 0),
      0
    );

    // ✅ Category breakdown
    const categories = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categories[cat] = (categories[cat] || 0) + Number(e.amount || 0);
    });

    res.status(200).json({
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      categories,
    });
  } catch (err) {
    console.error("Monthly report error ❌", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
