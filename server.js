const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Keep track of users and their corresponding rooms
const users = {};

// Handle socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for joining a room
    socket.on('join', ({ username, room }) => {
        // Store the user in the users object
        users[socket.id] = { username, room };
        // Join the room
        socket.join(room);
        // Emit a message to the user confirming their join
        socket.emit('message', { username: 'admin', text: `Welcome to the room ${room}, ${username}!` });
        // Broadcast a message to all users in the room to notify them of the new user
        socket.broadcast.to(room).emit('message', { username: 'admin', text: `${username} has joined the room!` });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            const { username, room } = user;
            console.log(`${username} disconnected from room ${room}`);
            // Remove the user from the list of users
            delete users[socket.id];
            // Notify other users in the room about the disconnection
            socket.to(room).emit('user disconnected', username);
        }
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        const { username, room } = users[socket.id];
        console.log(`${username} sent message: ${msg}`);
        // Broadcast the message to all users in the room
        io.to(room).emit('chat message', { username, message: msg });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
