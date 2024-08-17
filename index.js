require("dotenv/config");

const Express = require("express");
const app = Express();
const PORT = 10000;

const { Server } = require('socket.io');
const io = new Server(server);

const cache = new Set();

app.use(Express.json({type: "application/json"}));

app.post("/donation-callback", (req, res) => {
  const receivedTime = Date.now();

  if (!req?.body?.id || !req.body?.donator_name || !req.body?.message || typeof req.body?.amount_raw !== "number") {
    return res.status(400).end();
  };

  if (req.body?.type !== "donation") {
    return res.status(403).send("invalid type");
  };

  if (!req?.query?.token || req.query.token !== process.env.WEBHOOK_ACCESS_KEY) {
    return res.status(403).end();
  };

  if (cache.has(req.body.id)) {
    return res.status(409).end();
  };
  
  cache.add(req.body.id);

  let message = req.body.message;
  let amount = req.body.amount_raw;
  let name = req.body.donator_name;

  io.emit("new-donation", {
    message, amount, name,
    createdAt: receivedTime
  });

  console.log(`[NEW DONATION] ${message} - Rp. ${Number(amount || 0).toLocaleString()} - ${new Date(receivedTime).toLocaleString()}`);

  return res.status(200).end();
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