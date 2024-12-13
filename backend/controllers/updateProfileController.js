// Import necessary modules
const db = require("../config/db"); // Assuming your DB connection is in config/db.js
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Utility function to build dynamic SQL queries
const buildUpdateQuery = (table, fields, id) => {
  const columns = Object.keys(fields)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(fields);
  const query = `UPDATE ${table} SET ${columns} WHERE id = ?`;
  return { query, values: [...values, id] };
};

// Update personal details
exports.updatePersonalDetails = async (req, res) => {
  const { id } = req.params;
  let updates = req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({
      message: "Invalid request. ID and at least one field are required.",
    });
  }

  try {
    // Check if email exists in updates
    if (updates.email) {
      const [emailCheck] = await db.execute(
        "SELECT id FROM personal_details WHERE email = ? AND id != ?",
        [updates.email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }

    // Hash the password if it is being updated
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Build and execute the update query
    const { query, values } = buildUpdateQuery("personal_details", updates, id);
    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Counselor not found." });
    }

    res.status(200).json({ message: "Personal details updated successfully." });
  } catch (error) {
    console.error("Error updating personal details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update professional details
exports.updateProfessionalDetails = async (req, res) => {
  const { id } = req.params; // The id from the URL
  const updates = req.body; // The fields to update

  // console.log("Request body - ProfessionalDetails:", req.body);

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({
      message: "Invalid request. ID and at least one field are required.",
    });
  }

  try {
    // Build and execute the update query, using 'user_id' instead of 'id'
    const { query, values } = buildUpdateQuery(
      "professional_details", // Table name
      updates, // Fields to update
      id // The id from the route (which corresponds to 'user_id' in the database
    );

    // Modify the query to use 'user_id' instead of 'id' in the WHERE clause
    const updatedQuery = query.replace("WHERE id = ?", "WHERE user_id = ?");

    // Execute the modified query
    const [result] = await db.execute(updatedQuery, values);

    // console.log("Result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Professional details not found for the given user.",
      });
    }

    res
      .status(200)
      .json({ message: "Professional details updated successfully." });
  } catch (error) {
    console.error("Error updating professional details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// update profile

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }

    const fileTypeFolder = path.join(uploadFolder, "profile_pic");
    if (!fs.existsSync(fileTypeFolder)) {
      fs.mkdirSync(fileTypeFolder);
    }

    cb(null, fileTypeFolder); // Specify destination folder for the profile_pic
  },
  filename: (req, file, cb) => {
    // Use original name with a timestamp to avoid name conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Multer middleware to handle the profile picture update
const uploadProfilePic = multer({ storage: storage }).single("profile_pic");

exports.updateCounsellorProfilePic = async (req, res) => {
  console.log("Starting profile picture update process...");

  console.log("Request body - CounsellorProfilePic:", req.body);

  try {
    // Ensure file is uploaded using Multer
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.error(`Multer error: ${err.message}`);
          reject(new Error(`Multer error: ${err.message}`));
        } else if (err) {
          console.error(`Server error: ${err.message}`);
          reject(new Error(`Server error: ${err.message}`));
        } else {
          console.log("File upload successful.");
          resolve();
        }
      });
    });

    // Correctly access user_id from the route parameter
    const user_id = req.params.id; // Use 'id' from the route
    const newProfilePic = req.file
      ? `/uploads/profile_pic/${req.file.filename}`
      : "";

    console.log(`Received user_id: ${user_id}`);
    console.log("New profile picture:", newProfilePic);

    if (!newProfilePic) {
      return res.status(400).json({ message: "No profile picture uploaded." });
    }

    // Check if the user exists in the documents_details table
    const [existingDoc] = await db.query(
      "SELECT * FROM documents_details WHERE user_id = ?",
      [user_id]
    );

    if (existingDoc.length === 0) {
      return res.status(404).json({ message: "Counselor not found." });
    }

    // Update the profile_pic in the documents_details table
    const updateQuery = `
          UPDATE documents_details 
          SET profile_pic = ? 
          WHERE user_id = ?
        `;

    const [updateResult] = await db.query(updateQuery, [
      newProfilePic,
      user_id,
    ]);

    console.log("Database update result:", updateResult);

    if (updateResult.affectedRows > 0) {
      return res.status(200).json({
        message: "Profile picture updated successfully.",
        data: updateResult,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to update profile picture." });
    }
  } catch (err) {
    console.error("Error during profile picture update:", err.message);
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};
