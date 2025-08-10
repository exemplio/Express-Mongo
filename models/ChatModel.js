const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: { type: String },
  isGroup: { type: Boolean, default: false },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: [true, 'members is required'],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'members must have at least one user'
    }
  },
  createdAt: { type: Date, default: Date.now },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
});

module.exports = mongoose.model('Chat', chatSchema);