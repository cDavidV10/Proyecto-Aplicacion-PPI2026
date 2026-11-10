import express from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_NAME = process.env.NODE_NAME || `Nodo-${PORT}`;

// Configuración de Sesión Compartida
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 },
  }),
);

app.use(express.json());

// Sirve los archivos estáticos de la PWA desde la carpeta ../client
app.use(express.static(path.join(__dirname, "../client")));

// Endpoint API para verificar qué nodo responde y mantener la sesión
app.get("/api/info", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
    req.session.userSessionId = Math.random().toString(36).substring(7);
  } else {
    req.session.views++;
  }

  res.json({
    nodo: NODE_NAME,
    puerto: PORT,
    sessionId: req.session.userSessionId,
    visitasEnSesion: req.session.views,
    entorno: config.env,
  });
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 ${NODE_NAME} corriendo en puerto ${PORT}`);
});
