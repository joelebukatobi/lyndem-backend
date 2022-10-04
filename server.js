const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const color = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/database');

// Load ENV Variable
dotenv.config({ path: './config/config.env' });
// --------------------------------------------
const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV;

// Connect Database
connectDB();

// Route Files
const games = require('./routes/games');
const questions = require('./routes/questions');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Dev Logging Middleware
if (MODE === 'development') {
  app.use(morgan('dev'));
}

// File uploads
app.use(fileupload());

// Sanitize Data
app.use(mongoSanitize());

// Security Headers
app.use(helmet());

// Prevent Cross Site Scripting
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

//  Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routers
app.use('/backend/api/v1/games', games);
app.use('/backend/api/v1/questions', questions);
app.use('/backend/api/v1/auth', auth);
app.use('/backend/api/v1/users', users);
app.use('/backend/api/v1/reviews', reviews);

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
