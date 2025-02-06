// Created by Adam Simcoe - 101442161
// Last Updated on February 5th, 2025

const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
    from_user: {type: String, required: true},
    room: {type: String, required: true},
    message: {type: String, required: true},
    date_sent: {type: Date, default: Date.now}
});

module.exports = mongoose.model('GroupMessage', GroupMessageSchema);