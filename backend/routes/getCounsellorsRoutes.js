const express = require("express");
const {
  getCounsellorPersonalInfo,
  getCounsellorProfessionalInfo,
} = require("../controllers/getCounsellorInfoController");

const router = express.Router();

router.get("/personal-info/:id", getCounsellorPersonalInfo);
router.get("/professional-info/:user_id", getCounsellorProfessionalInfo);

module.exports = router;
