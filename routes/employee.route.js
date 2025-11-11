const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee.controller");

router.get("/getAllEmployees", getAllEmployees);
router.get("/getEmployeeById/:id", getEmployeeById);
router.post("/addEmployee", addEmployee);
router.put("/updateEmployee/:id", updateEmployee);
router.delete("/deleteEmployee/:id", deleteEmployee);

module.exports = router;
