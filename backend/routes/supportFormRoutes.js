const express = require("express");
const { supportForm, upload } = require("../controllers/supportFormController");
const router = express.Router();

// router.post("/support-form", supportForm);

router.post("/support-form", upload.single("screenshot"), supportForm);

module.exports = router;
