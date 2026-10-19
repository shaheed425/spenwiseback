import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

import User from "../models/user.js";
import Expense from "../models/expense.js";
import Income from "../models/income.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= REGISTER (SEND OTP) ================= */
export const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await User.findOne({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (exists) {
      if (exists.isVerified) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // If user exists but not verified, update details and resend OTP
      exists.firstname = firstname;
      exists.lastname = lastname;
      exists.password = hashedPassword;
      exists.otp = otp;
      exists.otpExpires = Date.now() + 10 * 60 * 1000;
      await exists.save();

      let emailSent = false;
      try {
        await sendEmail({
          to: email,
          subject: "SpendWise OTP Verification",
          html: `
            <h2>Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>Valid for 10 minutes</p>
          `,
          otp,
        });
        emailSent = true;
      } catch (emailError) {
        console.warn("⚠️ Email delivery issue (Render Free SMTP block):", emailError.message);
      }

      return res.status(200).json({
        message: "OTP sent to your email",
      });
    }

    // Create the user in database first
    await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    let emailSent = false;
    try {
      await sendEmail({
        to: email,
        subject: "SpendWise OTP Verification",
        html: `
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>Valid for 10 minutes</p>
        `,
        otp,
      });
      emailSent = true;
    } catch (emailError) {
      console.warn("⚠️ Email delivery issue (Render Free SMTP block):", emailError.message);
    }

    return res.status(201).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.usertype !== "admin" && !user.isVerified) {
      return res.status(403).json({ message: "Verify email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, usertype: user.usertype },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        usertype: user.usertype,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP as reset token
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    let emailSent = false;
    try {
      await sendEmail({
        to: email,
        subject: "SpendWise Password Reset",
        html: `
          <h2>Password Reset</h2>
          <p>Your OTP:</p>
          <h1>${resetOtp}</h1>
          <p>Valid for 10 minutes</p>
        `,
        otp: resetOtp,
      });
      emailSent = true;
    } catch (emailError) {
      console.warn("⚠️ Reset email delivery issue (Render Free SMTP block):", emailError.message);
    }

    return res.status(200).json({
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordOtp: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DASHBOARD ================= */
export const getUserDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const expenses = await Expense.find({ user: id });
    const income = await Income.find({ user: id });

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = income.reduce((s, i) => s + i.amount, 0);

    res.json({
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
