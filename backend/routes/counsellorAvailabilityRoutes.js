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
router.get("/get-availability/:counsellor_id", getCounsellorAvailability);

module.exports = router;
