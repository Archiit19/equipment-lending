import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, default: 'good' },
  quantity: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Equipment', equipmentSchema);
