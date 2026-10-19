// import cron from "node-cron";
// import { checkMonthlyExpenseVsIncome } from "./monthlyExpenseCheck.js";

// // 🕘 Run at 9 AM on the 1st day of every month
// cron.schedule("* * * * *", async () => {
//   try {
//     console.log("⏰ Monthly expense check started...");
//     await checkMonthlyExpenseVsIncome();
//   } catch (error) {
//     console.error("❌ Monthly expense check failed:", error);
//   }
// });


import cron from "node-cron";
import mongoose from "mongoose";
import { checkMonthlyExpenseVsIncome } from "./monthlyExpenseCheck.js";

// 🕘 Run at 9 AM on the 1st day of every month
cron.schedule("0 9 1 * *", async () => {
  // 🛑 Skip if MongoDB is not connected
  if (mongoose.connection.readyState !== 1) {
    console.log("⚠️ Monthly cron skipped — MongoDB not connected");
    return;
  }

  try {
    console.log("⏰ Monthly expense check started...");
    await checkMonthlyExpenseVsIncome();
  } catch (error) {
    console.error("❌ Monthly expense check failed:", error.message);
  }
});