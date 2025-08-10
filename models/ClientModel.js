import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  localId: { type: String, required: true, unique: true },
  email: { type: String, required: true }
});

export default mongoose.model('Clients', userSchema);