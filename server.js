// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Object to hold current players
const players = {};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Add new player
  players[socket.id] = {
    x: 400,
    y: 300,
    rotation: 0,
    username: 'anonymous',
    health: 100,
  };

  // Send current players to the newly connected player
  socket.emit('currentPlayers', players);

  // Inform other players about the new player
  socket.broadcast.emit('newPlayer', { playerId: socket.id, playerData: players[socket.id] });

  // Listen for player movement updates from the client
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].rotation = movementData.rotation;
      players[socket.id].username = movementData.username || players[socket.id].username;

      // Broadcast the movement to all other players
      socket.broadcast.emit('playerMoved', { playerId: socket.id, playerData: players[socket.id] });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    // Remove player from our players object
    delete players[socket.id];
    // Notify remaining players
    io.emit('playerDisconnected', socket.id);
  });
});

// Start the server on port 3000
http.listen(3000, () => {
  console.log('Listening on *:3000');
});
