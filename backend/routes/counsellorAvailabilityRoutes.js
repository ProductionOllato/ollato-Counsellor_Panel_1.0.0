const express = require("express");
const {
  addCounsellorAvailability,
  updateAvailability,
  deleteAvailability,
  getCounsellorAvailability,
} = require("../controllers/counsellorAvailabilityController");
const router = express.Router();

router.post("/set-availability", addCounsellorAvailability);
router.put("/update-availability", updateAvailability);
router.delete("/delete-availability", deleteAvailability);
router.post("/get-availability", getCounsellorAvailability);

module.exports = router;
