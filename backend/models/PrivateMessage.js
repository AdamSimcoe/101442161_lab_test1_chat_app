// Created by Adam Simcoe
// Last Updated on February 5th, 2025

const mongoose = require('mongoose');

const PrivateMessageSchema = new mongoose.Schema({
    from_user: {type: String, required: true},
    to_user: {type: String, required: true},
    message: {type: String, required: true},
    date_sent: {type: Date, default: Date.now}
});

module.exports = mongoose.model('PrivateMessage', PrivateMessageSchema);