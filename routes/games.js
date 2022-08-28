const express = require('express');
const { getGames, getGame, createGame, updateGame, deleteGame, gamePhotoUpload } = require('../controllers/games');

const Game = require('../models/Game');
const filterResults = require('../middleware/filter');

// Include other resource routers
const questionRouter = require('./questions');

const router = express.Router();

// Re-route into other resource router
router.use('/:gameId/questions', questionRouter);
router.route('/:id/photo').put(gamePhotoUpload);

// '/' Endpoints
router.route('/').get(filterResults(Game, 'questions'), getGames).post(createGame);

//  '/:id' Endpoints
router.route('/:id').get(getGame).put(updateGame).delete(deleteGame);

module.exports = router;
