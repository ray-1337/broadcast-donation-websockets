const Express = require("express");
const app = Express();
const PORT = 10000;

const { Server } = require('socket.io');

app.post("/donation-callback", (req, res) => {
  console.log(req.body);
});

const server = app.listen(PORT, () => {
  console.log(`API listened on ${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => console.log('A user disconnected'));
});