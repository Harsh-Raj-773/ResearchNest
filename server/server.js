// File: server.js

// --- Import Core Packages ---
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// --- Import Local Modules ---
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');

// --- Initial Configuration ---
// Load environment variables from the .env file into process.env
dotenv.config();

// Execute the database connection function
connectDB();

// Initialize the Express application
const app = express();

// --- Middleware Setup ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Enable the Express app to parse JSON-formatted request bodies
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);

// --- API Route Definitions ---
// Mount the imported route handlers to their specific base paths
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// A simple root route to confirm the API is running
app.get('/', (req, res) => {
  res.send('ResearchNest API is up and running... 🚀');
});

// --- Server Activation ---
// Get the port from environment variables, defaulting to 5001 if not specified
const PORT = process.env.PORT || 5001;

// Start the server and make it listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`✅ Server is active in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});