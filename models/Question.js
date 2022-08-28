const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    trim: true,
    required: [true, 'Please add a question'],
  },

  answer: [
    {
      a: String,
      b: String,
      c: String,
      d: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
