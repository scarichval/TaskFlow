const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    assignedTo: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending'}
});

module.exports = mongoose.model('Task', taskSchema);