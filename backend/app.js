const express = require('express');
const app = express();

// Import routes and middleware
const taskRoutes = require('./routes/tasks.js')
const {router: authRoutes}  = require('./routes/auth');

// Middleware setup
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Export the configured app
module.exports = app;