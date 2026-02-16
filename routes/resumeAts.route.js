const { Router } = require("express");
const multer = require("multer");
const { calculateAtsScore } = require("../controller/atsResume.controller");

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/resume/ats", upload.single("resumeFile"), calculateAtsScore);

module.exports = router;
