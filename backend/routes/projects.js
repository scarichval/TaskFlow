const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const {authenticateJWT} = require('./auth');

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
		const projects = await Project.find({ members: userId}).populate('owner', 'name');
		res.json(projects);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}

});

module.exports = router;
