const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../config/db"); // Adjust based on your DB setup

// Configurations (Replace with environment variables)
const RESET_TOKEN_SECRET =
  process.env.RESET_TOKEN_SECRET || "reset-token-secret";
const RESET_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

// Email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Adjust to your email provider
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Step 1: Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const [user] = await db.query(
      "SELECT email FROM personal_details WHERE email = ?",
      [email]
    );
    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random reset token and hash it
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Calculate the expiration time (current time + 15 minutes)
    const expiryTime =
      Math.floor(Date.now() / 1000) + RESET_TOKEN_EXPIRY / 1000;

    // Save token and expiry in the database
    await db.query(
      "UPDATE personal_details SET reset_token = ?, reset_token_expiry = FROM_UNIXTIME(?) WHERE email = ?",
      [hashedToken, expiryTime, email]
    );

    // Generate reset password link
    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    // Send reset link email
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res
      .status(200)
      .json({ message: "Reset password link sent to your email." });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Error requesting password reset", error });
  }
};

// Step 2: Validate Token
exports.validateResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    // Hash the provided token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Check if the token exists and has not expired
    const [user] = await db.query(
      "SELECT email FROM personal_details WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [hashedToken]
    );

    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "Error validating token", error });
  }
};

// Step 3: Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params; // Token from the URL
  const { newPassword } = req.body; // New password from the request body

  try {
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Hash the token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Check if the token exists and is not expired
    const [user] = await db.query(
      "SELECT email FROM personal_details WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [hashedToken]
    );

    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the reset token fields
    await db.query(
      "UPDATE personal_details SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?",
      [hashedPassword, user[0].email]
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
};
