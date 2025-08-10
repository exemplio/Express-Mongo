const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  email: { type: String, required: true, unique: true },
  avatar: { type: String }, // URL to profile picture
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);