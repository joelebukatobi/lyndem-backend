const express = require('express');
const { getQuestions, getQuestion, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/questions');

const Question = require('../models/Question');
const filterResults = require('../middleware/filter');

const router = express.Router({ mergeParams: true });

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
  .post(addQuestion);

//  '/:id' Endpoints
router.route('/:id').get(getQuestion).put(updateQuestion).delete(deleteQuestion);
module.exports = router;
