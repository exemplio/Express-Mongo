const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: { type: String }, // Optional (for group chats)
  isGroup: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
});

module.exports = mongoose.model('Chat', chatSchema);