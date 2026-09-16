import { Router } from "express";
import { readDb } from "../db";
import { progressToNext } from "../rank";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", (req, res) => {
  const db = readDb();
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  const ranked = [...db.users]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map((u, idx) => {
      const { current } = progressToNext(u.xp);
      return {
        position: idx + 1,
        id: u.id,
        name: u.name,
        course: u.course,
        period: u.period,
        xp: u.xp,
        rank: current.name,
        rankColor: current.color,
        rankIcon: current.icon,
      };
    });

  res.json(ranked);
});
