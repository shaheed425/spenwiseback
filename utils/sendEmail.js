import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html, otp }) => {
  // 1. BREVO HTTP API (Port 443 - 300 free emails/day to ANY email address, works 100% on Render Free)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.EMAIL_USER || "spendwise.app@gmail.com";
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "SpendWise", email: senderEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || JSON.stringify(data));
      console.log(`📧 Email sent via Brevo API to ${to}:`, data.messageId);
      return data;
    } catch (err) {
      console.error("❌ Brevo API error:", err.message);
      throw err;
    }
  }

  // 2. RESEND HTTP API (Port 443 - works 100% on Render Free)
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

  // 3. SMTP fallback (Nodemailer - works in local development)
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
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    const info = await transporter.sendMail({
      from: `"SpendWise" <${emailUser}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent successfully via SMTP to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ SMTP sending failed (Render Free Tier blocks outbound SMTP ports 25, 465, 587):", error.message || error);
    throw new Error(error.message || "Email sending failed");
  }
};

export default sendEmail;
