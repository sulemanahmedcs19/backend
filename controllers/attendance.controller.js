const { Employee } = require("../models/employeeForm");
const { Attendance } = require("../models/employeeForm");

const checkIn = async (req, res) => {
  try {
    const { email, empPassword } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    if (employee.password !== empPassword) {
      return res.status(401).json({ message: "Invalid pasword" });
    }

    const remarks = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      if (hour == 8 && minute <= 15) {
        return "On Time";
      } else {
        return "Late";
      }
    };
    const login = new Attendance({
      email: email,
      empPassword: empPassword,
      CheckIn: new Date(),
      Status: "Present",
      Remarks: remarks(),
    });

    res.status(200).json({ message: "Login successfully", login });
  } catch (error) {
    res.status(500).json({ message: "Connection Failed", error });
  }
};

//check out

const checkOut = async (req, res) => {
  try {
    const logout = new Attendance({
      CheckOut: new Date(),
      Status: "Present",
    });

    await logout.save();

    const checkOutTime = logout.CheckOut.toLocaleTimeString();

    res.status(200).json({
      message: "Log Out successfully",
      checkOutTime,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Connection Failed", error: error.message });
  }
};

module.exports = { checkIn, checkOut };
