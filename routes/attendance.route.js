const express = require("express");
const router = express.Router();
const { checkIn } = require("../controllers/attendance.controller");
const { checkOut } = require("../controllers/attendance.controller");

router.post("/checkIn", checkIn);
router.post("/checkOut", checkOut);

module.exports = router;
