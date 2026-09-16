import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { mutate, readDb } from "../db";
import { progressToNext } from "../rank";

export const scanRouter = Router();

const presenceSchema = z.object({
  userId: z.string().uuid(),
  activityId: z.string().uuid(),
});

// Pilar 1: presenca. Aluno escaneia o QR Code projetado no telao ao final
// de cada atividade e ganha o XP daquela atividade. Bloqueia pontuar 2x
// na mesma atividade.
scanRouter.post("/presence", (req, res) => {
  const parsed = presenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "QR inválido ou dados incompletos" });
  }
  const { userId, activityId } = parsed.data;

  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  const activity = db.activities.find((a) => a.id === activityId);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  if (!activity) return res.status(404).json({ error: "Atividade não encontrada" });

  const already = db.presenceScans.some(
    (s) => s.userId === userId && s.activityId === activityId
  );
  if (already) {
    return res.status(409).json({ error: `Você já pontuou em "${activity.name}"` });
  }

  const result = mutate((db2) => {
    const u = db2.users.find((x) => x.id === userId)!;
    u.xp += activity.points;
    db2.presenceScans.push({
      id: uuid(),
      userId,
      activityId,
      points: activity.points,
      createdAt: new Date().toISOString(),
    });
    return u;
  });

  const { pct, current } = progressToNext(result.xp);
  res.json({
    message: `+${activity.points} XP por participar de "${activity.name}"!`,
    pointsEarned: activity.points,
    user: { ...result, rank: current.name, rankProgressPct: pct },
  });
});

const networkSchema = z.object({
  scannerId: z.string().uuid(),
  scannedId: z.string().uuid(),
});

const BASE_NETWORK_XP = 15;
const BONUS_DIFF_COURSE = 10;
const BONUS_DIFF_PERIOD = 10;

// Pilar 2: networking. Um aluno escaneia o QR do outro; os dois ganham XP.
// Bonus se forem de periodos ou cursos/areas diferentes (quebra bolhas).
scanRouter.post("/network", (req, res) => {
  const parsed = networkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "QR inválido ou dados incompletos" });
  }
  const { scannerId, scannedId } = parsed.data;

  if (scannerId === scannedId) {
    return res.status(400).json({ error: "Você não pode escanear o seu próprio QR Code" });
  }

  const db = readDb();
  const scanner = db.users.find((u) => u.id === scannerId);
  const scanned = db.users.find((u) => u.id === scannedId);
  if (!scanner) return res.status(404).json({ error: "Usuário (scanner) não encontrado" });
  if (!scanned) return res.status(404).json({ error: "Usuário (escaneado) não encontrado" });

  const alreadyConnected = db.connections.some(
    (c) =>
      (c.userAId === scannerId && c.userBId === scannedId) ||
      (c.userAId === scannedId && c.userBId === scannerId)
  );
  if (alreadyConnected) {
    return res.status(409).json({ error: `Você já se conectou com ${scanned.name}` });
  }

  let points = BASE_NETWORK_XP;
  const bonusReason: string[] = [];
  if (scanner.course !== scanned.course) {
    points += BONUS_DIFF_COURSE;
    bonusReason.push("cursos diferentes");
  }
  if (scanner.period !== scanned.period) {
    points += BONUS_DIFF_PERIOD;
    bonusReason.push("períodos diferentes");
  }

  const result = mutate((db2) => {
    const a = db2.users.find((x) => x.id === scannerId)!;
    const b = db2.users.find((x) => x.id === scannedId)!;
    a.xp += points;
    b.xp += points;
    db2.connections.push({
      id: uuid(),
      userAId: scannerId,
      userBId: scannedId,
      points,
      bonusReason,
      createdAt: new Date().toISOString(),
    });
    return { a, b };
  });

  const { pct, current } = progressToNext(result.a.xp);
  res.json({
    message:
      bonusReason.length > 0
        ? `+${points} XP! Conexão com bônus (${bonusReason.join(" e ")}) com ${scanned.name}!`
        : `+${points} XP por se conectar com ${scanned.name}!`,
    pointsEarned: points,
    bonusReason,
    connectedWith: { id: scanned.id, name: scanned.name },
    user: { ...result.a, rank: current.name, rankProgressPct: pct },
  });
});
