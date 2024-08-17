require("dotenv/config");

const Express = require("express");
const app = Express();
const PORT = 10000;

const { Server } = require('socket.io');

const cache = new Set();

app.use(Express.json({type: "application/json"}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

const server = app.listen(PORT, () => {
  console.log(`API listened on ${PORT}`);
});

app.post("/donation-callback", (req, res) => {
  const receivedTime = Date.now();

  if (!req?.body?.id || !req.body?.donator_name || !req.body?.message || typeof req.body?.amount_raw !== "number") {
    return res.sendStatus(400);
  };

  if (req.body?.type !== "donation") {
    return res.status(403).send("invalid type");
  };

  if (!req?.query?.token || req.query.token !== process.env.WEBHOOK_ACCESS_KEY) {
    return res.sendStatus(403);
  };

  if (cache.has(req.body.id)) {
    return res.sendStatus(409);
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

  return res.sendStatus(200);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
  }
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