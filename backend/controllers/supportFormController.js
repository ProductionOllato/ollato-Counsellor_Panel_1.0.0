// const express = require("express");
// const db = require("../config/db"); // Adjust the path as necessary

// const multer = require("multer");

// // Configure Multer to store uploaded files in memory for processing
// const storage = multer.memoryStorage(); // Files are stored in memory as Buffer
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
//   fileFilter: (req, file, cb) => {
//     // Optional: Add file type validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images are allowed"), false);
//     }
//   },
// });

// module.exports.upload = upload;

// exports.supportForm = async (req, res) => {
//   const {
//     counsellor_id, // Required
//     session_id = "",
//     name = "",
//     email = "",
//     query_type = "",
//   } = req.body;

//   const screenshot = req.file ? req.file.buffer : null; // Optional image upload

//   // Check if the required field `counsellor_id` is present
//   if (!counsellor_id) {
//     return res.status(400).json({ msg: "counsellor_id is required" });
//   }

//   try {
//     // SQL query to insert the data into the support_form table
//     const query = `
//           INSERT INTO support_form (counsellor_id, session_id, name, email, query_type, screenshot)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `;

//     await db.query(query, [
//       counsellor_id,
//       session_id,
//       name,
//       email,
//       query_type,
//       screenshot,
//     ]);

//     res.status(201).json({ msg: "Support form submitted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// };

// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const db = require("../config/db"); // Adjust the path as necessary

// // Configure Multer to store uploaded files in memory for processing
// const storage = multer.memoryStorage(); // Files are stored in memory as Buffer
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
//   fileFilter: (req, file, cb) => {
//     // Optional: Add file type validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images are allowed"), false);
//     }
//   },
// });

// module.exports.upload = upload;

// exports.supportForm = async (req, res) => {
//   const {
//     counsellor_id, // Required
//     session_id = "",
//     name = "",
//     email = "",
//     query_type = "",
//   } = req.body;

//   const screenshot = req.file; // Uploaded file information

//   // Check if the required field `counsellor_id` is present
//   if (!counsellor_id) {
//     return res.status(400).json({ msg: "counsellor_id is required" });
//   }

//   try {
//     let screenshotPath = null;

//     // Save the screenshot to the screenshots folder
//     if (screenshot) {
//       const screenshotsDir = path.join(__dirname, "../uploads/screenshots");

//       // Ensure the directory exists
//       if (!fs.existsSync(screenshotsDir)) {
//         fs.mkdirSync(screenshotsDir, { recursive: true });
//       }

//       // Generate a unique filename
//       const filename = `${Date.now()}-${screenshot.originalname}`;
//       screenshotPath = path.join("uploads/screenshots", filename);

//       // Save the file to the specified path
//       fs.writeFileSync(
//         path.join(__dirname, "../", screenshotPath),
//         screenshot.buffer
//       );
//     }

//     // SQL query to insert the data into the support_form table
//     const query = `
//       INSERT INTO support_form (counsellor_id, session_id, name, email, query_type, screenshot)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     await db.query(query, [
//       counsellor_id,
//       session_id,
//       name,
//       email,
//       query_type,
//       screenshotPath,
//     ]);

//     res.status(201).json({ msg: "Support form submitted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// };

const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../config/db"); // Adjust the path as necessary

const multer = require("multer");

// Configure Multer to store uploaded files in memory for processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

module.exports.upload = upload;

exports.supportForm = async (req, res) => {
  // console.log("req-body",req.body);
  
  const {
    counsellor_id, // Required
    session_id = "",
    name = "",
    email = "",
    query_type = "",
  } = req.body;

  const screenshot = req.file; // Uploaded file information

  // Check if the required field `counsellor_id` is present
  if (!counsellor_id) {
    return res.status(400).json({ msg: "counsellor_id is required" });
  }

  try {
    let screenshotPath = null;

    // Save the screenshot to the screenshots folder
    if (screenshot) {
      const screenshotsDir = path.join(__dirname, "../uploads/screenshots");

      // Ensure the directory exists
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Generate a unique filename
      const filename = `${Date.now()}-${screenshot.originalname}`;
      screenshotPath = path.join("uploads/screenshots", filename);

      // Save the file to the specified path
      fs.writeFileSync(
        path.join(__dirname, "../", screenshotPath),
        screenshot.buffer
      );
    }

    // Insert data into the database, saving only the file path
    const query = `
      INSERT INTO support_form (counsellor_id, session_id, name, email, query_type, screenshot)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      counsellor_id,
      session_id,
      name,
      email,
      query_type,
      screenshotPath, // Save the file path as a string
    ]);

    res.status(201).json({ msg: "Support form submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
