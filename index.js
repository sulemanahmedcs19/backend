const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const employeeRoute = require("./routes/employee.route");
const attendanceRoute = require("./routes/attendance.route");
const app = express();
app.use(cors());
app.use(express.json());

//routes
app.use("/api/employee", employeeRoute);
app.use("/api/attendance", attendanceRoute);

//connection with database
mongoose
  .connect(
    "mongodb+srv://Admin021:Admin021@attendance-db.xez6qxg.mongodb.net/Employee?appName=Attendance-DB"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running");
    });
  })
  .catch(() => {
    console.log("Connection Failed");
  });
