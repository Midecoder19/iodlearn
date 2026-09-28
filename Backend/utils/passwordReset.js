const crypto = require("crypto");
const sendMail = require("./sendMail");

const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates a password-reset token, stores it (in plaintext, matching the
 * existing forgot-password/reset-password flow), and emails the reset link.
 *
 * Both the self-service forgot-password endpoint and the admin-triggered
 * password-reset endpoint call this single function so the token handling
 * and email logic can never drift apart.
 *
 * NOTE: the token is stored in plaintext on the user document. This matches
 * the existing behavior of reset-password/:token (which queries
 * `User.findOne({ resetToken: token })`). If a future change hashes the
 * token before storage, BOTH paths must be updated together — which is
 * exactly what this shared function guarantees.
 */
const generateAndStoreResetToken = async (user, triggeredBy = "self") => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + RESET_TOKEN_TTL_MS;
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || "https://iodlearn.vercel.app").replace(/\/$/, "");
  const resetLink = `${clientUrl}/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Reset your password - Iodlearn",
    html: require("./emailTemplates").resetPasswordTemplate(resetLink, user.name),
  });

  return resetToken;
};

module.exports = { generateAndStoreResetToken, RESET_TOKEN_TTL_MS };