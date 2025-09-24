import express from "express";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Guardamos triggers (false por defecto)
let triggers = [false, false, false, false];

app.use(bodyParser.json());

// --- API para leer triggers ---
app.get("/api/servos", (req, res) => {
  res.json({ triggers });
  // 🔄 Después de enviar, reseteamos triggers para que no se repitan
  triggers = [false, false, false, false];
});

// --- API para activar un trigger ---
app.post("/api/servos/:id/trigger", (req, res) => {
  const id = Number(req.params.id);
  if (id >= 0 && id < triggers.length) {
    triggers[id] = true;
    res.json({ message: `Trigger activado para servo ${id}` });
  } else {
    res.status(400).json({ error: "ID de servo inválido" });
  }
});

app.use(express.static(path.join(process.cwd())));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
