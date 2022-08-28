const mongoose = require('mongoose');
const slugify = require('slugify');

const GameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more 1000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    cost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
  {
    id: false,
  }
);

// Create game slug from name
GameSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Cascade delete courses when a bootcamp is deleted
GameSchema.pre('remove', async function (next) {
  await this.model('Question').deleteMany({ game: this._id });
  next();
});

// Reverse populate with virtual
GameSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'game',
  justOne: false,
});

module.exports = mongoose.model('Game', GameSchema);
