import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users: { [socketId: string]: string } = {};
const rooms: { [roomName: string]: string[] } = {};

app.use(express.static(path.join(__dirname, '../dist')));

interface JoinMessage {
    username: string;
    room: string;
}

interface ChatMessage {
    username: string;
    room: string;
    message: string;
}

io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('join', ({ username, room }: JoinMessage) => {
        users[socket.id] = username;
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(username);
        socket.join(room);

        io.emit('updateUsersRooms', { users: Object.values(users), rooms: Object.keys(rooms) });

        socket.emit('message', { username: 'System', message: `Welcome ${username}` });
        socket.broadcast.to(room).emit('message', { username: 'System', message: `${username} has joined the room` });
        console.log(`${username} joined ${room}`);
    });

    socket.on('chat message', ({ username, room, message }: ChatMessage) => {
        io.to(room).emit('chat message', { username, message });
        console.log(`Message from ${username} in ${room}: ${message}`);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(user => user !== username);
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
        delete users[socket.id];
        io.emit('updateUsersRooms', { users: Object.values(users), rooms: Object.keys(rooms) });

        if (username) {
            console.log(`${username} disconnected`);
            socket.broadcast.emit('message', { username: 'System', message: `${username} has left the chat` });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
