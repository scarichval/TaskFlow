const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticateJWT } = require('./auth');
const Task = require('../models/Task');

// Route to create a new project
router.post('/', authenticateJWT, async (req, res) => {
	try {
		const { name, description } = req.body;
		const userId = req.user._id;  // more details on this line, the user was from the token decoded in the authenticateJWT middleware

		const project = new Project({
			name,
			description,
			owner: userId,
			members: [userId],
		});

		await project.save();
		res.status(201).json(project);
	} catch (error) {
		res.status(400).json({ message:  error.message});
	}
});

// Route to get projects for the logged-in user
router.get('/', authenticateJWT, async (req, res) => {
	try {
		const userId = req.user._id;

		// Fetch project where the user is a member
		const projects = await Project.find({ members: userId}).populate('owner', 'username');
		res.json(projects);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}

});

// Route to get members of a specific project
router.get('/:projectId/members', authenticateJWT, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        // Find the project and validate that the user is a member
        const project = await Project.findById(projectId).populate('members', '_id username');
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (!project.members.some(member => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: 'You are not authorized to view members of this project.' });
        }

        // Return the members of the project
        res.json(project.members);
    } catch (error) {
        console.error('Error fetching project members:', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:projectId', authenticateJWT, async (req, res) => {
	try {
		const { projectId } = req.params;
		const userId = req.user._id;

		// Find the project and ensure the user is the owner
		const project = await Project.findById(projectId);
		if(!project){
			return res.status(404).json({ message: 'Project not found.' });
		}

		if(!project.owner.equals(userId)){
			return res.status(403).json({ message: 'You are not authorized to delete this project.' });
		}

		// Delete all the tasks's of the project
		await Task.deleteMany({ projectId });

       // Delete the project
		await Project.findByIdAndDelete(projectId);
		res.json({ message: 'Project deleted successfully.' });

	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});


module.exports = router;
