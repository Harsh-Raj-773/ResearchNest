const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route to get the current user's data from a token
router.get('/me', verifyToken, getMe);

// Protected test routes to confirm role-based authorization is working
router.get('/test-student', verifyToken, authorize('student'), (req, res) => {
    res.json({ message: `Welcome Student ${req.user.email}! Your role is confirmed.`});
});
router.get('/test-faculty', verifyToken, authorize('faculty'), (req, res) => {
    res.json({ message: `Welcome Faculty ${req.user.email}! Your role is confirmed.`});
});

module.exports = router;

