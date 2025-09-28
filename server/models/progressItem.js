const mongoose = require('mongoose');
const { Schema } = mongoose;

const progressItemSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  itemType: {
    type: String,
    enum: ['Milestone', 'Stage', 'Task', 'Subtask'],
    required: true
  },
  status: {
    type: String,
    enum: ['Locked', 'In Progress', 'Completed'],
    default: 'Locked'
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'ProgressItem',
    default: null,
    index: true
  },
  ancestors: [{
    type: Schema.Types.ObjectId,
    ref: 'ProgressItem'
  }]
}, { timestamps: true });


// --- CASCADING UPDATE LOGIC (UPWARD) ---
progressItemSchema.post('save', async function() {
  if (!this.parentId) return;

  try {
    const parent = await this.constructor.findById(this.parentId);
    if (!parent) return;

    const siblings = await this.constructor.find({ parentId: this.parentId });
    
    let newParentStatus = parent.status;

    const allSiblingsCompleted = siblings.every(s => s.status === 'Completed');
    const anySiblingInProgress = siblings.some(s => ['In Progress', 'Completed'].includes(s.status));
    const allSiblingsLocked = siblings.every(s => s.status === 'Locked');

    if (allSiblingsCompleted) {
      newParentStatus = 'Completed';
    } else if (allSiblingsLocked) {
      // If any action causes all children to become locked, the parent becomes locked.
      newParentStatus = 'Locked';
    } else if (anySiblingInProgress) {
      newParentStatus = 'In Progress';
    }
    
    if (parent.status !== newParentStatus) {
      parent.status = newParentStatus;
      await parent.save();
    }
  } catch (error) {
    console.error('Error in post-save hook for progress item:', error);
  }
});

module.exports = mongoose.model('ProgressItem', progressItemSchema);

