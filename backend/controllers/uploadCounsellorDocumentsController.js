// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const db = require("../config/db"); // Ensure correct path to the db
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// // console.log(path.resolve("uploads"));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Create folders for uploads if they don't exist
//     const uploadFolder = path.join(__dirname, "../uploads");
//     if (!fs.existsSync(uploadFolder)) {
//       fs.mkdirSync(uploadFolder);
//     }

//     const fileTypeFolder = path.join(uploadFolder, file.fieldname);
//     if (!fs.existsSync(fileTypeFolder)) {
//       fs.mkdirSync(fileTypeFolder);
//     }

//     cb(null, fileTypeFolder); // Specify destination folder for each file
//   },
//   filename: (req, file, cb) => {
//     // Use original name with a timestamp to avoid name conflicts
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// // Add a file filter to allow only .pdf files and other desired formats
// const fileFilter = (req, file, cb) => {
//   const allowedFileTypes = /jpeg|jpg|png|pdf/; // Allow JPEG, JPG, PNG, PDF
//   const extname = allowedFileTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedFileTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true); // Accept the file
//   } else {
//     cb(new Error("Only images and PDFs are allowed"));
//   }
// };

// // Multer middleware for file uploads, now with fileFilter
// const upload = multer({ storage: storage, fileFilter: fileFilter }).fields([
//   { name: "profile_pic", maxCount: 1 },
//   { name: "degree_certificate", maxCount: 1 },
//   { name: "resume", maxCount: 1 },
//   { name: "aadhar_card_front", maxCount: 1 },
//   { name: "aadhar_card_back", maxCount: 1 },
//   { name: "pan_card", maxCount: 1 },
//   { name: "signature", maxCount: 1 },
// ]);
// // console.log("This is path: ", path.resolve("uploads"));

// // Controller to handle file uploads and saving to database
// const uploadCounsellorDocuments = async (req, res) => {
//   try {
//     // Ensure files are uploaded using Multer
//     await new Promise((resolve, reject) => {
//       upload(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//           console.error(`Multer error: ${err.message}`);
//           reject(new Error(`Multer error: ${err.message}`));
//         } else if (err) {
//           console.error(`Server error: ${err.message}`);
//           reject(new Error(`Server error: ${err.message}`));
//         } else {
//           console.log("File upload successful.");
//           resolve();
//         }
//       });
//     });

//     // Extracting uploaded file paths
//     const files = req.files;
//     const user_id = req.body.user_id;

//     // Set default to empty string if file is not uploaded
//     const profile_pic = files.profile_pic
//       ? `/uploads/profile_pic/${files.profile_pic[0].filename}`
//       : "";
//     const degree_certificate = files.degree_certificate
//       ? `/uploads/degree_certificate/${files.degree_certificate[0].filename}`
//       : "";
//     const resume = files.resume
//       ? `/uploads/resume/${files.resume[0].filename}`
//       : "";
//     const aadhar_card_front = files.aadhar_card_front
//       ? `/uploads/aadhar_card_front/${files.aadhar_card_front[0].filename}`
//       : "";
//     const aadhar_card_back = files.aadhar_card_back
//       ? `/uploads/aadhar_card_back/${files.aadhar_card_back[0].filename}`
//       : "";
//     const pan_card = files.pan_card
//       ? `/uploads/pan_card/${files.pan_card[0].filename}`
//       : "";
//     const signature = files.signature
//       ? `/uploads/signature/${files.signature[0].filename}`
//       : "";

//     // console.log("File paths set for upload:", {
//     //   profile_pic,
//     //   degree_certificate,
//     //   resume,
//     //   aadhar_card_front,
//     //   aadhar_card_back,
//     //   pan_card,
//     //   signature,
//     // });

//     // Storing document details into the database
//     const query = `
//       INSERT INTO documents_details
//       (user_id, profile_pic, degree_certificate, resume, aadhar_number, aadhar_card_front, aadhar_card_back, pan_number, pan_card, signature, professional_expertise)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     // Get other fields from the body (fields user fills)
//     const aadhar_number = req.body.aadhar_number;
//     const pan_number = req.body.pan_number;
//     const professional_expertise = req.body.professional_expertise;

//     // Execute the query to insert the document details using the promise API
//     const [result] = await db.query(query, [
//       user_id,
//       profile_pic,
//       degree_certificate,
//       resume,
//       aadhar_number,
//       aadhar_card_front,
//       aadhar_card_back,
//       pan_number,
//       pan_card,
//       signature,
//       professional_expertise,
//     ]);

//     res.status(200).json({
//       message: "Documents uploaded successfully",
//       data: result, // Ensure you're returning the result correctly
//     });
//   } catch (err) {
//     console.error("Error during document upload:", err.message); // Log the error
//     res.status(500).json({ message: `Error: ${err.message}` });
//   }
// };

// const addProfessionalDetails = async (req, res) => {
//   const { user_id, license_number, qualification, specification, experience } =
//     req.body;
//   // Check for missing required fields
//   if (
//     !user_id ||
//     !license_number ||
//     !qualification ||
//     !specification ||
//     !experience
//   ) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   const query = `
//         INSERT INTO professional_details (user_id, license_number, qualification, specification, experience)
//         VALUES (?, ?, ?, ?, ?)
//     `;

//   const values = [
//     user_id,
//     license_number,
//     qualification,
//     specification,
//     experience,
//   ];

//   try {
//     const [result] = await db.execute(query, values);
//     res.status(201).json({
//       message: "Professional details added successfully",
//       data: {
//         id: result.insertId,
//         user_id,
//         license_number,
//         qualification,
//         specification,
//         experience,
//       },
//     });
//   } catch (error) {
//     console.error("Error adding professional details:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding professional details" });
//   }
// };

// // add personal details

// const addPersonalDetails = async (req, res) => {
//   const {
//     first_name,
//     last_name,
//     email,
//     phone_number,
//     gender,
//     date_of_birth,
//     state,
//     district,
//     password,
//     confirm_password,
//   } = req.body;

//   // Check for missing required fields
//   if (
//     !first_name ||
//     !last_name ||
//     !email ||
//     !phone_number ||
//     !gender ||
//     !date_of_birth ||
//     !state ||
//     !district ||
//     !password ||
//     !confirm_password
//   ) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   // Check if password and confirm_password match
//   if (password !== confirm_password) {
//     return res.status(400).json({ error: "Passwords do not match" });
//   }

//   try {
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert data into the database
//     const query = `
//             INSERT INTO personal_details (
//                  first_name, last_name, email, phone_number, gender, date_of_birth, state, district, password
//             ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//     const values = [
//       first_name,
//       last_name,
//       email,
//       phone_number,
//       gender,
//       date_of_birth,
//       state,
//       district,
//       hashedPassword,
//     ];

//     const [result] = await db.execute(query, values);

//     // Respond with success
//     res.status(201).json({
//       message: "Personal details added successfully",
//       data: {
//         id: result.insertId,
//         first_name,
//         last_name,
//         email,
//         phone_number,
//         gender,
//         date_of_birth,
//         state,
//         district,
//       },
//     });
//   } catch (error) {
//     // Log the error and send an internal server error response
//     console.error("Error adding personal details:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding personal details" });
//   }
// };

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = path.join(__dirname, "../uploads");
    const fileTypeFolder = path.join(uploadFolder, file.fieldname);

    // Ensure directories exist
    if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
    if (!fs.existsSync(fileTypeFolder)) fs.mkdirSync(fileTypeFolder);

    cb(null, fileTypeFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// File filter for allowed formats
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("Only images and PDFs are allowed"));
};

const upload = multer({ storage, fileFilter }).fields([
  { name: "profile_pic", maxCount: 1 },
  { name: "degree_certificate", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "aadhar_card_front", maxCount: 1 },
  { name: "aadhar_card_back", maxCount: 1 },
  { name: "pan_card", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

// Handle counsellor documents upload
const uploadCounsellorDocuments = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const files = req.files;
    const user_id = req.body.user_id;

    const filePaths = {
      profile_pic: files.profile_pic
        ? `/uploads/profile_pic/${files.profile_pic[0].filename}`
        : "",
      degree_certificate: files.degree_certificate
        ? `/uploads/degree_certificate/${files.degree_certificate[0].filename}`
        : "",
      resume: files.resume ? `/uploads/resume/${files.resume[0].filename}` : "",
      aadhar_card_front: files.aadhar_card_front
        ? `/uploads/aadhar_card_front/${files.aadhar_card_front[0].filename}`
        : "",
      aadhar_card_back: files.aadhar_card_back
        ? `/uploads/aadhar_card_back/${files.aadhar_card_back[0].filename}`
        : "",
      pan_card: files.pan_card
        ? `/uploads/pan_card/${files.pan_card[0].filename}`
        : "",
      signature: files.signature
        ? `/uploads/signature/${files.signature[0].filename}`
        : "",
    };

    const query = `
      INSERT INTO documents_details 
      (user_id, profile_pic, degree_certificate, resume, aadhar_number, aadhar_card_front, aadhar_card_back, pan_number, pan_card, signature, professional_expertise)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      filePaths.profile_pic,
      filePaths.degree_certificate,
      filePaths.resume,
      req.body.aadhar_number,
      filePaths.aadhar_card_front,
      filePaths.aadhar_card_back,
      req.body.pan_number,
      filePaths.pan_card,
      filePaths.signature,
      req.body.professional_expertise,
    ];

    const [result] = await db.execute(query, values);

    res
      .status(200)
      .json({ message: "Documents uploaded successfully", data: result });
  } catch (err) {
    console.error("Error uploading documents:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const addProfessionalDetails = async (req, res) => {
  const { user_id, license_number, qualification, specification, experience } =
    req.body;
  // Check for missing required fields
  if (
    !user_id ||
    !license_number ||
    !qualification ||
    !specification ||
    !experience
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO professional_details (user_id, license_number, qualification, specification, experience)
        VALUES (?, ?, ?, ?, ?)
    `;

  const values = [
    user_id,
    license_number,
    qualification,
    specification,
    experience,
  ];

  try {
    const [result] = await db.execute(query, values);
    res.status(201).json({
      message: "Professional details added successfully",
      data: {
        id: result.insertId,
        user_id,
        license_number,
        qualification,
        specification,
        experience,
      },
    });
  } catch (error) {
    console.error("Error adding professional details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding professional details" });
  }
};

// Add personal details with duplicate check
const addPersonalDetails = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    gender,
    date_of_birth,
    state,
    district,
    password,
    confirm_password,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone_number ||
    !gender ||
    !date_of_birth ||
    !state ||
    !district ||
    !password ||
    !confirm_password
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const [existingUser] = await db.execute(
      "SELECT email FROM personal_details WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO personal_details (first_name, last_name, email, phone_number, gender, date_of_birth, state, district, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      first_name,
      last_name,
      email,
      phone_number,
      gender,
      date_of_birth,
      state,
      district,
      hashedPassword,
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      message: "Registration successful",
      data: { id: result.insertId, email },
    });
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if the user exists
    const query = `SELECT * FROM personal_details WHERE email = ?`;
    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "You don't have an account. Please register." });
    }

    const user = rows[0];

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { user_id: user.id, email: user.email }, // Payload
      process.env.JWT_SECRET // Secret key
    );

    // Log user details to the console
    // console.log(`User Logged In:`, {
    //   user_id: user.id,
    //   first_name: user.first_name,
    //   phone_number: user.phone_number,
    // });

    // Respond with user details and token
    res.status(200).json({
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
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
};

module.exports = {
  uploadCounsellorDocuments,
  addProfessionalDetails,
  addPersonalDetails,
  login,
};
