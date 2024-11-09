const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/create-user', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            //get the email too 
        });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




module.exports = router;