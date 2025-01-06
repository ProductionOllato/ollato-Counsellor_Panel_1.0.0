const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
} = require("../controllers/resetPasswordController");

// Request a password reset
router.post("/request-password-reset", requestPasswordReset);

// Validate reset token
router.get("/reset-password/:token", validateResetToken);

// Reset password
router.post("/reset-password/:token", resetPassword);

module.exports = router;
