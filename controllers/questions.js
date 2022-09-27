const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Question = require('../models/Question');
const Game = require('../models/Game');

// @desc      Get all questions
// @route     GET /api/v1/questions
// @route     GET /api/v1/game/:gameId/questions
// @access    Public
exports.getQuestions = asyncHandler(async (req, res, next) => {
  if (req.params.gameId) {
    const questions = await Question.find({
      game: req.params.gameId,
    });

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } else {
    res.status(200).json(res.filterResults);
  }
});

// @desc      Get single question
// @route     GET /api/v1/question/id
// @access    Public
exports.getQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate({ path: 'game', select: 'name description' });

  if (!question) {
    return next(new ErrorResponse(`No question with the id of ${req.params.id}`), 404);
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

// @desc      Add a question
// @route     POST /api/v1/game/:gameId/questions/
// @access    Private
exports.addQuestion = asyncHandler(async (req, res, next) => {
  req.body.game = req.params.gameId;
  req.body.user = req.user.id;
  const game = await Game.findById(req.params.gameId);

  if (!game) {
    return next(new ErrorResponse(`No game with the id of ${req.params.gameId}`), 404);
  }

  // Check Ownership
  if (game.user.toString() !== req.user.id || req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a question to game ${game._id}`, 401));
  }

  const question = await Question.create(req.body);

  res.status(200).json({
    success: true,
    data: question,
  });
});

// @desc      Update a question
// @route     PUT /api/v1/questions/:id
// @access    Private
exports.updateQuestion = asyncHandler(async (req, res, next) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    return next(new ErrorResponse(`No question with the id of ${req.params.id}`), 404);
  }

  // Check Ownership
  if (question.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update question ${question._id}`, 401));
  }

  question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: question,
  });
});

// @desc      Delete a question
// @route     DELETE /api/v1/questions/:id
// @access    Private
exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(new ErrorResponse(`No question with the id of ${req.params.id}`), 404);
  }

  // Check Ownership
  if (question.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete question ${question._id}`, 401));
  }

  await question.remove();

  res.status(200).json({
    success: true,
  });
});
