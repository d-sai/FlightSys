const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  deleteCourse,
  updateCourse,
} = require('../controllers/courseController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, adminOnly, createCourse)
  .get(protect, getAllCourses);

router
  .route('/:id')
  .put(protect, adminOnly, updateCourse)
  .delete(protect, adminOnly, deleteCourse);

module.exports = router;