const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { getStudentTasks } = require('../controllers/studentController');
const {enrollCourse,completeTask} = require('../controllers/studentController');
const { getStudentProgress } = require('../controllers/studentController');
const { getMyTransactions}  = require('../controllers/studentController');
const { requestCertificate } = require('../controllers/studentController');
const { downloadCertificate } = require('../controllers/studentController');

const { getProgressChart } = require('../controllers/studentController');
const { getLeaderboard } = require('../controllers/studentController');
const { getNotifications} = require('../controllers/studentController');
const {topUpBalance}= require('../controllers/studentController');
// const { unenrollCourse } = require('../controllers/studentController');

router.post('/enroll', protect, enrollCourse);
router.get('/tasks', protect, getStudentTasks);
router.post('/complete-task', protect, completeTask);
router.get('/progress',protect, getStudentProgress);
router.get('/transactions', protect, getMyTransactions);
router.get('/certificate', protect, requestCertificate);
router.get('/certificate/download',protect, downloadCertificate);

router.get('/chart/progress', protect, getProgressChart);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/notifications', protect, getNotifications);
router.post('/topup', protect, topUpBalance);
// router.delete('/unenroll', protect, unenrollCourse);

module.exports = router;