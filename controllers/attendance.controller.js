const jwt = require("jsonwebtoken");
const { Employee, Attendance } = require("../models/employeeForm");

// LOGIN
const loginOnly = async (req, res) => {
  try {
    const { email, empPassword } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ message: "Employee not found!" });

    // Plain-text compare (optional: bcrypt)
    if (employee.password !== empPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { email: employee.email, id: employee._id, name: employee.name },
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

// ---------------------- SHIFT TIME FUNCTIONS ----------------------

function getShiftWindow(now) {
  const shiftStart = new Date(now);
  const shiftEnd = new Date(now);

  // If current time < 5AM ⇒ shift started yesterday
  if (now.getHours() < 5) {
    shiftStart.setDate(now.getDate() - 1);
  }

  // Shift Start: 8 PM
  shiftStart.setHours(20, 0, 0, 0);

  // Shift End: Next Day 7:59 PM
  shiftEnd.setDate(shiftStart.getDate() + 1);
  shiftEnd.setHours(19, 59, 59, 999);

  return { shiftStart, shiftEnd };
}

// ---------------------- CHECK-IN ----------------------

const checkIn = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Allow only between 8PM–5AM
    if (!(hour >= 20 || hour < 5)) {
      return res
        .status(400)
        .json({ message: "Check-in allowed only between 8PM and 5AM" });
    }

    // Get shift window
    const { shiftStart, shiftEnd } = getShiftWindow(now);

    // Check existing check-in for this shift
    const existing = await Attendance.findOne({
      email,
      CheckIn: { $gte: shiftStart, $lte: shiftEnd },
    });

    if (existing)
      return res
        .status(400)
        .json({ message: "Already checked in for this shift!" });

    // Remarks
    let remarks = hour === 20 && minutes <= 15 ? "On Time" : "Late";

    // Save Attendance
    const attendance = new Attendance({
      email,
      name: req.user.name,
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

// ---------------------- CHECK-OUT ----------------------

const checkOut = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();

    // shift window
    const { shiftStart, shiftEnd } = getShiftWindow(now);

    // Find check-in inside shift window
    const record = await Attendance.findOne({
      email,
      CheckIn: { $gte: shiftStart, $lte: shiftEnd },
    });

    if (!record)
      return res.status(404).json({
        message: "No check-in found for the current shift!",
      });

    if (record.CheckOut) {
      return res.status(400).json({ message: "Already checked out!" });
    }

    record.CheckOut = now;
    await record.save();

    res.status(200).json({
      message: "Checked out successfully",
      checkOutTime: record.CheckOut.toLocaleTimeString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Check-out failed", error: error.message });
  }
};

// ---------------------- LOGOUT ----------------------

const logout = async (req, res) => {
  try {
    const email = req.user.email;
    res.status(200).json({ message: `Logout successful for ${email}` });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

// ---------------------- GET ALL ATTENDANCE ----------------------

const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ CheckIn: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({
        message: "No attendance records found!",
      });
    }

    res.status(200).json({
      message: "Attendance records fetched successfully",
      attendance: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

module.exports = {
  loginOnly,
  checkIn,
  checkOut,
  logout,
  getAllAttendance,
};
