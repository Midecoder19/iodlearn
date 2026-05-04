const axios = require("axios");

const sendMail = async ({ to, subject, text, html }) => {
  if (!to) throw new Error("Recipient email (to) is required");

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || "iodlearn.com@gmail.com";
  const FROM_NAME = process.env.FROM_NAME || "Iodlearn";

  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY is not configured");
    throw new Error("Email service is not configured");
  }

  const mailOptions = {
    to: [{ email: to }],
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    subject,
    textContent: text,
    htmlContent: html || `<p>${text}</p>`,
  };

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      mailOptions,
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Email sent via Brevo:", response.data.messageId);
    return response.data;
  } catch (error) {
    console.error(
      "Brevo email error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendMail;
