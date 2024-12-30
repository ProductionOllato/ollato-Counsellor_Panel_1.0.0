const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
} = require("../controllers/resetPasswordController");

const checkmeddle = (req, res, next) => {
  console.log("checkmeddle->", req.body);
  console.log("checkmeddle->", req.params);

  next();
};

// Request a password reset
router.post("/request-password-reset", checkmeddle, requestPasswordReset);

// Validate reset token
router.get("/reset-password/:token", checkmeddle, validateResetToken);

// Reset password
router.post("/reset-password/:token", checkmeddle, resetPassword);

module.exports = router;
