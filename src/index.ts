import { io } from "socket.io-client";

const socket = io();

const form = document.getElementById('form') as HTMLFormElement;
const input = document.getElementById('input') as HTMLInputElement;
const messages = document.getElementById('messages') as HTMLUListElement;
const usersList = document.getElementById('users') as HTMLUListElement;
const roomsList = document.getElementById('rooms') as HTMLUListElement;

const username = prompt('Enter your username:');
const room = prompt('Enter the room name:');

socket.emit('join', { username, room });

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value.trim()) {
        socket.emit('chat message', { username, room, message: input.value.trim() });
        input.value = '';
    }
});

socket.on('chat message', function(data: { username: string, message: string }) {
    const item = document.createElement('li');
    item.textContent = `${data.username}: ${data.message}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('updateUsersRooms', function(data: { users: string[], rooms: string[] }) {
    usersList.innerHTML = '';
    roomsList.innerHTML = '';

    data.users.forEach(user => {
        const item = document.createElement('li');
        item.textContent = user;
        usersList.appendChild(item);
    });

    data.rooms.forEach(room => {
        const item = document.createElement('li');
        item.textContent = room;
        roomsList.appendChild(item);
    });
});
