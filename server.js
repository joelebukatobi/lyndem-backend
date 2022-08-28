const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const color = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/database');

// Route Files
const games = require('./routes/games');
const questions = require('./routes/questions');

// Load ENV Variable
dotenv.config({ path: './config/config.env' });
// --------------------------------------------
const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV;

const app = express();

// Body Parser
app.use(express.json());

// Connect Database
connectDB();

// Dev Logging Middleware
if (MODE === 'development') {
  app.use(morgan('dev'));
}

// File uploads
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routers
app.use('/api/v1/games', games);
app.use('/api/v1/questions', questions);

// Error Handler/
app.use(errorHandler);

app.listen(PORT, console.log(`Server running in ${MODE} mode on port ${PORT}`.yellow.bold));

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Close Server
  server.close(() => {
    process.exit(1);
  });
});
