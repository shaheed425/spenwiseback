import User from "../models/user.js";
import Expense from "../models/expense.js";
import Income from "../models/income.js";

/* ================= ADMIN DASHBOARD ================= */
export const getAdminDashboard = async (req, res) => {
  try {
    /* ================= SUMMARY CARDS ================= */

    const usersCount = await User.countDocuments({ usertype: "user" });

    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenseAmount = expenseAgg[0]?.total || 0;

    const incomeAgg = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncomeAmount = incomeAgg[0]?.total || 0;

    /* ================= REGISTERED USERS ================= */
    const registeredUsers = await User.find({ usertype: "user" })
      .select("firstname lastname email isVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    /* ================= RECENT EXPENSE ACTIVITY ================= */
    const recentExpenses = await Expense.find()
      .populate("userid", "firstname lastname")
      .sort({ createdAt: -1 })
      .limit(5);

    /* ================= LAST 6 MONTHS ================= */

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString("en-US", { month: "short" })
      });
    }

    /* ================= NEW SIGNUPS ================= */

    const newSignups = [];

    for (const m of months) {
      const start = new Date(`${m.key}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const count = await User.countDocuments({
        usertype: "user",
        createdAt: { $gte: start, $lt: end }
      });

      newSignups.push(count);
    }

    /* ================= ACTIVE USERS ================= */

    const activeUsers = [];

    for (const m of months) {
      const start = new Date(`${m.key}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const expenseUsers = await Expense.distinct("userid", {
        createdAt: { $gte: start, $lt: end }
      });

      const incomeUsers = await Income.distinct("userid", {
        createdAt: { $gte: start, $lt: end }
      });

      activeUsers.push(
        new Set([...expenseUsers, ...incomeUsers].map(String)).size
      );
    }

    const activeUsersCount = activeUsers[activeUsers.length - 1] || 0;

    /* ================= CUMULATIVE FINANCIAL ================= */

    const expenseMonthly = {};
    const incomeMonthly = {};

    const getKey = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    (await Expense.find()).forEach(e => {
      const key = getKey(e.createdAt);
      expenseMonthly[key] = (expenseMonthly[key] || 0) + e.amount;
    });

    (await Income.find()).forEach(i => {
      const key = getKey(i.createdAt);
      incomeMonthly[key] = (incomeMonthly[key] || 0) + i.amount;
    });

    let cumExp = 0;
    let cumInc = 0;

    const cumulativeExpense = [];
    const cumulativeIncome = [];

    months.forEach(m => {
      cumExp += expenseMonthly[m.key] || 0;
      cumInc += incomeMonthly[m.key] || 0;
      cumulativeExpense.push(cumExp);
      cumulativeIncome.push(cumInc);
    });

    res.status(200).json({
      usersCount,
      totalExpenseAmount,
      totalIncomeAmount,
      activeUsersCount,
      registeredUsers,
      recentExpenses,
      chartData: {
        months: months.map(m => m.label),
        newSignups,
        activeUsers,
        cumulativeExpense,
        cumulativeIncome
      }
    });
  } catch (err) {
    console.error("Admin dashboard error ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE USER (ADMIN) ================= */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.usertype === "admin") {
      return res.status(400).json({ message: "Invalid user" });
    }

    await User.findByIdAndDelete(id);
    await Expense.deleteMany({ userid: id });
    await Income.deleteMany({ userid: id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};
