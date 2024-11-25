const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { authenticateJWT } = require('./auth');
const Project = require('../models/Project');


// Route to create a new task
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { title, description, assignedTo, status, project } = req.body;
        const userId = req.user._id; 

        // Valid project
        const projectExists = await Project.findOne({ _id: project, members: userId });
        if (!projectExists) {
            return res.status(403).json({ message: 'You are not authorized to add tasks to this project.' });
        }

        // Create and save the task
        const task = new Task({ title, description, assignedTo, status, project });
        await task.save();

        res.status(201).json(task);
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
});

// Get tasks for a specific project
router.get('/:projectId', authenticateJWT, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        // Valide project
        const projectExists = await Project.findOne({ _id: projectId, members: userId });
        if (!projectExists){
            return res.status(403).json({ message: 'You are not authorized to view tasks for this project.' });
        }

           // Fetch tasks for the project
           const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name');
           res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Update a task
router.put('/:taskId', authenticateJWT, async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;
        const { title, description, assignedTo, status } = req.body;

            // Fetch task and validate project
        const task = await Task.findById(taskId).populate('project') // what happens when we populate like this ?
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (!task.project.members.includes(userId)) {
            return res.status(403).json({ message: 'You are not authorized to update this task.' });
        }

        // Update task fields
        task.title = title || task.title;
        task.description = description || task.description;
        task.assignedTo = assignedTo || task.assignedTo;
        task.status = status || task.status;
        await task.save();

        res.json(task);
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