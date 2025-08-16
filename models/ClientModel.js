const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  displayName: { type: String },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

clientSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Clients', clientSchema);