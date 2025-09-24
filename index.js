import express from "express";
import bodyParser from "body-parser";
import path from "path";
import TikTokLiveConnection from "tiktok-live-connector";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Variables globales ---
let triggers = [false, false, false, false];

// --- Configurar TikTok ---
const tiktokUsername = "tu_usuario_tiktok"; // <-- cámbialo por tu username
const tiktokLiveConnection = new TikTokLiveConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
  console.log(`✅ Conectado a la sala de TikTok de ${tiktokUsername}`);
}).catch(err => {
  console.error("❌ Error conectando a TikTok:", err);
});

// --- Escuchar comentarios ---
tiktokLiveConnection.on("chat", data => {
  if (!data.comment) return;
  const msg = data.comment.trim();
  if (["1", "2", "3", "4"].includes(msg)) {
    const index = parseInt(msg) - 1;
    triggers[index] = true;
    console.log(`🎯 TikTok: Activado servo ${index+1} por comentario`);
  }
});

// --- API REST para ESP32 ---
app.use(bodyParser.json());

app.get("/api/servos", (req, res) => {
  res.json({ triggers });
  triggers = [false, false, false, false]; // reset después de enviar
});

app.post("/api/servos/:id/trigger", (req, res) => {
  const id = Number(req.params.id);
  if (id >= 0 && id < triggers.length) {
    triggers[id] = true;
    res.json({ message: `Trigger activado para servo ${id}` });
  } else {
    res.status(400).json({ error: "ID de servo inválido" });
  }
});

// --- Servir frontend ---
app.use(express.static(path.join(process.cwd())));

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
