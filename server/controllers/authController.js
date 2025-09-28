// File: server/controllers/authController.js

const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Helper function to sign a JWT token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '90d', // Token expires in 90 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const newUser = await User.create({ email, password, role });

    // Remove password from the output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
        return res.status(400).json({ status: 'error', message: 'Email address is already in use.' });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
    }

    // 3) If everything is ok, send token to client
    const token = signToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getMe = async (req, res) => {
  // The 'verifyToken' middleware has already run and attached the user to req.user.
  // We just need to send it back.
  res.status(200).json({
    status: 'success',
    data: req.user
  });
};