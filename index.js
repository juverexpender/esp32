import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import TikTokLiveConnection from "tiktok-live-connector";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Estado global
let triggers = [false, false, false, false];
let tiktokConnected = false;
let lastComments = [];

// --- Configurar TikTok Live ---
const tiktokUsername = "juverbriceoterron";
const tiktokLiveConnection = new TikTokLiveConnection(tiktokUsername);

// Conectar
tiktokLiveConnection.connect().then(() => {
  console.log(`✅ Conectado a TikTok Live como ${tiktokUsername}`);
  tiktokConnected = true;
  io.emit("tiktok-status", { connected: true });
}).catch(err => {
  console.error("❌ Error al conectar a TikTok:", err);
  tiktokConnected = false;
  io.emit("tiktok-status", { connected: false });
});

// Escuchar comentarios
tiktokLiveConnection.on("chat", data => {
  const msg = data.comment?.trim();
  if (!msg) return;

  // Guardar en historial (máx 10)
  lastComments.unshift({ user: data.uniqueId, text: msg });
  if (lastComments.length > 10) lastComments.pop();

  io.emit("tiktok-comment", { user: data.uniqueId, text: msg });

  // Si es 1,2,3,4 -> activar servo
  if (["1", "2", "3", "4"].includes(msg)) {
    const index = parseInt(msg) - 1;
    triggers[index] = true;
    console.log(`🎯 Activando servo ${index + 1} (comentario de ${data.uniqueId})`);
    io.emit("servo-triggered", { id: index, user: data.uniqueId });
  }
});

// API para ESP32
app.use(bodyParser.json());

app.get("/api/servos", (req, res) => {
  res.json({ triggers });
  triggers = [false, false, false, false];
});

app.post("/api/servos/:id/trigger", (req, res) => {
  const id = Number(req.params.id);
  if (id >= 0 && id < triggers.length) {
    triggers[id] = true;
    io.emit("servo-triggered", { id, user: "Botón Web" });
    res.json({ message: `Trigger activado para servo ${id}` });
  } else {
    res.status(400).json({ error: "ID de servo inválido" });
  }
});

// Servir interfaz
app.use(express.static(path.join(__dirname)));

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
