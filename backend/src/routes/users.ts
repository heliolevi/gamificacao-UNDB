import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { mutate, readDb } from "../db";
import { progressToNext } from "../rank";
import { User } from "../types";

export const usersRouter = Router();

const createUserSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  period: z.string().min(1, "Informe o periodo/semestre"),
  course: z.string().min(1, "Informe o curso"),
  interests: z.array(z.string()).default([]),
});

function serializeUser(u: User, stats?: { presences: number; connections: number }) {
  const { pct, current } = progressToNext(u.xp);
  return {
    ...u,
    rank: current.name,
    rankColor: current.color,
    rankIcon: current.icon,
    rankProgressPct: pct,
    nextRankXp: current.nextXp,
    qrPayload: `USER:${u.id}`,
    stats,
  };
}

usersRouter.post("/", (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos" });
  }
  const { name, period, course, interests } = parsed.data;

  const user: User = {
    id: uuid(),
    name: name.trim(),
    period: period.trim(),
    course: course.trim(),
    interests,
    xp: 0,
    createdAt: new Date().toISOString(),
  };

  mutate((db) => db.users.push(user));

  res.status(201).json(serializeUser(user));
});

usersRouter.get("/:id", (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const presences = db.presenceScans.filter((s) => s.userId === user.id).length;
  const connections = db.connections.filter(
    (c) => c.userAId === user.id || c.userBId === user.id
  ).length;

  res.json(serializeUser(user, { presences, connections }));
});

usersRouter.get("/", (_req, res) => {
  const db = readDb();
  res.json(db.users.map((u) => serializeUser(u)));
});
