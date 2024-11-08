const { text } = require('body-parser');
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    createdAT: {type: Date, default: Date.now},
    task: {type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = mongoose.model('Comment', commentSchema);