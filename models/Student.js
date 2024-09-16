import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Please provide a student number'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  class: {
    type: String,
    required: [true, 'Please provide a class'],
  },
  scores: [{
    value: Number,
    date: Date
  }]
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);