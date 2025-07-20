const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAdminDashboard, getStudentDetails } = require('../controllers/adminController');
const { getCourseEnrollmentChart } = require('../controllers/adminController');
const { getBalanceChart } = require('../controllers/adminController');
const { getAllTransactions } = require('../controllers/adminController');
const { getAllNotifications } = require('../controllers/adminController');
const { getAllStudents } = require('../controllers/adminController');

router.get('/dashboard', protect, adminOnly, getAdminDashboard);
router.get('/chart/course-enrollments', protect, adminOnly, getCourseEnrollmentChart);
router.get('/chart/balance-distribution', protect, adminOnly, getBalanceChart);
router.get('/transactions', protect, adminOnly, getAllTransactions);
router.get('/notifications',protect, adminOnly, getAllNotifications);
router.get('/students', protect, adminOnly, getAllStudents);
router.get('/student/:id', protect, adminOnly, getStudentDetails);
module.exports = router;
