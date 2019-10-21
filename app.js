require('dotenv').config();

const express = require('express');
const socket = require('socket.io');
const app = express();

app.use(express.static('public'));

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server running at ${port}`);
});

const io = socket(server);

io.on('connection', socket => {
    console.log(`Connected to socket`);
    
    // user plays
    socket.on('play', () => {
      socket.broadcast.emit('play');
    });

    // user pauses
    socket.on('pause', () => {
      socket.broadcast.emit('pause');
    });

    // user seeks
    socket.on('seek', data => {
      socket.broadcast.emit('seek', data);
    });


})
