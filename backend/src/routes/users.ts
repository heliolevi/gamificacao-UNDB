import { User } from "@prisma/client";
import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import { requireAdmin, requireAuth } from "../auth";
import { prisma } from "../prisma";
import { progressToNext } from "../rank";

export const usersRouter = Router();

function serializeUser(u: User, stats?: { presences: number; connections: number }) {
  const { pct, current } = progressToNext(u.xp);
  const { passwordHash: _passwordHash, ...safe } = u;
  return {
    ...safe,
    rank: current.name,
    rankColor: current.color,
    rankIcon: current.icon,
    rankProgressPct: pct,
    nextRankXp: current.nextXp,
    qrPayload: `USER:${u.id}`,
    stats,
  };
}

usersRouter.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const [presences, connections] = await Promise.all([
    prisma.presenceScan.count({ where: { userId: user.id } }),
    prisma.connection.count({ where: { OR: [{ userAId: user.id }, { userBId: user.id }] } }),
  ]);

  res.json(serializeUser(user, { presences, connections }));
}));

usersRouter.get("/", requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users.map((u) => serializeUser(u)));
}));
