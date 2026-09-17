import { User } from "@prisma/client";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  clearAuthCookie,
  hashPassword,
  requireAuth,
  setAuthCookie,
  signToken,
  verifyPassword,
} from "../auth";
import { prisma } from "../prisma";
import { progressToNext } from "../rank";

export const authRouter = Router();

function serializeUser(u: User) {
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
  };
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
    isStudent: z.boolean(),
    period: z.string().optional(),
    course: z.string().min(1, "Informe o curso/área"),
    interests: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.isStudent && !data.period?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o período/semestre",
        path: ["period"],
      });
    }
  });

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" });
  }
  const { name, email, password, isStudent, period, course, interests } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists) {
    return res.status(409).json({ error: "Já existe uma conta com esse e-mail" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "participante",
      isStudent,
      period: isStudent ? (period ?? "").trim() : "",
      course: course.trim(),
      interests,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json(serializeUser(user));
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" });
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha incorretos" });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "E-mail ou senha incorretos" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  setAuthCookie(res, token);
  res.json(serializeUser(user));
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ error: "Não autenticado" });
  }
  res.json(serializeUser(user));
});
