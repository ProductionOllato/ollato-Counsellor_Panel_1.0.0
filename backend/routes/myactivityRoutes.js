const express = require("express");

const { getMyActivity } = require("../controllers/myactivityController");

const router = express.Router();

router.get("/get-myactivity/:counsellor_id", getMyActivity);

module.exports = router;
