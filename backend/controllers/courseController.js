const Course = require('../models/Course');
const Task = require('../models/Task');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const course = await Course.create({ title, description, price });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course', error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const user = req.user;
    // console.log("user: ",user);
    // console.log("Course: ",{Course});

    // if (user.enrolledCourse && user.role==='student') {
    if (user.enrolledCourse ) {
      // console.log("inside if")
      const courses = await Course.find().populate('tasks');
      res.json(courses);
    }else {
      // console.log("inside else")
      const courses = await Course.find({ active: true }).populate('tasks');
      res.json(courses);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses', error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // console.log("course findById:", course)
    course.active = false;
    await course.save();
    const relatedTask = await Task.find({ course: course._id });
    relatedTask.forEach(task => {
      // console.log("Task active status:", task.active);
      task.active = false;
    });
    await relatedTask.forEach(task=> task.save());
    res.json({ message: 'Course and its tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting course', error: err.message });
  }
};
// exports.deleteCourse = async (req, res) => {
//   try {
//     const course = await Course.findByIdAndDelete(req.params.id);
//     if (!course) return res.status(404).json({ message: 'Course not found' });

//     await Task.deleteMany({ course: course._id });

//     res.json({ message: 'Course and its tasks deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting course', error: err.message });
//   }
// };

exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, price },
      { new: true }
    );
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error updating course', error: err.message });
  }
};
