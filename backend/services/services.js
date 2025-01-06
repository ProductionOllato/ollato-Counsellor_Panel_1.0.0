// const axios = require("axios");
// const moment = require("moment");
// const db = require("../config/db");

// // Simulate a temporary storage for OTP (you can use Redis or Database)
// let otpStore = {}; // Object to hold OTPs temporarily

// // OTP expiration time: 5 minutes
// const OTP_EXPIRATION_TIME = 1 * 60 * 1000; // OTP expires after 5 minutes

// // Generate and send OTP
// exports.sendOtp = async (req, res) => {
//   let { phoneNumber } = req.body;
//   console.log("Phone Number", phoneNumber);

//   if (!phoneNumber) {
//     return res.status(400).json({ message: "Phone number is required." });
//   }

//   // Normalize phone number
//   const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");

//   // Generate a 4-digit OTP
//   const otp = Math.floor(1000 + Math.random() * 9000);

//   // Store OTP with expiration time
//   const otpData = {
//     otp,
//     expiresAt: moment().add(5, "minutes").toISOString(), // OTP expires in 5 minutes
//   };
//   // otpStore[phoneNumber] = otpData;
//   otpStore[normalizedPhoneNumber] = otpData;
//   // Log stored OTP
//   console.log("Stored OTP for phoneNumber:", normalizedPhoneNumber, otpData);
//   console.log("All OTPs in otpStore:", otpStore);

//   // Send OTP using MSG91 API
//   try {
//     // Ensure the phone number is prefixed with '91' (India)
//     if (!phoneNumber.startsWith("91")) {
//       phoneNumber = "91" + phoneNumber;
//     }
//     console.log(phoneNumber);
//     // const message = `Your OTP is ${otp}. It is valid for 5 minutes.`;

//     const response = await axios.post(
//       "https://control.msg91.com/api/v5/flow/",
//       {
//         authkey: "332159AeEpfWkj7GC5ee22927P1",
//         mobiles: phoneNumber,
//         // message: message,
//         var: otp, // This should be the OTP that you are sending
//         // sender: "OLLATO", // Replace with your sender ID registered on MSG91
//         template_id: "6618fc1bd6fc0558e7681454", // Replace with your actual template ID
//       }
//     );

//     if (response.data.type === "success") {
//       res.status(200).json({ message: "OTP sent successfully." });
//     } else {
//       res.status(500).json({ message: "Failed to send OTP." });
//     }
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// // Verify OTP
// exports.verifyOtp = (req, res) => {
//   const { phoneNumber, enteredOtp } = req.body;

//   console.log("Received phoneNumber:", phoneNumber);
//   console.log("Received enteredOtp:", enteredOtp);
//   console.log("Frontend Sent Data:", {
//     phoneNumber: phoneNumber,
//     enteredOtp: enteredOtp,
//   });

//   if (!phoneNumber || !enteredOtp) {
//     return res
//       .status(400)
//       .json({ message: "Phone number and OTP are required." });
//   }

//   console.log("All OTPs in Store:", otpStore);
//   console.log("Looking for OTP for phoneNumber:", phoneNumber);
//   console.log("Matching key exists:", otpStore.hasOwnProperty(phoneNumber));

//   // Check if OTP exists for the phone number
//   const otpData = otpStore[phoneNumber];
//   console.log("Stored OTP data:", otpData);

//   if (!otpData) {
//     return res
//       .status(400)
//       .json({ message: "OTP not found. Please request a new OTP." });
//   }

//   // Check if OTP has expired
//   if (moment().isAfter(moment(otpData.expiresAt))) {
//     delete otpStore[phoneNumber]; // OTP expired, delete it
//     return res
//       .status(400)
//       .json({ message: "OTP expired. Please request a new OTP." });
//   }

//   // Compare the entered OTP with the stored OTP
//   if (parseInt(enteredOtp) === otpData.otp) {
//     delete otpStore[phoneNumber]; // Clear OTP after successful verification
//     return res
//       .status(200)
//       .json({ success: true, message: "OTP verified successfully." });
//   } else {
//     return res.status(400).json({ message: "Invalid OTP. Please try again." });
//   }
// };

// // Login with OTP
// exports.loginWithOtp = async (req, res) => {
//   const { phoneNumber, enteredOtp } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({ message: "Phone number is required." });
//   }

//   if (!enteredOtp) {
//     // Send OTP
//     return exports.sendOtp(req, res);
//   }

//   const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

//   try {
//     // Verify OTP
//     const otpData = otpStore[normalizedPhoneNumber];

//     if (!otpData) {
//       return res
//         .status(400)
//         .json({ message: "OTP not found. Please request a new OTP." });
//     }

//     const { otp, expiresAt } = otpData;

//     if (moment().isAfter(moment(expiresAt))) {
//       delete otpStore[normalizedPhoneNumber];
//       return res
//         .status(400)
//         .json({ message: "OTP expired. Please request a new OTP." });
//     }

//     if (parseInt(enteredOtp) !== otp) {
//       return res
//         .status(400)
//         .json({ message: "Invalid OTP. Please try again." });
//     }

//     // OTP is valid; delete it from memory
//     delete otpStore[normalizedPhoneNumber];

//     // Check if user exists
//     const userQuery = `SELECT * FROM personal_details WHERE phone_number = ?`;
//     const [userRows] = await db.execute(userQuery, [normalizedPhoneNumber]);

//     if (userRows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "You don't have an account. Please register." });
//     }

//     const user = userRows[0];

//     // Generate JWT token
//     const token = jwt.sign(
//       { user_id: user.id, phone_number: user.phone_number }, // Payload
//       process.env.JWT_SECRET // Secret key
//     );

//     return res.status(200).json({
//       message: "User logged in successfully",
//       token,
//       user: {
//         user_id: user.id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         phone_number: user.phone_number,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error during login with OTP:", error);
//     return res.status(500).json({ message: "Failed to log in with OTP." });
//   }
// };

const axios = require("axios");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// In-memory OTP store
let otpStore = {}; // Key: phoneNumber, Value: { otp, expiresAt }

// Constants
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

// Utility function to normalize phone numbers
const normalizePhoneNumber = (phoneNumber) => phoneNumber.replace(/\D/g, "");

// Generate and send OTP
exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP
  const expiresAt = moment().add(5, "minutes").toISOString(); // Expiry time

  // Save OTP in memory
  otpStore[normalizedPhoneNumber] = { otp, expiresAt };
  try {
    // Send OTP using MSG91
    await axios.post("https://control.msg91.com/api/v5/flow/", {
      authkey: "332159AeEpfWkj7GC5ee22927P1",
      mobiles: normalizedPhoneNumber.startsWith("91")
        ? normalizedPhoneNumber
        : "91" + normalizedPhoneNumber,
      var: otp,
      template_id: "6618fc1bd6fc0558e7681454",
    });

    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Failed to send OTP." });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phoneNumber, enteredOtp } = req.body;

  if (!phoneNumber || !enteredOtp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required." });
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  // Retrieve OTP from in-memory store
  const otpData = otpStore[normalizedPhoneNumber];

  if (!otpData) {
    return res
      .status(400)
      .json({ message: "OTP not found. Please request a new OTP." });
  }

  const { otp, expiresAt } = otpData;

  // Check if OTP has expired
  if (moment().isAfter(moment(expiresAt))) {
    delete otpStore[normalizedPhoneNumber]; // Remove expired OTP
    return res
      .status(400)
      .json({ message: "OTP expired. Please request a new OTP." });
  }

  // Validate OTP
  if (parseInt(enteredOtp) !== otp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  // OTP is valid; delete it from memory
  delete otpStore[normalizedPhoneNumber];

  return res
    .status(200)
    .json({ success: true, message: "OTP verified successfully." });
};

// Login with OTP
exports.loginWithOtp = async (req, res) => {
  const { phoneNumber, enteredOtp } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  if (!enteredOtp) {
    // Send OTP
    return exports.sendOtp(req, res);
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  try {
    // Verify OTP
    const otpData = otpStore[normalizedPhoneNumber];

    if (!otpData) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please request a new OTP." });
    }

    const { otp, expiresAt } = otpData;

    if (moment().isAfter(moment(expiresAt))) {
      delete otpStore[normalizedPhoneNumber];
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new OTP." });
    }

    if (parseInt(enteredOtp) !== otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again." });
    }

    // OTP is valid; delete it from memory
    delete otpStore[normalizedPhoneNumber];

    // Check if user exists
    const userQuery = `SELECT * FROM personal_details WHERE phone_number = ?`;
    const [userRows] = await db.execute(userQuery, [normalizedPhoneNumber]);

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "You don't have an account. Please register." });
    }

    const user = userRows[0];

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.id, phone_number: user.phone_number }, // Payload
      process.env.JWT_SECRET // Secret key
    );

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login with OTP:", error);
    return res.status(500).json({ message: "Failed to log in with OTP." });
  }
};
