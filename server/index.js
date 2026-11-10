import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SESSION_SECRET) {
  throw new Error("Falta SESSION_SECRET");
}

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_NAME = process.env.NODE_NAME || `Nodo-Puerto-${PORT}`;

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("[Redis Error]", err));
await redisClient.connect();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: "pwa_cluster:" }),
    name: "pwa_cluster_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

const USUARIOS = { admin: "1234" };

app.post("/api/login", (req, res) => {
  const { usuario, clave } = req.body;

  if (USUARIOS[usuario] && USUARIOS[usuario] === clave) {
    req.session.usuario = usuario;
    return res.json({ ok: true, usuario, nodo: NODE_NAME });
  }

  res.status(401).json({ ok: false, mensaje: "Credenciales incorrectas" });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("pwa_cluster_sid");
    res.json({ ok: true });
  });
});

app.get("/api/info", (req, res) => {
  req.session.views = (req.session.views || 0) + 1;

  res.json({
    nodo: NODE_NAME,
    puerto: PORT,
    sessionId: req.sessionID ? req.sessionID.substring(0, 6) : "N/A",
    fullSessionId: req.sessionID,
    visitas: req.session.views,
    usuario: req.session.usuario || null,
    env: process.env.NODE_ENV || "development",
  });
});

app.listen(PORT, () => {
  console.log(`[${NODE_NAME}] listo y escuchando en http://localhost:${PORT}`);
});
