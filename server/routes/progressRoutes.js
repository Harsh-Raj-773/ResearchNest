const express = require('express');
const {
    createProgressItem,
    getMyProgress,
    getStudentProgress,
    updateItemStatus,
    overrideItemStatus
} = require('../controllers/progressController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for faculty to create new progress items for a student
router.post('/', verifyToken, authorize('faculty'), createProgressItem);

// Route for faculty to get a specific student's progress
router.get('/student/:studentId', verifyToken, authorize('faculty'), getStudentProgress);

// Route for faculty to override/manually set an item's status
router.put('/override/:itemId', verifyToken, authorize('faculty'), overrideItemStatus);

// Route for a student to get their own progress tree
router.get('/me', verifyToken, authorize('student'), getMyProgress);

// Route for a student to update one of their own items
router.put('/item/:itemId', verifyToken, authorize('student'), updateItemStatus);

module.exports = router;