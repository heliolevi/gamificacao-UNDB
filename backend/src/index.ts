import "./env";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { activitiesRouter } from "./routes/activities";
import { authRouter } from "./routes/auth";
import { leaderboardRouter } from "./routes/leaderboard";
import { scanRouter } from "./routes/scan";
import { usersRouter } from "./routes/users";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "IT WORKS API" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/scan", scanRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  }
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`🎮 IT WORKS API rodando em http://localhost:${PORT}`);
});
