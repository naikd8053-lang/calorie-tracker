import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  name: { type: String, required: true },
  quantity: { type: String, default: '1 serving' },
  calories: { type: Number, required: true },
  date: { type: String, required: true }  // YYYY-MM-DD
});

export default mongoose.model('Log', logSchema);