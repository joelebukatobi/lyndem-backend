const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
  let error = {
    ...err,
  };

  error.message = err.message;
  // Console Log Error
  console.log(err.stack.red);

  // Error Check (Bad ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Error Check (Duplicate Key)
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Error Check (Validation Error)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: { message: error.message, statusCode: `${err.statusCode}` } || `Internal Server Error | ${err.statusCode}`,
  });
};

module.exports = errorHandler;
