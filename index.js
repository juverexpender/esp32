import express from "express";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

let servoAngle = 90; // Ángulo inicial (centro)

app.use(bodyParser.json());

// --- API para el servo ---
app.get("/api/servo", (req, res) => {
  res.json({ angle: servoAngle });
});

app.post("/api/servo", (req, res) => {
  const { angle } = req.body;
  if (typeof angle === "number" && angle >= 0 && angle <= 180) {
    servoAngle = angle;
    res.json({ message: "Ángulo actualizado", angle: servoAngle });
  } else {
    res.status(400).json({ error: "Ángulo inválido (0-180)" });
  }
});

// --- Servir HTML ---
app.use(express.static(path.join(process.cwd())));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
