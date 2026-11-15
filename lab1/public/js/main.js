const params = new URLSearchParams(location.search);
const username = params.get('username');
const room = params.get('room');
if (!username || !room) location.href = 'index.html';

const socket = io();
const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');

document.getElementById('room-name').textContent = room;
document.getElementById('user-name').textContent = username;

socket.emit('joinRoom', { username, room });

socket.on('joinError', (text) => {
  alert(text);
  location.href = 'index.html';
});

socket.on('roomUsers', ({ users }) => {
  const list = document.getElementById('users');
  list.replaceChildren(...users.map((u) => {
    const li = document.createElement('li');
    li.textContent = u.username;
    return li;
  }));
});

socket.on('message', (msg) => {
  addMessage(msg);
  messages.scrollTop = messages.scrollHeight;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  socket.emit('chatMessage', text);
  input.value = '';
  input.focus();
});

// Колір повідомлення: системне, власне, чуже чи автоматичне
function addMessage({ username: author, text, time, type, senderId }) {
  const div = document.createElement('div');
  let kind = type;
  if (type === 'user') kind = senderId === socket.id ? 'own' : 'other';
  div.className = `message ${kind}`;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.innerHTML = '<b></b> <span></span>';
  meta.querySelector('b').textContent = author;
  meta.querySelector('span').textContent = time;

  const body = document.createElement('p');
  body.textContent = text;

  div.append(meta, body);
  messages.appendChild(div);
}
