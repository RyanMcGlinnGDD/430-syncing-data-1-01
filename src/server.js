const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

// determine active port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// read client html into memory
const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`listening on 127.0.0.1: ${port}`);

// pass http server into socketio
const io = socketio(app);

// join logic, adds users to room1
const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    console.log('joining room...');
    socket.join('room1');
  });
};

let myNum = 0;

// increments myNumber and emits to client
const onIncrementValueRequest = (sock) => {
  const socket = sock;

  socket.on('incrementValueRequest', () => {
    console.log('sending incremented value...');
    myNum += 5;

    const messageData = {
      message: myNum,
    };

    io.sockets.in('room1').emit('serveIncrementedValue', messageData);
  });
};

// serve the initial value to client
const onInitialValueRequest = (sock) => {
  const socket = sock;

  socket.on('initialValueRequest', () => {
    console.log('sending initial value...');

    const messageData = {
      message: myNum,
    };

    socket.emit('serveInitialValue', messageData);
  });
};

// disconnect logic, removes users from room1
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log('disconnecting from server...');
    socket.leave('room1');
  });
};

// connect logic, attaches events
io.sockets.on('connection', (socket) => {
  console.log('connecting');

  onJoined(socket);
  onInitialValueRequest(socket);
  onIncrementValueRequest(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
