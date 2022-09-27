const express = require('express');
const { getQuestions, getQuestion, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/questions');

const Question = require('../models/Question');
const filterResults = require('../middleware/filter');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// '/' Endpoints
router
  .route('/')
  .get(
    filterResults(Question, {
      path: 'question',
      select: 'name description',
    }),
    getQuestions
  )
  .post(protect, authorize('editor', 'admin'), addQuestion);

//  '/:id' Endpoints
router
  .route('/:id')
  .get(getQuestion)
  .put(protect, authorize('editor', 'admin'), updateQuestion)
  .delete(protect, authorize('editor', 'admin'), deleteQuestion);
module.exports = router;
