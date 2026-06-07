const express = require("express");
const { predict, getSymptoms } = require("../controllers/predictController");

const router = express.Router();

router.post("/", predict);
router.get("/symptoms", getSymptoms);

module.exports = router;
