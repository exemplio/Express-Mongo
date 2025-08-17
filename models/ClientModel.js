const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  userId: { type: String, ref: 'Users', required: true, unique: true },
  displayName: { type: String },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Clients', ClientSchema);