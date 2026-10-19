import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

// 🔌 Connect database FIRST
connectDB();

const app = express();

// ✅ CORS Configuration (Supports Local & Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://spenwise-x4ux.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 🧩 Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚦 Routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("SpendWise API running 🚀");
});

// ❗ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ✅ START CRON JOB
import("./utils/cron.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("Mongo URI:", process.env.MONGO_URI);