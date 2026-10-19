import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html, otp }) => {
  // Always log OTP in server logs so it is immediately visible in Render Dashboard -> Logs
  if (otp) {
    console.log(`\n========================================`);
    console.log(`🔑 SPENDWISE OTP FOR ${to}: [ ${otp} ]`);
    console.log(`========================================\n`);
  }

  // 1. If RESEND_API_KEY is configured, use Resend HTTP API (Port 443 - works 100% on Render Free)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "SpendWise <onboarding@resend.dev>",
          to: [to],
          subject: subject,
          html: html,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || JSON.stringify(data));
      console.log(`📧 Email sent via Resend HTTP API to ${to}:`, data.id);
      return data;
    } catch (err) {
      console.error("❌ Resend API error:", err.message);
      throw err;
    }
  }

  // 2. SMTP fallback (Nodemailer)
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) {
    console.warn("⚠️ Email credentials missing in environment variables (EMAIL_USER / EMAIL_PASS)");
    throw new Error("Email credentials missing on server");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 4000, // 4 seconds quick timeout so request doesn't hang
      greetingTimeout: 4000,
      socketTimeout: 4000,
    });

    const info = await transporter.sendMail({
      from: `"SpendWise" <${emailUser}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ SMTP sending failed (Render Free Tier blocks outbound SMTP ports 25, 465, 587):", error.message || error);
    throw new Error(error.message || "Email sending failed");
  }
};

export default sendEmail;
