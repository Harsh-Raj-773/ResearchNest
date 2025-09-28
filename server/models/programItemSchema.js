const mongoose = require('mongoose');
const { Schema } = mongoose;

const progressItemSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
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
  // The key field for the Array of Ancestors pattern
  ancestors: [{
    type: Schema.Types.ObjectId,
    ref: 'ProgressItem'
  }]
}, { timestamps: true });

module.exports = mongoose.model('ProgressItem', progressItemSchema);