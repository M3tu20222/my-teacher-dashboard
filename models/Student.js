import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true }
});

// Öğrenci silindiğinde ilişkili notları da silen bir middleware ekleyelim
StudentSchema.pre('remove', async function(next) {
  await this.model('Score').deleteMany({ student: this._id });
  next();
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);