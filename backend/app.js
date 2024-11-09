const express = require('express');
const app = express();

const taskRoutes = require('./routes/tasks.js')
const authRoutes = require('./routes/auth.js');

// Middleware setup
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Export the configured app
module.exports = app;