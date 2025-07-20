const Task = require('../models/Task');
const Course = require('../models/Course');

exports.createTask = async (req, res) => {
  try {
    const { title, description, price, courseId } = req.body;

    const task = await Task.create({ title, description, price, course: courseId });

    // Add task to course
    await Course.findByIdAndUpdate(courseId, { $push: { tasks: task._id } });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, price },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Course.findByIdAndUpdate(task.course, { $pull: { tasks: task._id } });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};
