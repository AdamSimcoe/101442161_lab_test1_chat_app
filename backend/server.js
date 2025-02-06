// Created by Adam Simcoe - 101442161
// Last Updated on February 5th, 2025

// Imports
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

// Routes
const authRoutes = require('./routes/auth');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connect to DB
mongoose.connect('mongodb://localhost:27017/chat_app');

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB.');
});

mongoose.connection.on('error', (err) => {
    console.error('Error occurred while connecting to MongoDB:', err);
});

app.use('/api/auth', authRoutes);

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Track users
let users = {};
let onlineUsers = {};

io.on('connection', (socket) => {

    console.log('New user has successfully connected:', socket.id);

    // Register user for tracking
    socket.on('registerUser', (username) => {
        onlineUsers[username] = socket.id;
        console.log(`User has been successfully registered. Username: ${username}, socket ID: ${socket.id}`);
    });

    // Joins specific chat room
    socket.on('joinRoom', ({username, room}) => {
        socket.join(room);
        users[socket.id] = {username, room};

        socket.to(room).emit('notification', `${username} has joined the room!`);
        console.log(`${username} has successfully joined the room.`);
    });

    // Leaves specific chat room
    socket.on('leaveRoom', () => {
        
        const user = users[socket.id];

        if (user) {
            const {username, room} = user;
            socket.leave(room);
            
            socket.to(room).emit('notification', `${username} has left the room.`);
            delete users[socket.id];
            console.log(`${username} has successfully left the room.`);
        }
    });

    // Group message handling
    socket.on('groupMessage', async (data) => {

        console.log('Received groupMessage payload:', data);
        const {username, room, message} = data;
        
        if (!room) {
            console.error('Groupmessage payload is missing the room value');
            return;
        }

        try {
            const newMessage = new GroupMessage({from_user: username, room, message});
            await newMessage.save();

            io.in(room).emit('groupMessage', {username, message, date: newMessage.date_sent});
            console.log(`Group message has been sent from ${username} in ${room}: ${message}`);
        } catch (err) {
            console.error('error saving group message:', err);
        }
    });

    // Private message handling
    socket.on('privateMessage', async ({from_user, to_user, message}) => {

        try {

            const newMessage = new PrivateMessage({from_user, to_user, message});
            await newMessage.save();

            const receivingSocketId = onlineUsers[to_user];

            if (receivingSocketId) {
                io.to(receivingSocketId).emit('privateMessage', {
                    from_user,
                    to_user,
                    message,
                    date: newMessage.date_sent
                });

                console.log(`Private message successfully sent from ${from_user} to ${to_user}: ${message}`);
            } else {
                console.log(`User ${to_user} is not currently online.`);
            }
        } catch (err) {
            console.error('An error occured when sending private message:', err);
        }
    });

    // Typing indicator 
    socket.on('typingIndicator', ({username, room}) => {
        socket.to(room).emit('typingIndicator', `${username} is typing...`);
    });

    // User disconnection
    socket.on('disconnect', () => {

        for (let username in onlineUsers) {
            
            if (onlineUsers[username] === socket.id) {
                console.log(`User ${username} has successfully disconnected.`);
                delete onlineUsers[username];
                break;
            }
        }

        const user = users[socket.id];

        if (user) {
            const {username, room} = user;
            socket.to(room).emit('notification', `${username} has disconnected.`);
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});