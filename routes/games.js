const express = require('express');
const { getGames, getGame, createGame, updateGame, deleteGame, gamePhotoUpload } = require('../controllers/games');

const Game = require('../models/Game');
const filterResults = require('../middleware/filter');

// Include other resource routers
const questionRouter = require('./questions');
const reviewRouter = require('./reviews');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource router
router.use('/:gameId/questions', questionRouter);
router.use('/:gameId/reviews', reviewRouter);
router.route('/:id/photo').put(protect, authorize('editor', 'admin'), gamePhotoUpload);

// '/' Endpoints
router
  .route('/')
  .get(filterResults(Game, 'questions'), getGames)
  .post(protect, authorize('editor', 'admin'), createGame);

//  '/:id' Endpoints
router
  .route('/:id')
  .get(getGame)
  .put(protect, authorize('editor', 'admin'), updateGame)
  .delete(protect, authorize('editor', 'admin'), deleteGame);

module.exports = router;
