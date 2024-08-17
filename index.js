require("dotenv/config");

const Express = require("express");
const app = Express();
const PORT = 10000;

const { Server } = require('socket.io');

app.use(Express.json({type: "application/json"}));

});

const server = app.listen(PORT, () => {
  console.log(`API listened on ${PORT}`);
});

io.use((socket, next) => {
  if (!socket.handshake.headers?.authorization?.length) {
    return next(new Error("Invalid authentication header."));
  };

  if (socket.handshake.headers.authorization !== process.env.WS_SECRET_KEY) {
    return next(new Error("Authentication failed."));
  };

  next();
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => console.log('A user disconnected'));
});