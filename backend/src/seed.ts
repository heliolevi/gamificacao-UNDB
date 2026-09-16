import { v4 as uuid } from "uuid";
import { mutate } from "./db";
import { DEFAULT_POINTS } from "./types";

// Popula algumas atividades de exemplo para facilitar os testes/demo.
const seedActivities = [
  { name: "Abertura do Evento", type: "keynote" as const },
  { name: "Palestra: O futuro do desenvolvimento com IA", type: "palestra" as const },
  { name: "Workshop: Do zero ao deploy", type: "workshop" as const },
  { name: "Mesa redonda: Carreira em Software Houses", type: "mesa_redonda" as const },
  { name: "Oficina: Git na prática", type: "oficina" as const },
];

mutate((db) => {
  for (const s of seedActivities) {
    const exists = db.activities.some((a) => a.name === s.name);
    if (exists) continue;
    db.activities.push({
      id: uuid(),
      name: s.name,
      type: s.type,
      points: DEFAULT_POINTS[s.type],
      createdAt: new Date().toISOString(),
    });
  }
});

console.log("✅ Atividades de exemplo criadas em data/db.json");
