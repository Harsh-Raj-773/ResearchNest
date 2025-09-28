const ProgressItem = require('../models/progressItem');
const User = require('../models/user');

exports.createProgressItem = async (req, res) => {
    try {
        const { student, name, itemType, parentId } = req.body;
        const studentExists = await User.findById(student);
        if (!studentExists || studentExists.role !== 'student') {
            return res.status(404).json({ status: 'error', message: 'Student not found.' });
        }
        let ancestors = [];
        if (parentId) {
            const parent = await ProgressItem.findById(parentId);
            if (!parent) return res.status(404).json({ status: 'error', message: 'Parent item not found.' });
            ancestors = [...parent.ancestors, parent._id];
        }
        const newItem = await ProgressItem.create({ student, name, itemType, parentId, ancestors });
        res.status(201).json({ status: 'success', data: newItem });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `An error occurred: ${error.message}` });
    }
};

exports.getMyProgress = async (req, res) => {
    try {
        const items = await ProgressItem.find({ student: req.user.id }).sort('createdAt');
        res.status(200).json({ status: 'success', results: items.length, data: items });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `An error occurred: ${error.message}` });
    }
};

exports.getStudentProgress = async (req, res) => {
    try {
        const items = await ProgressItem.find({ student: req.params.studentId }).sort('createdAt');
        res.status(200).json({ status: 'success', results: items.length, data: items });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `An error occurred: ${error.message}` });
    }
};

exports.updateItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const item = await ProgressItem.findById(req.params.itemId);
        if (!item) return res.status(404).json({ status: 'error', message: 'Progress item not found.' });
        if (item.student.toString() !== req.user.id) return res.status(403).json({ status: 'error', message: 'User not authorized.' });
        item.status = status;
        await item.save();
        res.status(200).json({ status: 'success', data: item });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `An error occurred: ${error.message}` });
    }
};

/**
 * @desc    Override a progress item's status (by Faculty) - WITH FULL DOWNWARD CASCADE
 * @route   PUT /api/progress/override/:itemId
 * @access  Private (Faculty)
 */
exports.overrideItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { itemId } = req.params;
        const item = await ProgressItem.findById(itemId);

        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Progress item not found.' });
        }

        if (status === 'In Progress' && item.status === 'Completed') {
            const lastCompletedChild = await ProgressItem.findOne({
                parentId: itemId,
                status: 'Completed'
            }).sort({ createdAt: -1 }); // Get the most recently completed child

            if (lastCompletedChild) {
                lastCompletedChild.status = 'In Progress';
                await lastCompletedChild.save(); // This save will trigger the upward cascade
            }
        }

        // --- EXPANDED DOWNWARD CASCADE LOGIC ---
        if (status === 'Completed' || status === 'Locked') {
            await ProgressItem.updateMany(
                { ancestors: itemId },
                { $set: { status: status } } // Use the status from the request
            );
            console.log(`Cascaded '${status}' status to all children of ${item.name}.`);
        }
        // --- END OF EXPANDED LOGIC ---

        // Update the target item itself.
        item.status = status;
        // The post-save hook will still run on THIS item, correctly updating its parent's status.
        await item.save();

        res.status(200).json({ status: 'success', data: item });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `An error occurred: ${error.message}` });
    }
};

