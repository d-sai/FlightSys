const express = require('express');
const router = express.Router();
const {
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, createTask);
router.put('/:id', protect, adminOnly, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
