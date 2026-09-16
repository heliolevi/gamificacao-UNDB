import cors from "cors";
import express from "express";
import { activitiesRouter } from "./routes/activities";
import { leaderboardRouter } from "./routes/leaderboard";
import { scanRouter } from "./routes/scan";
import { usersRouter } from "./routes/users";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "IT WORKS API" }));

app.use("/api/users", usersRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/scan", scanRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));

app.listen(PORT, () => {
  console.log(`🎮 IT WORKS API rodando em http://localhost:${PORT}`);
});
