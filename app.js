const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Define a mapping of special words and their corresponding emojis
const emojiMapping = {
  'hey': '👋',
  'smile': '😊',
  'heart': '❤️',
  'love': '❤️',
  'react': '⚛️',
  'woah': '😲',
  'lol': '😂',
  'like': '❤️',
  'congratulations': '🎉',
  // Add more mappings as needed
};

const onlineUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user join', (username) => {
    onlineUsers.push(username);
    io.emit('user join', onlineUsers);
    socket.emit('online users', onlineUsers);
  });

  socket.on('chat message', (msg) => {
    // Replace special words with emojis
    const words = msg.text.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (emojiMapping.hasOwnProperty(words[i].toLowerCase())) {
        words[i] = emojiMapping[words[i].toLowerCase()];
      }
    }
    msg.text = words.join(' ');

    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    const index = onlineUsers.indexOf(socket.username);
    if (index !== -1) {
      onlineUsers.splice(index, 1);
      io.emit('user leave', onlineUsers);
    }
    console.log('A user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
