import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../asyncHandler";
import { requireAuth } from "../auth";
import { prisma } from "../prisma";
import { progressToNext } from "../rank";

export const scanRouter = Router();

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const presenceSchema = z.object({
  activityId: z.string().uuid(),
});

// Pilar 1: presenca. Aluno escaneia o QR Code projetado no telao ao final
// de cada atividade e ganha o XP daquela atividade. Bloqueia pontuar 2x
// na mesma atividade (garantido também por uma constraint unique no banco).
scanRouter.post("/presence", requireAuth, asyncHandler(async (req, res) => {
  const parsed = presenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "QR inválido ou dados incompletos" });
  }
  const { activityId } = parsed.data;
  const userId = req.userId!;

  try {
    const { user, activity } = await prisma.$transaction(
      async (tx) => {
        const activity = await tx.activity.findUnique({ where: { id: activityId } });
        if (!activity) throw new HttpError(404, "Atividade não encontrada");

        const already = await tx.presenceScan.findUnique({
          where: { userId_activityId: { userId, activityId } },
        });
        if (already) throw new HttpError(409, `Você já pontuou em "${activity.name}"`);

        await tx.presenceScan.create({ data: { userId, activityId, points: activity.points } });
        const user = await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: activity.points } },
        });

        return { user, activity };
      },
      { maxWait: 10000, timeout: 15000 }
    );

    const { pct, current } = progressToNext(user.xp);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.json({
      message: `+${activity.points} XP por participar de "${activity.name}"!`,
      pointsEarned: activity.points,
      user: { ...safeUser, rank: current.name, rankProgressPct: pct },
    });
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(409).json({ error: "Você já pontuou nessa atividade" });
    }
    throw err;
  }
}));

const networkSchema = z.object({
  scannedId: z.string().uuid(),
});

const BASE_NETWORK_XP = 15;
const BONUS_DIFF_COURSE = 10;
const BONUS_DIFF_PERIOD = 10;

// Pilar 2: networking. Um aluno escaneia o QR do outro; os dois ganham XP.
// Bonus se forem de periodos ou cursos/areas diferentes (quebra bolhas).
scanRouter.post("/network", requireAuth, asyncHandler(async (req, res) => {
  const parsed = networkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "QR inválido ou dados incompletos" });
  }
  const { scannedId } = parsed.data;
  const scannerId = req.userId!;

  if (scannerId === scannedId) {
    return res.status(400).json({ error: "Você não pode escanear o seu próprio QR Code" });
  }

  // Ordem canônica (menor id primeiro) — garante que "A escaneia B" e "B escaneia A"
  // caem na mesma linha pra constraint unique do banco travar a duplicata de verdade,
  // mesmo se os dois escanearem um ao outro no mesmo instante.
  const [userAId, userBId] = [scannerId, scannedId].sort();

  try {
    const { scanner, points, bonusReason, scanned } = await prisma.$transaction(
      async (tx) => {
        const scanner = await tx.user.findUnique({ where: { id: scannerId } });
        const scanned = await tx.user.findUnique({ where: { id: scannedId } });
        if (!scanner) throw new HttpError(404, "Usuário (scanner) não encontrado");
        if (!scanned) throw new HttpError(404, "Usuário (escaneado) não encontrado");

        const alreadyConnected = await tx.connection.findUnique({
          where: { userAId_userBId: { userAId, userBId } },
        });
        if (alreadyConnected) {
          throw new HttpError(409, `Você já se conectou com ${scanned.name}`);
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

        await tx.connection.create({
          data: { userAId, userBId, points, bonusReason },
        });
        const updatedScanner = await tx.user.update({
          where: { id: scannerId },
          data: { xp: { increment: points } },
        });
        await tx.user.update({ where: { id: scannedId }, data: { xp: { increment: points } } });

        return { scanner: updatedScanner, points, bonusReason, scanned };
      },
      { maxWait: 10000, timeout: 15000 }
    );

    const { pct, current } = progressToNext(scanner.xp);
    const { passwordHash: _passwordHash, ...safeScanner } = scanner;
    res.json({
      message:
        bonusReason.length > 0
          ? `+${points} XP! Conexão com bônus (${bonusReason.join(" e ")}) com ${scanned.name}!`
          : `+${points} XP por se conectar com ${scanned.name}!`,
      pointsEarned: points,
      bonusReason,
      connectedWith: { id: scanned.id, name: scanned.name },
      user: { ...safeScanner, rank: current.name, rankProgressPct: pct },
    });
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(409).json({ error: "Vocês já se conectaram" });
    }
    throw err;
  }
}));
