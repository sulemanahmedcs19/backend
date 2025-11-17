const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  checkIn,
  checkOut,
  loginOnly,
  logout,
} = require("../controllers/attendance.controller");

// PUBLIC
router.post("/loginOnly", loginOnly);

// PROTECTED
router.post("/checkIn", auth, checkIn);
router.post("/checkOut", auth, checkOut);
router.post("/logout", auth, logout);

module.exports = router;
