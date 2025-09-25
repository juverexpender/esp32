// index.js
import express from "express";
import bodyParser from "body-parser";
import { WebcastPushConnection } from "tiktok-live-connector";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

app.use(bodyParser.json());
app.use(express.static("public")); // donde pondrás index.html

// === Estado de servos ===
let servoStates = [0, 0, 0, 0]; // 0 = reposo, 1 = activado

// === Rutas API ===
app.get("/api/state", (req, res) => {
  res.json({ servos: servoStates });
});

app.post("/api/servo/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 1 && id <= 4) {
    servoStates[id - 1] = 1; // activar servo
    io.emit("servo", { id }); // notificar a clientes
    console.log(`🔧 Servo ${id} activado desde botón`);
    setTimeout(() => (servoStates[id - 1] = 0), 1500); // vuelve a reposo
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: "Servo inválido" });
  }
});

// === TikTok Live Connection ===
const tiktokUsername = "juverbriceoterron";
const tiktokLive = new WebcastPushConnection(tiktokUsername);

tiktokLive.connect().then(state => {
  console.log(`✅ Conectado a la sala de TikTok: ${state.roomId}`);
}).catch(err => {
  console.error("❌ Error conectando a TikTok:", err);
});

// Escuchar comentarios
tiktokLive.on("chat", (data) => {
  console.log(`💬 ${data.uniqueId}: ${data.comment}`);
  io.emit("chat", { user: data.uniqueId, comment: data.comment });

  // Si el comentario es "1","2","3","4" activamos el servo correspondiente
  const num = parseInt(data.comment.trim());
  if (num >= 1 && num <= 4) {
    servoStates[num - 1] = 1;
    io.emit("servo", { id: num });
    console.log(`🎯 Servo ${num} activado desde TikTok`);
    setTimeout(() => (servoStates[num - 1] = 0), 1500);
  }
});

// === WebSocket para interfaz ===
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado a Socket.IO");
  socket.emit("init", { servos: servoStates });
});

// === Iniciar servidor ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
