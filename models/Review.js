const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Prevent user from submitting more than one review per game
ReviewSchema.index({ game: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (gameId) {
  const obj = await this.aggregate([
    {
      $match: { game: gameId },
    },
    {
      $group: {
        _id: '$game',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Game').findByIdAndUpdate(gameId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.game);
});

// Call getAverageCost before remove
ReviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.game);
});

module.exports = mongoose.model('Review', ReviewSchema);
