import Expense from "../models/expense.js";
import Income from "../models/income.js";
import User from "../models/user.js";
import sendEmail from "./sendEmail.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const checkMonthlyExpenseVsIncome = async () => {
  console.log("🔍 Running monthly expense vs income check...");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  try {
    const users = await User.find({ usertype: "user" });

    for (const user of users) {
      try {
        const expenseAgg = await Expense.aggregate([
          {
            $match: {
              userid: user._id,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const incomeAgg = await Income.aggregate([
          {
            $match: {
              userid: user._id,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const totalExpense = expenseAgg[0]?.total || 0;
        const totalIncome = incomeAgg[0]?.total || 0;
        const netSavings = totalIncome - totalExpense;

        console.log("🧪 MONTHLY CHECK:", {
          email: user.email,
          totalIncome,
          totalExpense,
          netSavings,
        });

        // ✅ Only notify if negative
        if (netSavings >= 0) continue;

        // ⛔ Prevent duplicate monthly email
        if (
          user.lastNegativeSavingsAlert &&
          user.lastNegativeSavingsAlert >= startOfMonth
        ) {
          console.log(`⏭️ Skipped (already alerted): ${user.email}`);
          continue;
        }

        console.log(`📧 Sending email to ${user.email}`);

        await sendEmail({
          to: user.email,
          subject: "⚠️ SpendWise Alert: Expenses Exceeded Income",
          html: `
            <h2>Hello ${user.firstname},</h2>
            <p>Your expenses for this month have exceeded your income.</p>

            <table>
              <tr><td><b>Total Income:</b></td><td>₹${totalIncome}</td></tr>
              <tr><td><b>Total Expense:</b></td><td>₹${totalExpense}</td></tr>
              <tr><td><b>Net Savings:</b></td><td style="color:red;">₹${netSavings}</td></tr>
            </table>

            <p>Please review your spending.</p>
            <p>— SpendWise Team</p>
          `,
        });

        user.lastNegativeSavingsAlert = new Date();
        await user.save();

        console.log(`✅ Email sent to ${user.email}`);

        // 🕒 IMPORTANT: delay to avoid Gmail blocking
        await sleep(2000);

      } catch (userError) {
        console.error(
          `❌ Failed for ${user.email}:`,
          userError.message
        );
      }
    }

    console.log("✅ Monthly expense check completed");
  } catch (error) {
    console.error("❌ Monthly expense check failed:", error);
  }
};
