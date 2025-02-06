// Created by Adam Simcoe
// Last Updated on February 5th, 2025

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
    
    try {
        
        const {username, firstname, lastname, password} = req.body;

        const existingUser = await User.findOne({username});

        if (existingUser) {
            return res.status(400).json({message: 'Username already exists, please try again.'});
        }

        const newUser = new User({username, firstname, lastname, password});
        await newUser.save();

        res.status(201).json({message: 'User has been created successfully.'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error occurred during signup.'});
    }
});

router.post('/login', async (req, res) => {

    try {
        
        const {username, password} = req.body;

        const user = await User.findOne({username});

        if (!user || user.password !== password) {
            return res.status(400).json({message: 'Incorrect user or password. Please try again.'});
        }

        res.status(200).json({message: 'Login successful', user});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error occurred during login.'});
    }
});

module.exports = router;