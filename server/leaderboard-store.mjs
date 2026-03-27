import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const dataFile = path.join(dataDir, "leaderboard.json");

const databaseUrl =
  process.env.LEADERBOARD_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  "";
const runningOnVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

let mutationQueue = Promise.resolve();
let sqlClient = null;
let schemaPromise = null;

function normalizeTesterName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function getTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (value instanceof Date) {
    return Math.max(0, value.getTime());
  }

  if (typeof value === "string" && value.length > 0) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return 0;
}

function normalizeEntry(record) {
  const name = normalizeTesterName(record?.name);
  const id = typeof record?.id === "string" ? record.id : "";
  if (!name || !id) {
    return null;
  }

  return {
    id,
    name,
    totalScore: Math.max(0, Number(record?.totalScore ?? record?.total_score) || 0),
    slimeScore: Math.max(0, Number(record?.slimeScore ?? record?.slime_score) || 0),
    cookingScore: Math.max(0, Number(record?.cookingScore ?? record?.cooking_score) || 0),
    drivingScore: Math.max(0, Number(record?.drivingScore ?? record?.driving_score) || 0),
    lastPlayedAt: getTimestamp(record?.lastPlayedAt ?? record?.last_played_at),
  };
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    return b.lastPlayedAt - a.lastPlayedAt;
  });
}

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function shouldUsePostgres() {
  return databaseUrl.length > 0;
}

function ensureDatabaseConfigured() {
  if (shouldUsePostgres()) {
    return;
  }

  if (runningOnVercel) {
    throw createError(
      500,
      "Leaderboard database is not configured. Add LEADERBOARD_DATABASE_URL, POSTGRES_URL or DATABASE_URL to Vercel."
    );
  }
}

function getSqlClient() {
  if (!shouldUsePostgres()) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
    });
  }

  return sqlClient;
}

async function ensureSchema() {
  if (!shouldUsePostgres()) {
    ensureDatabaseConfigured();
    return;
  }

  if (!schemaPromise) {
    const sql = getSqlClient();
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS leaderboard_testers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          total_score INTEGER NOT NULL DEFAULT 0,
          slime_score INTEGER NOT NULL DEFAULT 0,
          cooking_score INTEGER NOT NULL DEFAULT 0,
          driving_score INTEGER NOT NULL DEFAULT 0,
          last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE leaderboard_testers
        ADD COLUMN IF NOT EXISTS driving_score INTEGER NOT NULL DEFAULT 0
      `;

      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_testers_name_lower_idx
        ON leaderboard_testers ((LOWER(name)))
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS leaderboard_testers_rank_idx
        ON leaderboard_testers (total_score DESC, last_played_at DESC)
      `;
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
}

async function listLeaderboardEntriesFromPostgres() {
  await ensureSchema();
  const sql = getSqlClient();
  const rows = await sql`
    SELECT
      id,
      name,
      total_score,
      slime_score,
      cooking_score,
      driving_score,
      last_played_at
    FROM leaderboard_testers
    ORDER BY total_score DESC, last_played_at DESC, name ASC
  `;

  return rows
    .map((entry) => normalizeEntry(entry))
    .filter((entry) => Boolean(entry));
}

async function activateTesterInPostgres(nameInput, allowRetry = true) {
  const name = normalizeTesterName(nameInput);
  if (!name) {
    throw createError(400, "Tester name is required");
  }

  await ensureSchema();
  const sql = getSqlClient();
  const existingRows = await sql`
    SELECT id
    FROM leaderboard_testers
    WHERE LOWER(name) = LOWER(${name})
    LIMIT 1
  `;

  if (existingRows.length > 0) {
    const updatedRows = await sql`
      UPDATE leaderboard_testers
      SET
        name = ${name},
        last_played_at = NOW()
      WHERE id = ${existingRows[0].id}
      RETURNING
        id,
        name,
        total_score,
        slime_score,
        cooking_score,
        driving_score,
        last_played_at
    `;

    return {
      entry: normalizeEntry(updatedRows[0]),
      entries: await listLeaderboardEntriesFromPostgres(),
    };
  }

  try {
    const insertedRows = await sql`
      INSERT INTO leaderboard_testers (
        id,
        name,
        total_score,
        slime_score,
        cooking_score,
        driving_score,
        last_played_at
      )
      VALUES (
        ${randomUUID()},
        ${name},
        0,
        0,
        0,
        0,
        NOW()
      )
      RETURNING
        id,
        name,
        total_score,
        slime_score,
        cooking_score,
        driving_score,
        last_played_at
    `;

    return {
      entry: normalizeEntry(insertedRows[0]),
      entries: await listLeaderboardEntriesFromPostgres(),
    };
  } catch (error) {
    if (allowRetry && error?.code === "23505") {
      return activateTesterInPostgres(name, false);
    }

    throw error;
  }
}

async function addLeaderboardScoreInPostgres(payload) {
  const testerId = typeof payload?.testerId === "string" ? payload.testerId : "";
  const category = payload?.category;
  const delta = Math.trunc(Number(payload?.delta) || 0);

  if (!testerId) {
    throw createError(400, "Tester id is required");
  }

  if (category !== "slime" && category !== "cooking" && category !== "driving") {
    throw createError(400, "Unknown leaderboard category");
  }

  await ensureSchema();
  const sql = getSqlClient();

  if (delta === 0) {
    const entryRows = await sql`
      SELECT
        id,
        name,
        total_score,
        slime_score,
        cooking_score,
        driving_score,
        last_played_at
      FROM leaderboard_testers
      WHERE id = ${testerId}
      LIMIT 1
    `;

    return {
      entry: entryRows[0] ? normalizeEntry(entryRows[0]) : null,
      entries: await listLeaderboardEntriesFromPostgres(),
    };
  }

  const updatedRows =
    category === "slime"
      ? await sql`
          UPDATE leaderboard_testers
          SET
            total_score = GREATEST(0, total_score + ${delta}),
            slime_score = GREATEST(0, slime_score + ${delta}),
            last_played_at = NOW()
          WHERE id = ${testerId}
          RETURNING
            id,
            name,
            total_score,
            slime_score,
            cooking_score,
            driving_score,
            last_played_at
        `
      : category === "cooking"
        ? await sql`
            UPDATE leaderboard_testers
            SET
              total_score = GREATEST(0, total_score + ${delta}),
              cooking_score = GREATEST(0, cooking_score + ${delta}),
              last_played_at = NOW()
            WHERE id = ${testerId}
            RETURNING
              id,
              name,
              total_score,
              slime_score,
              cooking_score,
              driving_score,
              last_played_at
          `
        : await sql`
            UPDATE leaderboard_testers
            SET
              total_score = GREATEST(0, total_score + ${delta}),
              driving_score = GREATEST(0, driving_score + ${delta}),
              last_played_at = NOW()
            WHERE id = ${testerId}
            RETURNING
              id,
              name,
              total_score,
              slime_score,
              cooking_score,
              driving_score,
              last_played_at
          `;

  if (updatedRows.length === 0) {
    throw createError(404, "Tester not found");
  }

  return {
    entry: normalizeEntry(updatedRows[0]),
    entries: await listLeaderboardEntriesFromPostgres(),
  };
}

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]\n", "utf8");
  }
}

async function readEntriesFromFile() {
  await ensureDataFile();
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeEntry(entry))
      .filter((entry) => Boolean(entry));
  } catch {
    return [];
  }
}

async function writeEntriesToFile(entries) {
  await ensureDataFile();
  await writeFile(dataFile, `${JSON.stringify(sortEntries(entries), null, 2)}\n`, "utf8");
}

function queueMutation(task) {
  const nextTask = mutationQueue.then(task, task);
  mutationQueue = nextTask.catch(() => undefined);
  return nextTask;
}

async function listLeaderboardEntriesFromFile() {
  const entries = await readEntriesFromFile();
  return sortEntries(entries);
}

async function activateTesterInFile(nameInput) {
  const name = normalizeTesterName(nameInput);
  if (!name) {
    throw createError(400, "Tester name is required");
  }

  return queueMutation(async () => {
    const entries = await readEntriesFromFile();
    let entry = entries.find(
      (candidate) => candidate.name.toLowerCase() === name.toLowerCase()
    );

    if (!entry) {
      entry = {
        id: randomUUID(),
        name,
        totalScore: 0,
        slimeScore: 0,
        cookingScore: 0,
        drivingScore: 0,
        lastPlayedAt: Date.now(),
      };
      entries.push(entry);
    } else {
      entry.name = name;
      entry.lastPlayedAt = Date.now();
    }

    await writeEntriesToFile(entries);
    return {
      entry,
      entries: sortEntries(entries),
    };
  });
}

async function addLeaderboardScoreInFile(payload) {
  const testerId = typeof payload?.testerId === "string" ? payload.testerId : "";
  const category = payload?.category;
  const delta = Math.trunc(Number(payload?.delta) || 0);

  if (!testerId) {
    throw createError(400, "Tester id is required");
  }

  if (category !== "slime" && category !== "cooking" && category !== "driving") {
    throw createError(400, "Unknown leaderboard category");
  }

  if (delta === 0) {
    const entries = await readEntriesFromFile();
    return {
      entry: entries.find((entry) => entry.id === testerId) ?? null,
      entries: sortEntries(entries),
    };
  }

  return queueMutation(async () => {
    const entries = await readEntriesFromFile();
    const entry = entries.find((candidate) => candidate.id === testerId);
    if (!entry) {
      throw createError(404, "Tester not found");
    }

    entry.totalScore = Math.max(0, entry.totalScore + delta);
    if (category === "slime") {
      entry.slimeScore = Math.max(0, entry.slimeScore + delta);
    } else if (category === "cooking") {
      entry.cookingScore = Math.max(0, entry.cookingScore + delta);
    } else {
      entry.drivingScore = Math.max(0, entry.drivingScore + delta);
    }
    entry.lastPlayedAt = Date.now();

    await writeEntriesToFile(entries);
    return {
      entry,
      entries: sortEntries(entries),
    };
  });
}

export async function listLeaderboardEntries() {
  if (shouldUsePostgres()) {
    return listLeaderboardEntriesFromPostgres();
  }

  ensureDatabaseConfigured();
  return listLeaderboardEntriesFromFile();
}

export async function activateTester(nameInput) {
  if (shouldUsePostgres()) {
    return activateTesterInPostgres(nameInput);
  }

  ensureDatabaseConfigured();
  return activateTesterInFile(nameInput);
}

export async function addLeaderboardScore(payload) {
  if (shouldUsePostgres()) {
    return addLeaderboardScoreInPostgres(payload);
  }

  ensureDatabaseConfigured();
  return addLeaderboardScoreInFile(payload);
}
