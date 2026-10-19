import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ================= REGISTER OTP =================
    otp: String,
    otpExpires: Date,

    // ================= FORGOT PASSWORD OTP =================
    resetPasswordOtp: String,
    resetPasswordExpires: Date,

    usertype: {
      type: String,
      default: "user",
    },

    // ================= MONTHLY ALERT TRACK =================
    // Prevents sending duplicate "expense > income" emails
    lastNegativeSavingsAlert: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
