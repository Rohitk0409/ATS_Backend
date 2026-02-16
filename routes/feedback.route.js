const { Router } = require("express");
const multer = require("multer");
const {
  createFeedBack,
  getAllFeedBacks,
} = require("../controller/feedBack.controller");
const router = Router();

router.post("/feedback", createFeedBack);
router.get("/feedback", getAllFeedBacks);

module.exports = router;
