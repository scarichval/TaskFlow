const express = require('express');
const router = express.Router();
const Comment = require("../models/Comments");


/**
 * POST /api/comments
 * Create a new comment
 * 
 * Request Body:
 *   - userId: ID of the user creating the comment
 *   - taskId: ID of the task the comment is associated with
 *   - content: Text content of the comment
 * 
 * Response:
 *   - 201 Created: Returns the newly created comment
 *   - 400 Bad Request: If required fields are missing or invalid
 *   - 500 Internal Server Error: For unexpected server errors
 */
router.post('/', async (req, res) => {
    const { text, task, author } = req.body;

    if (!text || !task || !author) {
        return res.status(400).json({ message: 'Bad Request' });
    };

    try {
        const newComment = new Comment({
            text: text,
            task: task,
            author: author
        });

        await newComment.save();
        res.status(201).json({ newComment });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**
 * GET /api/comments/:taskId
 * Get all comments for a specific task
 * 
 * URL Params:
 *   - taskId: ID of the task whose comments are being retrieved
 * 
 * Response:
 *   - 200 OK: Returns a list of comments for the specified task
 *   - 404 Not Found: If the task does not exist
 *   - 500 Internal Server Error: For unexpected server errors
 */
router.get('/:taskId', async (req, res) => {

    try {
        const taskComments = await Comment.find({task: req.params.taskId}).populate('task', 'title description status ');

        if (!taskComments || taskComments.length === 0) {
            return res.status(404).json({ message: 'Comments for this task not found' });
        }

        res.status(200).json({ taskComments });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

});

/**
 * GET /api/comments/comment/:commentId
 * Get a specific comment by ID
 * 
 * URL Params:
 *   - commentId: ID of the comment to retrieve
 * 
 * Response:
 *   - 200 OK: Returns the requested comment
 *   - 404 Not Found: If the comment does not exist
 *   - 500 Internal Server Error: For unexpected server errors
 */
router.get('/comment/:commentId', async (req, res) => { 
    try {
        const taskComment = await Comment.findById(req.params.commentId)
            .populate('task', 'title description status');  // Populate task details

        if (!taskComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ taskComment });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
});



/**
 * PUT /api/comments/:commentId
 * Update a specific comment by ID
 * 
 * URL Params:
 *   - commentId: ID of the comment to update
 * 
 * Request Body:
 *   - content: Updated text content of the comment
 * 
 * Response:
 *   - 200 OK: Returns the updated comment
 *   - 400 Bad Request: If request body is invalid
 *   - 404 Not Found: If the comment does not exist
 *   - 500 Internal Server Error: For unexpected server errors
 */
// router.put('/:commentId', async (req, res) => { ... });


/**
 * DELETE /api/comments/:commentId
 * Delete a specific comment by ID
 * 
 * URL Params:
 *   - commentId: ID of the comment to delete
 * 
 * Response:
 *   - 200 OK: Confirms the comment was deleted
 *   - 404 Not Found: If the comment does not exist
 *   - 500 Internal Server Error: For unexpected server errors
 */
// router.delete('/:commentId', async (req, res) => { ... });


module.exports = router;