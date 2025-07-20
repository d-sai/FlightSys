const User = require('../models/User');
const Course = require('../models/Course');
const Task = require('../models/Task');
const { logNotification, logTransaction } = require('../utils/loggers');

exports.enrollCourse = async (req, res) => {
  const user = req.user;
  const { courseId } = req.body;

  try {
    if (user.role === 'admin')
      return res.status(400).json({ message: 'Admins can\'t enroll in courses' });
    if (user.enrolledCourse)
      return res.status(400).json({ message: 'Already enrolled in a course' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (user.balance < course.price) {
      return res.status(400).json({
        message: 'Insufficient balance to enroll in this course'
      });
    }

    user.balance -= course.price;
    user.enrolledCourse = courseId;
    await user.save();
    await logTransaction(user._id, 'course', `Enrolled in course: ${course.title}`, -course.price, user.balance);
    res.json({ message: 'Enrolled successfully', newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Enrollment failed', error: error.message });
  }
};

exports.getStudentTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourse');

    if (!user.enrolledCourse) {
      return res.json([]); // No course enrolled yet
    }

    const course = await Course.findById(user.enrolledCourse).populate('tasks');

    // Format response with completion status
    const completedIds = user.completedTasks.map(t => t.toString());

    const formattedTasks = course.tasks.map(task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      price: task.price,
      status: completedIds.includes(task._id.toString()) ? 'completed' : 'pending'
    }));

    res.json(formattedTasks);
  } catch (error) {
    // console.error('Error fetching student tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeTask = async (req, res) => {
  const user = req.user;
  const { taskId } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!user.enrolledCourse || user.enrolledCourse.toString() !== task.course.toString()) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    if (user.completedTasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // deduct balance (even if negative)
    user.balance -= task.price;
    user.completedTasks.push(taskId);

    //award badge if task count hits milestone
    const totalCompleted = user.completedTasks.length;
    if (totalCompleted === 3 && !user.badges.includes('Fast Starter')) {
      user.badges.push('Fast Starter');
    }
    if (totalCompleted === 5 && !user.badges.includes('Halfway Pro')) {
      user.badges.push('Halfway Pro');
    }
    if (totalCompleted === 10 && !user.badges.includes('Flight Master')) {
      user.badges.push('Flight Master');
    }

    await user.save();

    await logTransaction(user._id, 'task', task._id, task.price, user.balance, `Completed task: ${task.title}`);

    if (user.balance < 0) {
      await logNotification(user._id, '⚠️ Your balance is negative after completing a task', 'alert');
    }
    let warning = null;
    if (user.balance < 0) {
      warning = '⚠️ Your balance is now negative. Please top-up.';
    }

    res.json({
      message: '✅ Task completed successfully',
      newBalance: user.balance,
      totalCompleted,
      badges: user.badges,
      ...(warning && { warning })
    });
  } catch (err) {
    res.status(500).json({ message: 'Task completion failed', error: err.message });
  }
};

//it will rank students as per the length of completed task
exports.getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .sort({ completedTasks: -1 })
      .select('name email completedTasks badges balance')
      .populate('completedTasks', 'title');

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error generating leaderboard', error: err.message });
  }
};


exports.getStudentProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourse',
        populate: { path: 'tasks' }
      })
      .populate('completedTasks');

    if (!user.enrolledCourse) {
      return res.status(400).json({ message: 'Not enrolled in any course' });
    }

    const totalTasks = user.enrolledCourse.tasks.length;

    const completed = user.completedTasks.filter(task =>
      task.course.toString() === user.enrolledCourse._id.toString()
    );//to check later: by directly using completedTasks.length

    const progressPercent = totalTasks === 0 ? 0 : Math.round((completed.length / totalTasks) * 100);

    res.json({
      course: user.enrolledCourse.title,
      courseDescription: user.enrolledCourse.description,
      totalTasks,
      completedTasks: completed.length,
      progress: `${progressPercent}%`,
      balance: user.balance,
      badges: user.badges
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress', error: err.message });
  }
};

exports.getProgressChart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourse',
        populate: { path: 'tasks' }
      });
    if (!user.enrolledCourse) {
      return res.status(400).json({ message: 'No course enrolled' });
    }

    const totalTasks = user.enrolledCourse.tasks.length;
    const completed = user.completedTasks.filter(task =>
      task.course.toString() === user.enrolledCourse._id.toString()
    ).length;
    const remaining = totalTasks - completed;

    res.json({
      course: user.enrolledCourse.title,
      total: totalTasks,
      completed,
      remaining
    });
  } catch (err) {
    res.status(500).json({ message: 'Progress chart fetch failed', error: err.message });
  }
};


const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
};
const mongoose = require('mongoose');


exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    // .populate({
    //   path: 'enrolledCourse',
    //   populate: { path: 'tasks' }
    // })
    // .populate({
    //   path: 'completedTasks',
    //   populate: { path: 'course' }
    // });
    // console.log("transactions backend:",transactions)
    // Map referenceId to readable names
    const enrichedTxns = await Promise.all(transactions.map(async txn => {
      const dummyId = new mongoose.Types.ObjectId();//currently transaction.populate not working properly so using dummyID
      let referenceTitle = 'N/A';
      if (txn.type === 'course') {
        const course = await Course.findById(txn.referenceId);
        if (course) referenceTitle = course.title;
      } else if (txn.type === 'task') {
        const task = await Task.findById(txn.referenceId);
        if (task) referenceTitle = task.title;
      }
      referenceTitle=new mongoose.Types.ObjectId();//currently transaction.populate not working properly so using dummyID
      return {
        type: txn.type,
        reference: referenceTitle,
        amount: txn.amount,
        balanceAfter: txn.balanceAfter,
        date: txn.date
      };
    }));
    // console.log(enrichedTxns)
    res.json(enrichedTxns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
};


exports.requestCertificate = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'enrolledCourse',
      populate: { path: 'tasks' }
    })
    .populate({
      path: 'completedTasks',
      populate: { path: 'course' }
    });

  if (!user.enrolledCourse) {
    return res.status(400).json({ message: 'Not enrolled in a course' });
  }

  const totalTasks = user.enrolledCourse.tasks.length;
  // console.log(totalTasks);
  const completedCount = user.completedTasks.length;
  // console.log(completedCount);

  if (completedCount < totalTasks) {
    return res.status(403).json({ message: 'Complete all tasks before requesting certificate' });
  }

  if (user.balance < 0) {
    return res.status(403).json({ message: 'Your balance must be non-negative to receive certificate. Complete Your dues !!' });
  }

  await logNotification(user._id, `🎓 Congratulations! You completed the course: ${user.enrolledCourse.title}`, 'badge');

  res.json({
    message: `🎉 You have successfully completed the course: ${user.enrolledCourse.title}`,
    certificateAvailable: true
  });
};

const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');
const { log } = require('console');

exports.downloadCertificate = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'enrolledCourse',
      populate: { path: 'tasks' }
    })
    .populate({
      path: 'completedTasks',
      populate: { path: 'course' }
    });

  if (!user.enrolledCourse) {
    return res.status(400).json({ message: 'Not enrolled in a course' });
  }

  const totalTasks = user.enrolledCourse.tasks.length;
  const completed = user.completedTasks.length;

  if (completed < totalTasks) {
    return res.status(403).json({ message: 'Complete all tasks before downloading certificate' });
  }

  if (user.balance < 0) {
    return res.status(403).json({ message: 'Your account balance must be non-negative. Pay your dues to get certificate!!' });
  }

  // Create the pdf
  // const doc = new PDFDocument();
  const doc = new PDFDocument({
  size: 'A4',
  layout: 'landscape',
  margins: {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40
  }
});
  const filename = `Certificate-${user.name.replace(/\s+/g, '_')}.pdf`;

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res); // Send directly to client

// Page dimensions for landscape A4
const pageWidth = 842;
const pageHeight = 595;

// Create gradient background
doc.rect(0, 0, pageWidth, pageHeight)
   .fillAndStroke('#f8f9fa', '#e9ecef');

// Add subtle background pattern
doc.save();
doc.opacity(0.1);
for (let i = 0; i < pageWidth; i += 60) {
  for (let j = 0; j < pageHeight; j += 60) {
    doc.circle(i, j, 2).fill('#6c757d');
  }
}
doc.restore();

// Main decorative border
doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
   .lineWidth(8)
   .stroke('#2c3e50');

// Inner decorative border
doc.rect(45, 45, pageWidth - 90, pageHeight - 90)
   .lineWidth(2)
   .stroke('#34495e');

// Ornamental corners
const cornerSize = 40;
// Top-left corner
doc.moveTo(60, 60)
   .lineTo(60 + cornerSize, 60)
   .moveTo(60, 60)
   .lineTo(60, 60 + cornerSize)
   .lineWidth(3)
   .stroke('#e74c3c');

// Top-right corner
doc.moveTo(pageWidth - 60 - cornerSize, 60)
   .lineTo(pageWidth - 60, 60)
   .moveTo(pageWidth - 60, 60)
   .lineTo(pageWidth - 60, 60 + cornerSize)
   .lineWidth(3)
   .stroke('#e74c3c');

// Bottom-left corner
doc.moveTo(60, pageHeight - 60 - cornerSize)
   .lineTo(60, pageHeight - 60)
   .moveTo(60, pageHeight - 60)
   .lineTo(60 + cornerSize, pageHeight - 60)
   .lineWidth(3)
   .stroke('#e74c3c');

// Bottom-right corner
doc.moveTo(pageWidth - 60 - cornerSize, pageHeight - 60)
   .lineTo(pageWidth - 60, pageHeight - 60)
   .moveTo(pageWidth - 60, pageHeight - 60)
   .lineTo(pageWidth - 60, pageHeight - 60 - cornerSize)
   .lineWidth(3)
   .stroke('#e74c3c');

// Header with aviation icon and title
doc.fontSize(32)
   .fillColor('#2c3e50')
   .text('CERTIFICATE OF COMPLETION', { align: 'center' })
   .moveDown(0.5);

// Subtitle
doc.fontSize(16)
   .fillColor('#7f8c8d')
   .text('FLIGHT TRAINING PROGRAM', { align: 'center' })
   .moveDown(1.5);

// Decorative line
doc.moveTo(pageWidth / 2 - 100, doc.y)
   .lineTo(pageWidth / 2 + 100, doc.y)
   .lineWidth(2)
   .stroke('#3498db')
   .moveDown(2);

// Certificate text
doc.fontSize(20)
   .fillColor('#2c3e50')
   .text('This is to certify that', { align: 'center' })
   .moveDown(1.5);

// Student name with decorative underline
doc.fontSize(28)
   .fillColor('#e74c3c')
   .text(`${user.name}`, { align: 'center' })
   .moveDown(0.3);

// Decorative underline for name
doc.moveTo(pageWidth / 2 - 150, doc.y)
   .lineTo(pageWidth / 2 + 150, doc.y)
   .lineWidth(3)
   .stroke('#f39c12')
   .moveDown(1.5);

// Course completion text
doc.fontSize(18)
   .fillColor('#2c3e50')
   .text('has successfully completed the comprehensive training course', { align: 'center' })
   .moveDown(1.5);

// Course title
doc.fontSize(24)
   .fillColor('#27ae60')
   .text(`"${user.enrolledCourse.title}"`, { align: 'center' })
   .moveDown(1.5);

// Achievement statement
// doc.fontSize(16)
//    .fillColor('#7f8c8d')
//    .text('demonstrating proficiency in all required competencies', { align: 'center' });
  //  .moveDown(3);

// Date and signatures section
const bottomY = pageHeight - 140;

// Date
doc.fontSize(14)
   .fillColor('#2c3e50')
   .text(`Date of Completion: ${new Date().toLocaleDateString()}`, 100, bottomY, { align: 'left' });

// Signature lines
const signatureY = bottomY + 30;
doc.moveTo(120, signatureY)
   .lineTo(280, signatureY)
   .lineWidth(1)
   .stroke('#95a5a6');

doc.moveTo(pageWidth - 280, signatureY)
   .lineTo(pageWidth - 120, signatureY)
   .lineWidth(1)
   .stroke('#95a5a6');

// Signature labels
doc.fontSize(12)
   .fillColor('#7f8c8d')
   .text('Instructor Signature', 120, signatureY + 15, { width: 160, align: 'center' })
   .text('Director Signature', pageWidth - 280, signatureY + 15, { width: 160, align: 'center' });

// Add a seal/badge placeholder
// doc.circle(pageWidth - 120, pageHeight - 120, 30)
//    .fillAndStroke('#f39c12', '#e67e22');

// doc.fontSize(10)
//    .fillColor('#fff')
//    .text('CERTIFIED', pageWidth - 140, pageHeight - 130, { width: 40, align: 'center' });

doc.end();
  
};

exports.unenrollCourse = async (req, res) => {
  const user = req.user;

  try {
    if (!user.enrolledCourse) {
      return res.status(400).json({ message: 'You are not enrolled in any course' });
    }

    user.enrolledCourse = null;
    user.completedTasks = [];
    await user.save();

    res.json({ message: '🚫 You have been unenrolled from the course' });
  } catch (err) {
    res.status(500).json({ message: 'Unenrollment failed', error: err.message });
  }
};

exports.topUpBalance = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.balance += Number(amount);
    await user.save();

    // Log transaction
    // await logTransaction(user._id, 'topup', null, amount, user.balance, 'Balance Top-Up');
    // await logTransaction(user._id, 'topup',null, 'Balance Top-Up',amount, user.balance);
    // await logTransaction(user._id, 'topup', null, amount, user.balance, 'Balance Top-Up');
    try {
      await logTransaction(user._id, 'topup', null, amount, user.balance, 'Balance Top-Up');
    } catch (logError) {
      console.error('Log transaction error:', logError); // This will show the specific error
    }
    // await logTransaction(user._id, 'course', `Enrolled in course: ${course.title}`, -course.price, user.balance);

    // Send notification to student
    // await Notification.create({
    //   user: user._id,
    //   message: `💰 ₹${amount} has been added to your account.`,
    //   type: 'info'
    // });

    // Optionally notify admins (example: notify all admins)
    // const admins = await User.find({ role: 'admin' });
    // for (const admin of admins) {
    //   await Notification.create({
    //     user: admin._id,
    //     message: `🧾 ${user.name} (${user.email}) topped up ₹${amount}.`,
    //     type: 'info'
    //   });
    // }

    res.status(200).json({ message: 'Balance updated successfully', newBalance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Top-up failed', error: err.message });
  }
};