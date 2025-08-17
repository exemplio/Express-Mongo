const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId:   { type: String, ref: 'Chats', required: true, unique: true },
  senderId: { type: String, ref: 'Clients', required: true },   
  receiverId: { type: String, ref: 'Clients', required: true }, 
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: String, ref: 'Clients' }] 
});

messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Messages', messageSchema);