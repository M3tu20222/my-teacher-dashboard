// models/Student.js
import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, required: true },
});

const studentSchema = new mongoose.Schema({
  number: { type: String, required: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  scores: { type: [scoreSchema], default: [] },
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

export default Student;
