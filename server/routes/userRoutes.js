const express = require('express');
const { getAllStudents } = require('../controllers/userController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// This route is protected and only accessible by users with the 'faculty' role.
router.get('/students', verifyToken, authorize('faculty'), getAllStudents);

module.exports = router;