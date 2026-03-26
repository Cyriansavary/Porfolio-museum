import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleLeaderboardApiRequest } from "./server/leaderboard-api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "dist");
const port = Number(process.env.PORT) || 4173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", mimeTypes[ext] ?? "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

function resolveStaticPath(urlPathname) {
  const requestedPath = urlPathname === "/" ? "index.html" : urlPathname.slice(1);
  const filePath = path.resolve(distDir, requestedPath);

  if (!filePath.startsWith(distDir)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath;
  }

  const fallback = path.join(distDir, "index.html");
  return existsSync(fallback) ? fallback : null;
}

const server = http.createServer(async (req, res) => {
  if (await handleLeaderboardApiRequest(req, res)) {
    return;
  }

  const url = new URL(req.url ?? "/", "http://localhost");
  const filePath = resolveStaticPath(url.pathname);
  if (!filePath) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  sendFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});
