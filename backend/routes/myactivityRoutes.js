const express = require("express");

const {
  getMyActivity,
  getFeedback,
} = require("../controllers/myactivityController");

const router = express.Router();

router.get("/get-myactivity/:counsellor_id", getMyActivity);
router.post("/get-feedback/:session_id", getFeedback);

module.exports = router;
