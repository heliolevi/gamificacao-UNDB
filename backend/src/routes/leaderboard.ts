import { Router } from "express";
import { requireAuth } from "../auth";
import { prisma } from "../prisma";
import { progressToNext } from "../rank";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", requireAuth, async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: limit,
  });

  const ranked = users.map((u, idx) => {
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
