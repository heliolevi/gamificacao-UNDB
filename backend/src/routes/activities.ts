import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../auth";
import { prisma } from "../prisma";
import { DEFAULT_POINTS } from "../types";

export const activitiesRouter = Router();

const createActivitySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["palestra", "workshop", "mesa_redonda", "keynote", "oficina"]),
  points: z.number().int().positive().optional(),
});

activitiesRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = createActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos" });
  }
  const { name, type, points } = parsed.data;

  const activity = await prisma.activity.create({
    data: {
      name: name.trim(),
      type,
      points: points ?? DEFAULT_POINTS[type],
    },
  });

  res.status(201).json({ ...activity, qrPayload: `ACT:${activity.id}` });
});

activitiesRouter.get("/", requireAuth, async (_req, res) => {
  const activities = await prisma.activity.findMany();
  res.json(activities.map((a) => ({ ...a, qrPayload: `ACT:${a.id}` })));
});

activitiesRouter.get("/:id", requireAuth, async (req, res) => {
  const activity = await prisma.activity.findUnique({ where: { id: req.params.id } });
  if (!activity) return res.status(404).json({ error: "Atividade não encontrada" });
  res.json({ ...activity, qrPayload: `ACT:${activity.id}` });
});
