// Requirements
const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // This will establish the connection
const bodyParser = require("body-parser");
const authRoutes = require("./routes/counsellorAuthRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const resetPasswordRoutes = require("./routes/resetPassword");
const sessionBooking = require("./routes/sessionBookingCounsellor");
const supportFromRoutes = require("./routes/supportFormRoutes");
const counsellorAvailabilityRoutes = require("./routes/counsellorAvailabilityRoutes");
const updateProfileRoutes = require("./routes/updateProfileRoutes");
const getCounsellorsRoutes = require("./routes/getCounsellorsRoutes.js");
const myActivityRoutes = require("./routes/myactivityRoutes.js");
const path = require("path");

const app = express();

require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

app.get("/", (req, res) => {
  res.send("Hello, form the police assessment server Backend!!");
});

// Serve uploaded files statically
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/otp", verificationRoutes);
app.use("/reset", resetPasswordRoutes);
app.use("/session", sessionBooking);
app.use("/help", supportFromRoutes);
app.use("/counsellor", counsellorAvailabilityRoutes);
app.use("/update", updateProfileRoutes);
app.use("/get-counsellors", getCounsellorsRoutes);
app.use("/myactivity", myActivityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
