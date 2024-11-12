const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { authenticateJWT } = require('./auth');



// Route to create a new task
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'username');
        res.json(tasks);
        // what if no tasks are found  ?
    
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Get a specific task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'username');
        if (!task) return res.status(404).json({message: 'Task not found'});
        res.json(task);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Update a task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true} );

        if(!task) return res.status(404).json({message: 'Task to be updated not found'});
        res.json({message: 'Task updated succesfully', task});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({message: 'Task to be deleted not found'});
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;