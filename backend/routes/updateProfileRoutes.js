const express = require("express");
const {
  updatePersonalDetails,
  updateProfessionalDetails,
  updateCounsellorProfilePic,
} = require("../controllers/updateProfileController");
const router = express.Router();

// Define routes
router.put("/personal-details/:id", updatePersonalDetails);
router.put("/professional-details/:id", updateProfessionalDetails);
router.post("/documents-details/profile-pic/:id", updateCounsellorProfilePic);

module.exports = router;
