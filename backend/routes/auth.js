const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'My$ecretK3yForJWT!987';
const jwt = require('jsonwebtoken')

router.get('/users', authenticateJWT, async (req, res) => {
    try {
       const searchQuery = req.query.q;
       const users =   searchQuery
            ? await User.find({ username: { $regex: searchQuery, $options: 'i' } })
            : await User.find({}, '_id username');

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// TODO separate the registration and the login
router.post('/login', async (req, res) => {
    try {
        const {username, password, email} = req.body;
        let user = await User.findOne({username});
        
        if(!user){
            const hashPwd = await bcrypt.hash(password,10);
            const newUser = new User({
                username: username,
                password: hashPwd,
                email: email
            });
            await newUser.save();
            user = newUser;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if(!validPassword){
            return res.status(400).send('Invalid login attempt');
        }

        const token = jwt.sign({_id: user._id, username: user.username}, JWT_SECRET, {expiresIn: '1h'});
        res.json(token)

    } catch (error) {
        res.status(500).send({message: 'Internal server error'});
    }
});

//Middleware pour verifier le JWT
function authenticateJWT(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(201).json({message: 'Missing token'});
    };

     jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
        if(err) return res.status(401).json({message: 'Invalid token'});
        req.user = decodedToken;
        next();
    })
};

// API to fetch all users
router.get('/', authenticateJWT, async (req, res) => {
    try {
        // Fetch users with only necessary fields (_id and username)
        const users = await User.find({}, '_id username');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

module.exports = { router, authenticateJWT };