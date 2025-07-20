const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/sendEmail'); 

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, role });
    //email sending part
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.warn('Email failed to send:', emailErr.message);
    }

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email })
      .populate('enrolledCourse');
    if (!user) return res.status(401).json({ message: 'User not found!!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials!!' });

    const token = generateToken(user._id);
    // res.json({ user, token });modified to get the user.role for admin panel easily
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrolled: user.enrolledCourse
    });
    console.log("login successfull");

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

