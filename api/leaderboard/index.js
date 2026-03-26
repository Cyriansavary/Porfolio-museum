import { handleLeaderboardApiRequest } from "../../server/leaderboard-api.mjs";

export default async function handler(req, res) {
  await handleLeaderboardApiRequest(req, res);
}
