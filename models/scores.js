import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);