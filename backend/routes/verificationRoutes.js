const express = require("express");
const { sendOtp, verifyOtp } = require("../services/services");
const {
  sendEmailOtp,
  verifyEmailOtp,
} = require("../services/emailVerification");

const router = express.Router();

router.post("/mobile-otp", sendOtp);
router.post("/verify-mobile-otp", verifyOtp);
router.post("/email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

module.exports = router;
