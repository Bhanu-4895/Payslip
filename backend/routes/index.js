const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// Screen 1: Save Employee & Payroll
router.post('/employee', payrollController.createEmployee);

// Screen 2: Search Payslip
router.get('/employee/search', payrollController.searchEmployee);

// Fetch full payslip format
router.get('/payslip/:id', payrollController.getPayslip);

// CRUD Routes for Employees
router.get('/employees', payrollController.getAllEmployees);
router.get('/employees/:id', payrollController.getEmployeeById);
router.put('/employees/:id', payrollController.updateEmployee);
router.delete('/employees/:id', payrollController.deleteEmployee);

module.exports = router;
