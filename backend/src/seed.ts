import "./env";
import { hashPassword } from "./auth";
import { prisma } from "./prisma";
import { DEFAULT_POINTS } from "./types";

// Popula algumas atividades de exemplo para facilitar os testes/demo.
const seedActivities = [
  { name: "Abertura do Evento", type: "keynote" as const },
  { name: "Palestra: O futuro do desenvolvimento com IA", type: "palestra" as const },
  { name: "Workshop: Do zero ao deploy", type: "workshop" as const },
  { name: "Mesa redonda: Carreira em Software Houses", type: "mesa_redonda" as const },
  { name: "Oficina: Git na prática", type: "oficina" as const },
];

async function seed() {
  for (const s of seedActivities) {
    const exists = await prisma.activity.findFirst({ where: { name: s.name } });
    if (exists) continue;
    await prisma.activity.create({
      data: { name: s.name, type: s.type, points: DEFAULT_POINTS[s.type] },
    });
  }
  console.log("✅ Atividades de exemplo criadas no banco");

  // Cria a conta admin, se ainda não existir. Este é o único jeito de virar
  // admin no sistema — não existe cadastro público com esse papel.
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@itworks.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "TrocarSenha@123";

  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: "admin",
        isStudent: false,
        period: "",
        course: "-",
        interests: [],
      },
    });
    console.log(`✅ Conta admin criada: ${adminEmail} / senha: ${adminPassword}`);
    console.log("⚠️  Troque essa senha depois do primeiro login (defina ADMIN_EMAIL/ADMIN_PASSWORD para customizar).");
  } else {
    console.log(`ℹ️  Conta admin já existe (${adminEmail}), nada a fazer.`);
  }
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
