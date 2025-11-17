const jwt = require("jsonwebtoken");
const { Employee, Attendance } = require("../models/employeeForm");

// LOGIN
const loginOnly = async (req, res) => {
  try {
    const { email, empPassword } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ message: "Employee not found!" });

    if (employee.password !== empPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { email: employee.email, id: employee._id },
      "SECRET_KEY",
      { expiresIn: "10h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// CHECK-IN
const checkIn = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();

    // Check if already checked in today
    const existing = await Attendance.findOne({
      email,
      CheckIn: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (existing)
      return res.status(400).json({ message: "Already checked in today!" });

    const remarks =
      now.getHours() === 8 && now.getMinutes() <= 15 ? "On Time" : "Late";

    const attendance = new Attendance({
      email,
      CheckIn: now,
      Status: "Present",
      Remarks: remarks,
    });

    await attendance.save();

    res.status(200).json({
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Check-in failed", error: error.message });
  }
};

// CHECK-OUT
const checkOut = async (req, res) => {
  try {
    const email = req.user.email;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const record = await Attendance.findOne({
      email,
      CheckIn: { $gte: todayStart, $lte: todayEnd },
    });

    if (!record)
      return res.status(404).json({ message: "No Check-In found for today!" });

    if (record.CheckOut)
      return res.status(400).json({ message: "Already checked out!" });

    record.CheckOut = new Date();
    await record.save();

    res.status(200).json({
      message: "Checked out successfully",
      checkOutTime: record.CheckOut.toLocaleTimeString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Check-out failed", error: error.message });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    const email = req.user.email;
    res.status(200).json({ message: `Logout successful for ${email}` });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

module.exports = { loginOnly, checkIn, checkOut, logout };
