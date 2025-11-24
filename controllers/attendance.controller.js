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
      { email: employee.email, id: employee._id, name: employee.FName },
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
//check-In
const checkIn = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Check if within shift window (8PM to 5AM)
    if (!(hour >= 20 || hour < 5)) {
      return res
        .status(400)
        .json({ message: "Check-in allowed only between 8PM and 5AM" });
    }

    const shiftStart = new Date(now);
    const shiftEnd = new Date(now);

    if (hour < 5) {
      shiftStart.setDate(now.getDate() - 1);
    }

    shiftStart.setHours(20, 0, 0, 0);
    shiftEnd.setDate(shiftStart.getDate() + 1);
    shiftEnd.setHours(19, 59, 59, 999);

    const existing = await Attendance.findOne({
      email,
      CheckIn: { $gte: shiftStart, $lte: shiftEnd },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Already checked in for this shift!" });
    }

    // Remarks calculation
    let remarks;
    if (hour === 20 && minutes <= 15) {
      remarks = "On Time";
    } else {
      remarks = "Late";
    }

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

// CHECK-OUT
const checkOut = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();
    const hour = now.getHours();

    // SHIFT WINDOW
    const shiftStart = new Date(now);
    const shiftEnd = new Date(now);

    if (hour < 5) {
      shiftStart.setDate(now.getDate() - 1); // previous day
    }

    shiftStart.setHours(20, 0, 0, 0); // 8 PM

    // SHIFT END = NEXT DAY 7:59 PM
    shiftEnd.setDate(shiftStart.getDate() + 1);
    shiftEnd.setHours(19, 59, 59, 999);

    // Find shift's check-in
    const record = await Attendance.findOne({
      email,
      CheckIn: { $gte: shiftStart, $lte: shiftEnd },
    });

    if (!record) {
      return res
        .status(404)
        .json({ message: "No check-in found for this shift!" });
    }

    if (record.CheckOut) {
      return res.status(400).json({ message: "Already checked out!" });
    }

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

const getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().sort({ CheckIn: -1 }); // Latest first

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found!" });
    }

    res.status(200).json({
      message: "Attendance records fetched successfully",
      attendance: attendanceRecords,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch attendance", error: error.message });
  }
};

module.exports = { loginOnly, checkIn, checkOut, logout, getAllAttendance };
