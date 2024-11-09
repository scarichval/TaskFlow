const app = require('./app');
const connectDB = require('../db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});