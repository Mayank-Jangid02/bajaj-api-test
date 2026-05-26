require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://bajaj-api-round-mayank.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, backend pings, or mobile apps)
    if (!origin) return callback(null, true);
    
    // If not in production, allow all origins for easy debugging
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.netlify.app');
    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error('CORS block: Access denied by DeskFlow security policy.'), false);
  },
  credentials: true
}));
app.use(express.json());

// Mount ticket routes on /tickets to match problem statement API specification
app.use('/tickets', require('./routes/tickets'));

// Simple root check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'DeskFlow API is running smoothly.' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
