# 🎮 IT WORKS — Gamificação do Evento (SH)

Plataforma web que substitui o "carimbo no papel": os participantes criam um
perfil, ganham um QR Code próprio e acumulam XP escaneando QR Codes de
atividades (presença) e de outros participantes (networking). Um ranking em
tempo real mostra quem está na frente, com patentes de Estagiário até
Staff / Tech Lead.

Visual cyberpunk/gamer: fundo escuro com grid, neon ciano/roxo/magenta,
glow, tipografia Orbitron/Rajdhani, barra de XP animada e pódio no ranking.

## Estrutura

```
itworks/
  backend/    API em Node.js + TypeScript + Express (porta 3333)
  frontend/   App web em React + Vite + TypeScript (porta 5173)
```

Cada pasta é um projeto Node independente, com seu próprio `package.json`.

## Como rodar localmente

Pré-requisitos: Node.js 20+ instalado e um banco Postgres (recomendado: conta
grátis no [Neon](https://neon.tech), sem cartão de crédito).

### 0. Banco de dados (uma vez só)

1. Crie uma conta no [neon.tech](https://neon.tech) (dá pra usar login do GitHub)
2. Crie um projeto novo (ex: `itworks`) — o Neon te dá uma connection string tipo
   `postgresql://usuario:senha@ep-xxxx.aws.neon.tech/neondb?sslmode=require`
3. Copie `backend/.env.example` para `backend/.env` e cole essa string real em
   `DATABASE_URL`. Aproveite pra trocar o `JWT_SECRET` e as credenciais do
   admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) nesse mesmo arquivo.
4. `backend/.env` já está no `.gitignore` — nunca commite esse arquivo.

### Opção rápida: backend + frontend juntos

Na raiz do projeto:

```bash
npm install          # instala o concurrently (só a raiz)
npm run install:all  # instala as dependências do backend e do frontend
cd backend && npm run migrate  # cria as tabelas no Postgres (só na primeira vez)
cd .. && npm run seed          # cria as atividades de exemplo e a conta admin
npm run dev                    # sobe a API (:3333) e o app (:5173) juntos, num terminal só
```

Abra `http://localhost:5173`. Os logs do backend e do frontend aparecem
coloridos e prefixados (`backend` / `frontend`) no mesmo terminal.

### Rodando cada parte separadamente

### 1. Backend (API)

```bash
cd backend
npm install
npm run migrate  # cria as tabelas no Postgres (só precisa rodar de novo se o schema mudar)
npm run seed     # cria algumas atividades de exemplo (palestras, workshop...) e a conta admin
npm run dev      # inicia a API em http://localhost:3333
```

Os dados ficam no Postgres configurado em `backend/.env` (`DATABASE_URL`), via
[Prisma](https://www.prisma.io/) (`backend/prisma/schema.prisma`).

### 2. Frontend (App)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev    # inicia o app em http://localhost:5173
```

Abra `http://localhost:5173` no navegador. O Vite já está configurado para
encaminhar chamadas `/api/*` para o backend (porta 3333).

### 3. Fluxo de teste rápido

1. Acesse `http://localhost:5173`, faça login com a conta admin (a que o
   `npm run seed` criou/confirmou) e vá em `/admin`. Crie uma atividade (ex:
   "Palestra de Abertura") e deixe o QR Code dela projetado na tela — é esse
   QR que fica no telão do evento.
2. Em outro navegador/aba (ou celular na mesma rede), acesse `/` e crie uma
   conta pela aba "Criar conta".
3. Vá em `/perfil` para ver seu QR Code pessoal.
4. Vá em `/scanner` e escaneie o QR da atividade projetada → ganha XP de
   presença.
5. Crie uma segunda conta e escaneie o QR de perfil de outro participante
   em `/scanner` → ambos ganham XP de networking (com bônus se forem de
   curso/período diferentes).
6. Acompanhe `/ranking` atualizando em tempo real (polling automático).

> Observação: em produção o scanner acessa a câmera do dispositivo, então
> precisa rodar em HTTPS (ou `localhost`) para o navegador liberar a câmera.

## Como funciona a gamificação

- **Pilar 1 — Presença**: cada atividade tem uma pontuação por tipo
  (`keynote` 50 XP, `workshop`/`oficina` 30 XP, `mesa_redonda` 25 XP,
  `palestra` 20 XP — configurável na hora de criar a atividade). O sistema
  impede pontuar duas vezes na mesma atividade.
- **Pilar 2 — Networking**: conexão vale 15 XP base para os dois lados, com
  bônus de +10 XP se forem de cursos diferentes e +10 XP se forem de
  períodos diferentes (até 35 XP numa conexão "quebra-bolha"). Duas pessoas
  só pontuam uma vez por par de conexão.
- **Patentes**: Estagiário (0 XP) → Júnior (150) → Pleno (400) → Sênior
  (800) → Staff / Tech Lead (1400). Os limites ficam em
  `backend/src/rank.ts`.

## Arquitetura técnica

- **Frontend**: React 18 + Vite + TypeScript, React Router para as telas,
  `qrcode.react` para gerar QR Codes e `html5-qrcode` para ler QR Codes pela
  câmera. Tema visual 100% em CSS puro (`frontend/src/styles/global.css`).
- **Backend**: Node.js + TypeScript + Express, validação de entrada com
  `zod`, autenticação por login (e-mail/senha) com JWT em cookie httpOnly e
  senha com hash (`bcryptjs`) — ver `backend/src/auth.ts` e
  `backend/src/routes/auth.ts`.
- **Dados**: PostgreSQL (hospedado no [Neon](https://neon.tech)) via
  [Prisma](https://www.prisma.io/) (`backend/prisma/schema.prisma`,
  `backend/src/prisma.ts`). Presença e networking rodam em transações
  (`prisma.$transaction`) para não haver corrida entre dois scans
  simultâneos.

### Evoluindo para produção

Pontos que ainda valem a pena revisar antes do evento de verdade:
- Rate limiting em mais rotas além do login (hoje só `/api/auth/login` tem).
- Deploy: backend em qualquer serviço Node (Railway, Render, Fly.io...),
  frontend como site estático (Vercel, Netlify) apontando para a URL da
  API. O Neon já funciona hospedado, então o banco não precisa mudar.
- Trocar a senha da conta admin criada pelo seed (`ADMIN_EMAIL`/
  `ADMIN_PASSWORD` em `backend/.env`) antes de ir pra produção.
