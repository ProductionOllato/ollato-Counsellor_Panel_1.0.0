const express = require("express");
const {
  uploadCounsellorDocuments,
  addProfessionalDetails,
  addPersonalDetails,
  login,
} = require("../controllers/uploadCounsellorDocumentsController");

const router = express.Router();

router.post("/upload-documents", uploadCounsellorDocuments);
router.post("/upload-professional-details", addProfessionalDetails);
router.post("/upload-personal-details", addPersonalDetails);
router.post("/login", login);

module.exports = router;
