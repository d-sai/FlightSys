const Course = require('../models/Course');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Task = require('../models/Task')
exports.getAdminDashboard = async (req, res) => {
  try {
    const courses = await Course.find();
    const users = await User.find({ role: 'student' });

    const courseStats = await Promise.all(
      courses.map(async course => {
        const enrolledCount = users.filter(user =>
          user.enrolledCourse?.toString() === course._id.toString()
        ).length;
        return {
          title: course.title,
          price: course.price,
          enrolledStudents: enrolledCount
        };
      })
    );

    const topStudents = users
      .map(user => ({
        name: user.name,
        email: user.email,
        completedTasks: user.completedTasks.length,
        balance: user.balance
      }))
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 5);

    res.json({
      courseStats,
      totalStudents: users.length,
      topStudents
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load admin dashboard', error: err.message });
  }
};

exports.getCourseEnrollmentChart = async (req, res) => {
  try {
    const courses = await Course.find();
    const students = await User.find({ role: 'student' });

    const chartData = courses.map(course => {
      const count = students.filter(
        user => user.enrolledCourse?.toString() === course._id.toString()
      ).length;
      return { course: course.title, students: count };
    });

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: 'Chart data fetch failed', error: err.message });
  }
};

exports.getBalanceChart = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name balance');
    const data = students.map(user => ({
      name: user.name,
      balance: user.balance
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Balance chart fetch failed', error: err.message });
  }
};

// exports.getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await Transaction.find()
//       .sort({ date: -1 })
//       .populate('user', 'name email');
//     console.log("transactions:",transactions);

//     const enrichedTxns = await Promise.all(transactions.map(async txn => {
//       let referenceTitle = 'N/A';

//       if (txn.type === 'course') {
//         const course = await Course.findById(txn.referenceId);
//         if (course) referenceTitle = course.title;
//       } else if (txn.type === 'task') {
//         const task = await Task.findById(txn.referenceId);
//         if (task) referenceTitle = task.title;
//       }

//       return {
//         user: txn.user,
//         type: txn.type,
//         reference: referenceTitle,
//         amount: txn.amount,
//         balanceAfter: txn.balanceAfter,
//         date: txn.date
//       };
//     }));

//     res.json(enrichedTxns);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch all transactions', error: err.message });
//   }
// };



// exports.getAllNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find()
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({
//       message: 'Failed to load notifications',
//       error: err.message
//     });
//   }
// };

exports.getAllTransactions = async (req, res) => {
  const txns = await Transaction.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(txns);
};
exports.getAllNotifications = async(req,res) =>{
  const notification = await Notification.find().populate('user','name email').sort({createAt: -1 })
  res.json(notification); 
};


exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email balance enrolledCourse');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student users', error: err.message });
  }
};


exports.getStudentDetails = async (req, res) => {
  try {
    // console.log("Fetching student ID:", req.params.id);

    const user = await User.findById(req.params.id)
      .populate({
        path: 'enrolledCourse',
        populate: { path: 'tasks' }
      })
      .populate('completedTasks')
      .lean();

    if (!user || user.role !== 'student') {
      // console.log("User not found or not a student");
      return res.status(404).json({ message: 'Student not found' });
    }

    // console.log("User found:", user.name);

    const transactions = await Transaction.find({ user: user._id }).sort({ date: -1 });

    const enrichedTransactions = await Promise.all(
      transactions.map(async (txn) => {
        let referenceTitle = 'N/A';
        if (txn.type === 'course') {
          const course = await Course.findById(txn.referenceId);
          if (course) referenceTitle = course.title;
        } else if (txn.type === 'task') {
          const task = await Task.findById(txn.referenceId);
          if (task) referenceTitle = task.title;
        }

        return {
          type: txn.type,
          reference: referenceTitle,
          amount: txn.amount,
          balanceAfter: txn.balanceAfter,
          date: txn.date
        };
      })
    );

    res.json({
      name: user.name,
      email: user.email,
      enrolledCourse: user.enrolledCourse || null,
      completedTasks: user.completedTasks.map(task => task._id.toString()),
      balance: user.balance,
      transactions: enrichedTransactions
    });
  } catch (err) {
    // console.error('Error in getStudentDetails:', err);
    res.status(500).json({ message: 'Failed to load student profile', error: err.message });
  }
};
