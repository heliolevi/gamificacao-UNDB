import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { mutate, readDb } from "../db";
import { Activity, DEFAULT_POINTS } from "../types";

export const activitiesRouter = Router();

const createActivitySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["palestra", "workshop", "mesa_redonda", "keynote", "oficina"]),
  points: z.number().int().positive().optional(),
});

activitiesRouter.post("/", (req, res) => {
  const parsed = createActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos" });
  }
  const { name, type, points } = parsed.data;

  const activity: Activity = {
    id: uuid(),
    name: name.trim(),
    type,
    points: points ?? DEFAULT_POINTS[type],
    createdAt: new Date().toISOString(),
  };

  mutate((db) => db.activities.push(activity));

  res.status(201).json({ ...activity, qrPayload: `ACT:${activity.id}` });
});

activitiesRouter.get("/", (_req, res) => {
  const db = readDb();
  res.json(db.activities.map((a) => ({ ...a, qrPayload: `ACT:${a.id}` })));
});

activitiesRouter.get("/:id", (req, res) => {
  const db = readDb();
  const activity = db.activities.find((a) => a.id === req.params.id);
  if (!activity) return res.status(404).json({ error: "Atividade não encontrada" });
  res.json({ ...activity, qrPayload: `ACT:${activity.id}` });
});
