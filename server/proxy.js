import express from "express";
import proxy from "express-http-proxy";
import { createServer } from "http";
import { config } from "./config.js";

const app = express();
let currentIdx = 0;

// Balanceador Round-Robin entre los 3 nodos
app.use((req, res, next) => {
  const target = config.targetNodes[currentIdx];
  currentIdx = (currentIdx + 1) % config.targetNodes.length;

  return proxy(target)(req, res, next);
});

const server = createServer(app);

server.listen(config.frontalPort, () => {
  console.log(
    `🌐 Servidor Frontal activo en http://localhost:${config.frontalPort}`,
  );
  console.log(`🔀 Redirigiendo entre nodos: ${config.targetNodes.join(", ")}`);
});
