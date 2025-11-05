import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['requested', 'approved', 'issued', 'returned', 'rejected', 'overdue'], 
    default: 'requested' 
  },
  decisionMaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedAt: { type: Date },
  returnedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
