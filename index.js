import express from "express";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

let ledState = "off";

app.use(bodyParser.json());

// --- API para controlar LED ---
app.get("/api/state", (req, res) => {
  res.json({ state: ledState });
});

app.post("/api/state", (req, res) => {
  const { state } = req.body;
  if (state === "on" || state === "off") {
    ledState = state;
    res.json({ message: "Estado actualizado", state: ledState });
  } else {
    res.status(400).json({ error: "Valor inválido" });
  }
});

// --- Servir archivo HTML ---
app.use(express.static(path.join(process.cwd())));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
