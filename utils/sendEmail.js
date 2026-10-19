import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // ✅ Verify transporter (helps debug auth issues)
    await transporter.verify();

    await transporter.sendMail({
      from: `"SpendWise" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent successfully to ${to}`);

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
