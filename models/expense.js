import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
