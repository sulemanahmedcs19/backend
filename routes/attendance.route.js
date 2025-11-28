const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  checkIn,
  checkOut,
  loginOnly,
  logout,
  getAllAttendance,
} = require("../controllers/attendance.controller");

// PUBLIC
router.post("/loginOnly", loginOnly);
router.get("/getAllAttendance", getAllAttendance);
router.get("/todayStatus", auth);

// PROTECTED
router.post("/checkIn", auth, checkIn);
router.post("/checkOut", auth, checkOut);
router.post("/logout", auth, logout);
router.get("/checkToken", auth, (req, res) => {
  res.status(200).json({ message: "Token valid" });
});

module.exports = router;
