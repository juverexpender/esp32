let ledState = "off"; // estado inicial del LED

export default function handler(req, res) {
  if (req.method === "GET") {
    // Devuelve el estado actual del LED
    res.status(200).json({ state: ledState });
  } else if (req.method === "POST") {
    // Cambia el estado del LED (body: { state: "on"/"off" })
    try {
      const data = req.body;
      if (data.state === "on" || data.state === "off") {
        ledState = data.state;
        res.status(200).json({ message: "Estado actualizado", state: ledState });
      } else {
        res.status(400).json({ error: "Valor inválido" });
      }
    } catch {
      res.status(400).json({ error: "Solicitud inválida" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
