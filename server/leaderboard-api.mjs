import {
  activateTester,
  addLeaderboardScore,
  listLeaderboardEntries,
} from "./leaderboard-store.mjs";

function setJsonHeaders(res, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

function sendJson(res, statusCode, payload) {
  setJsonHeaders(res, statusCode);
  res.end(JSON.stringify(payload));
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
  }
}

export async function handleLeaderboardApiRequest(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (!url.pathname.startsWith("/api/leaderboard")) {
    return false;
  }

  try {
    if (req.method === "OPTIONS") {
      setJsonHeaders(res, 204);
      res.end();
      return true;
    }

    if (req.method === "GET" && url.pathname === "/api/leaderboard") {
      const entries = await listLeaderboardEntries();
      sendJson(res, 200, { entries });
      return true;
    }

    if (req.method === "POST" && url.pathname === "/api/leaderboard/testers") {
      const body = await readRequestBody(req);
      const result = await activateTester(body.name);
      sendJson(res, 200, result);
      return true;
    }

    if (req.method === "POST" && url.pathname === "/api/leaderboard/score") {
      const body = await readRequestBody(req);
      const result = await addLeaderboardScore(body);
      sendJson(res, 200, result);
      return true;
    }

    sendJson(res, 404, { error: "Not found" });
    return true;
  } catch (error) {
    const statusCode =
      typeof error?.status === "number" ? error.status : 500;
    sendJson(res, statusCode, {
      error:
        error instanceof Error ? error.message : "Unexpected leaderboard error",
    });
    return true;
  }
}

export function createLeaderboardMiddleware() {
  return async (req, res, next) => {
    const handled = await handleLeaderboardApiRequest(req, res);
    if (!handled) {
      next();
    }
  };
}
