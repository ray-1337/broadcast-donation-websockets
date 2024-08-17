require("dotenv/config");

const Express = require("express");
const app = Express();
const PORT = 10000;

const { Server } = require('socket.io');

app
.get("/donation-callback", (req, res) => {
  console.log("GET", req.body);
  res.status(200).end();
})
.post("/donation-callback", (req, res) => {
  console.log("POST", req.body);
  res.status(200).end();
});

const server = app.listen(PORT, () => {
  console.log(`API listened on ${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => console.log('A user disconnected'));
});