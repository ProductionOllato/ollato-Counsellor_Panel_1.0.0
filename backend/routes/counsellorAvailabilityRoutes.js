const express = require("express");
const {
  addCounsellorAvailability,
  updateAvailability,
} = require("../controllers/counsellorAvailabilityController");
const router = express.Router();

router.post("/set-availability", addCounsellorAvailability);
router.put("/update-availability", updateAvailability);

module.exports = router;
