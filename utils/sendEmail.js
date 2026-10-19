import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) {
    console.error("❌ Email credentials missing in environment variables (EMAIL_USER or EMAIL_PASS)");
    throw new Error("Email credentials missing on server (EMAIL_USER / EMAIL_PASS)");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL on port 465 is the most reliable on cloud hosts like Render
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
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
    console.error("❌ Email sending failed:", error.message || error);
    throw new Error(error.message || "Email could not be sent");
  }
};

export default sendEmail;
