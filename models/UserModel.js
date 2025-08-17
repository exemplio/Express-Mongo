import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, },
  roleType: { type: String, required: true, enum: ['regular', 'admin'] },
  userName: { type: String, required: true, unique: true, }
}, { _id: false });

export default mongoose.model('Users', userSchema);