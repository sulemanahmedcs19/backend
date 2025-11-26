const jwt = require("jsonwebtoken");
const { Employee, Attendance } = require("../models/employeeForm");

//LOGIN
const loginOnly = async (req, res) => {
  try {
    const { email, empPassword, ip } = req.body;

    const ip_Check = "192.168.18.1";

    if (!ip.startsWith(ip_Check)) {
      return res.status(403).json({
        message: "You must be connected to office WiFi to login",
      });
    }

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

function getPakistanTime(date) {
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
}

function getShiftWindow(now) {
  const localNow = getPakistanTime(now);
  const shiftStart = new Date(localNow);
  const shiftEnd = new Date(localNow);

  shiftStart.setHours(20, 0, 0, 0);

  if (localNow.getHours() < 5) {
    shiftStart.setDate(shiftStart.getDate() - 1);
  }

  shiftEnd.setDate(shiftStart.getDate() + 1);
  shiftEnd.setHours(5, 0, 0, 0);

  return { shiftStart, shiftEnd };
}

//CHECK-IN
const checkIn = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();
    const localNow = getPakistanTime(now);
    const hour = localNow.getHours();
    const minutes = localNow.getMinutes();

    if (!(hour >= 20 || hour < 5)) {
      return res
        .status(400)
        .json({ message: "Check-in allowed only between 8PM and 5AM" });
    }

    const { shiftStart, shiftEnd } = getShiftWindow(now);

    const existing = await Attendance.findOne({
      email,
      CheckIn: { $gte: shiftStart, $lte: shiftEnd },
    });

    if (existing)
      return res
        .status(400)
        .json({ message: "Already checked in for this shift!" });

    const remarks = hour === 20 && minutes <= 15 ? "On Time" : "Late";

    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ message: "Employee not found!" });

    const attendance = new Attendance({
      email,
      employeeName: employee.FName,
      CheckIn: localNow,
      Status: "Pressent",
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

//CHECK-OUT
const checkOut = async (req, res) => {
  try {
    const email = req.user.email;
    const now = new Date();
    const localNow = getPakistanTime(now);

    const { shiftStart, shiftEnd } = getShiftWindow(now);

    const record = await Attendance.findOne({
      email,
      CheckIn: { $gte: shiftStart, $lte: shiftEnd },
    });

    if (!record)
      return res
        .status(404)
        .json({ message: "No check-in found for the current shift!" });

    if (record.CheckOut)
      return res.status(400).json({ message: "Already checked out!" });

    record.CheckOut = localNow;
    await record.save();

    res.status(200).json({
      message: "Checked out successfully",
      checkOutTime: record.CheckOut.toLocaleTimeString("en-PK", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Check-out failed", error: error.message });
  }
};

//LOGOUT
const logout = async (req, res) => {
  try {
    const email = req.user.email;
    res.status(200).json({ message: `Logout successful for ${email}` });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

//GET ALL ATTENDANCE
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ CheckIn: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No attendance records found!" });
    }

    res.status(200).json({
      message: "Attendance records fetched successfully",
      attendance: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch attendance", error: error.message });
  }
};

module.exports = {
  loginOnly,
  checkIn,
  checkOut,
  logout,
  getAllAttendance,
};
