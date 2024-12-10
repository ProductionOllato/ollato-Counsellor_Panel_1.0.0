const nodemailer = require("nodemailer");
const moment = require("moment");
require("dotenv").config();

// Simulated temporary storage for OTPs (use Redis or a database for production)
let emailOtpStore = {};

// OTP expiration time: 5 minutes
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

// Configure the mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.MAIL_USER, // Your email address
    pass: process.env.MAIL_PASS, // Your email password or app-specific password
  },
});

// Send OTP to email
exports.sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  console.log("email", email);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  // Generate a 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Store OTP with expiration time
  const otpData = {
    otp,
    expiresAt: moment().add(5, "minutes").toISOString(),
  };
  emailOtpStore[email] = otpData;

  // Email content
  const mailOptions = {
    from: '"Ollato Support" <info@ollato.com>', // Sender address
    to: email, // Receiver email
    subject: "Your Ollato OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes. Please do not share it with anyone.`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

// Verify Email OTP
exports.verifyEmailOtp = (req, res) => {
  const { email, enteredOtp } = req.body;
  console.log("email", email);
  console.log("enteredOtp", enteredOtp);

  if (!email || !enteredOtp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  // Check if OTP exists for the email
  const otpData = emailOtpStore[email];
  if (!otpData) {
    return res
      .status(400)
      .json({ message: "OTP not found. Please request a new OTP." });
  }

  // Check if OTP has expired
  if (moment().isAfter(moment(otpData.expiresAt))) {
    delete emailOtpStore[email]; // OTP expired, delete it
    return res
      .status(400)
      .json({ message: "OTP expired. Please request a new OTP." });
  }

  // Compare the entered OTP with the stored OTP
  if (parseInt(enteredOtp) === otpData.otp) {
    delete emailOtpStore[email]; // Clear OTP after successful verification
    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } else {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }
};
