import User from "../models/user.js";
import Expense from "../models/expense.js";
import Income from "../models/income.js";
import bcrypt from "bcryptjs";

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Expense.deleteMany({ user: userId });
    await Income.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
