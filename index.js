import express from "express";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Estados iniciales de los 4 servos
let servos = [0, 0, 0, 0]; // grados (0 o 180)

app.use(bodyParser.json());

// --- API para leer estados ---
app.get("/api/servos", (req, res) => {
  res.json({ servos });
});

// --- API para cambiar un servo ---
app.post("/api/servos/:id/toggle", (req, res) => {
  const id = Number(req.params.id);
  if (id >= 0 && id < servos.length) {
    servos[id] = servos[id] === 0 ? 180 : 0; // alterna entre 0 y 180
    res.json({ message: `Servo ${id} actualizado`, servos });
  } else {
    res.status(400).json({ error: "ID de servo inválido" });
  }
});

// --- Servir el HTML ---
app.use(express.static(path.join(process.cwd())));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
