const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: { type: String },
  isGroup: { type: Boolean, default: false },
  members: {
    type: [{ type: String, ref: 'User' }],
    required: [true, 'members is required'],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 1,
      message: 'members must have at least two users'
    }
  },
  createdAt: { type: Date, default: Date.now },
  lastMessage: { type: String, ref: 'Message' },
  chatId: { type: String, required: true }
});

module.exports = mongoose.model('Chat', chatSchema);