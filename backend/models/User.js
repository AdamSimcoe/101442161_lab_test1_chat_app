// Created by Adam Simcoe - 101442161
// Last Updated on February 5th, 2025

const mongoose =  require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true},
    createdOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);