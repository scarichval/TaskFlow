const express = require('express');
const app = express();
const cors = require('cors');

// Import routes and middleware
const taskRoutes = require('./routes/tasks.js')
const {router: authRoutes}  = require('./routes/auth');
const commentRoutes = require('./routes/comments.js');
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    optionsSuccessStatus: 200
}   

// Middleware setup
app.use(express.json());


app.use(cors(corsOptions));


app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes)

// Export the configured app
module.exports = app;