require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
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
