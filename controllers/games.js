const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');

// @desc      Get all games
// @route     GET /api/v1/games
// @access    Public
exports.getGames = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filterResults);
});

// @desc      Get single game
// @route     GET/api/v1/games/:id
// @access    Public
exports.getGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id).populate('questions');
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 400));
  }
  res.status(200).json({ success: true, data: game });
});

// @desc      Create new game
// @route     POST /api/v1/games
// @access    Private
exports.createGame = asyncHandler(async (req, res, next) => {
  // add user to req.body
  req.body.user = req.user.id;

  // Check for published games
  const publishedGame = await Game.findOne({ user: req.user.id });

  // Check User Role
  if (publishedGame && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a Game`), 400);
  }

  const game = await Game.create(req.body);

  res.status(201).json({
    success: true,
    data: game,
  });
});

// @desc      Update game
// @route     PUT /api/v1/games/:id
// @access    Private
exports.updateGame = asyncHandler(async (req, res, next) => {
  let game = await Game.findById(req.params.id);

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  console.log(game);
  console.log(req.user);

  // Check Ownership
  if (game.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this game`, 401));
  }

  game = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: game });
});

// @desc      Delete game
// @route     DELETE /api/v1/games/:id
// @access    Private
exports.deleteGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  // Check Ownership
  if (game.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this game`, 401));
  }

  game.remove();

  res.status(200).json({ success: true });
});

// @desc      Upload photo for  game
// @route     PUT /api/v1/games/:id/photo
// @access    Private
exports.gamePhotoUpload = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  // Check Ownership
  if (game.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this game`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  // Create custom filename
  file.name = `photo_${game._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Game.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
