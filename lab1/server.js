const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const PORT = process.env.PORT || 3000;
const ADMIN = 'Admin';

// Варіант 11: автоматичне повідомлення кожні 10 + N = 21 с
const VARIANT = 11;
const AUTO_INTERVAL_MS = (10 + VARIANT) * 1000;
const AUTO_TEXT = `Автоматичне повідомлення від ст. Ломакін М. гр. ІП-33 Варіант ${VARIANT}`;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    username = String(username || '').trim().slice(0, 30);
    room = String(room || '').trim().slice(0, 30);
    if (!username || !room) {
      socket.emit('joinError', 'Вкажіть ім’я та кімнату');
      return;
    }

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit('message', formatMessage(ADMIN, `Welcome, ${user.username}!`, 'admin'));
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(ADMIN, `${user.username} has joined!`, 'admin'));

    io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room) });
  });

  socket.on('chatMessage', (text) => {
    const user = getCurrentUser(socket.id);
    text = String(text || '').trim().slice(0, 1000);
    if (!user || !text) return;
    io.to(user.room).emit('message', formatMessage(user.username, text, 'user', socket.id));
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (!user) return;
    io.to(user.room).emit('message', formatMessage(ADMIN, `${user.username} has left!`, 'admin'));
    io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room) });
  });
});

// Розсилка всім учасникам чату (в усіх кімнатах) з інтервалом 21 с
setInterval(() => {
  const stamp = new Date().toLocaleTimeString('uk-UA');
  io.emit('message', formatMessage(ADMIN, `${AUTO_TEXT} ${stamp}`, 'auto'));
}, AUTO_INTERVAL_MS);

server.listen(PORT, () => {
  console.log(`Сервер чату: http://localhost:${PORT}`);
  console.log(`Автоматичне повідомлення кожні ${AUTO_INTERVAL_MS / 1000} с`);
});
