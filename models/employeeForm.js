const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

//Employee Schema
const EmployeeFormSchema = mongoose.Schema({
  FName: { type: String, required: [true, "Full Name is required"] },
  DOB: { type: Date, required: [true, "Date of Birth is required"] },
  CNIC: { type: Number },
  Gender: {
    type: String,

    required: [true, "Gender is required"],
  },
  CNICPhoto: { type: String },
  HomeAddress: { type: String, required: [true, "Home Address is required"] },
  City: { type: String, required: [true, "City is required"] },
  Country: { type: String, required: [true, "Country is required"] },
  email: {
    type: String,
    required: [true, "Personal Email is required"],
    unique: true,
  },
  EContact: {
    type: Number,
    required: [true, "Emergency Contact is required"],
  },
  JobTitle: { type: String, required: [true, "Job Title is required"] },
  ReportingManager: { type: String },
  DateOfJoining: {
    type: Date,
    required: [true, "Date of Joining is required"],
  },
  Department: { type: String, required: [true, "Department is required"] },
  WorkType: {
    type: String,
    required: [true, "Work Type is required"],
  },
  password: { type: String, default: () => nanoid(8), required: true },
});

const Employee = mongoose.model("Employee", EmployeeFormSchema);

// Attendance Schema
const AttendanceSchema = mongoose.Schema({
  email: {
    type: String,
    ref: "Employee",
    required: [true, "Employee email is required"],
  },
  employeeName: {
    type: String,
    required: true,
  },
  CheckIn: {
    type: Date,
    default: Date.now,
  },
  CheckOut: {
    type: Date,
    default: null,
  },
  Status: {
    type: String,
    default: "Absent",
  },
  Remarks: {
    type: String,
    default: "",
  },
});

const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = { Employee, Attendance };
