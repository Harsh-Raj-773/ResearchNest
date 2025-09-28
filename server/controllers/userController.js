const User = require('../models/user');

/**
 * @desc    Get all users with the 'student' role
 * @route   GET /api/users/students
 * @access  Private (Faculty)
 */
exports.getAllStudents = async (req, res) => {
    try {
        // Find all users where role is 'student', select only their id and email
        const students = await User.find({ role: 'student' }).select('_id email');
        res.status(200).json({ status: 'success', data: students });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `An error occurred: ${error.message}` });
    }
};