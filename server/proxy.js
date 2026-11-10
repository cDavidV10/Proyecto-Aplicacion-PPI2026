import express from "express";
import proxy from "express-http-proxy";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PROXY_PORT || config.frontalPort;
const targets = config.targetNodes;
let nextNode = 0;

app.use(express.static(path.join(__dirname, "../client")));

app.use(
  "/api",
  (req, res, next) => {
    req.proxyTarget = targets[nextNode];
    nextNode = (nextNode + 1) % targets.length;
    next();
  },
  proxy((req) => req.proxyTarget, {
    proxyReqPathResolver(req) {
      return req.originalUrl;
    },
  }),
);

app.listen(PORT, () => {
  console.log(`[PROXY BALANCEADOR] Corriendo en http://localhost:${PORT}`);
});
