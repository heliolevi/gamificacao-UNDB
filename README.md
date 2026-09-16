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

Pré-requisitos: Node.js 18+ instalado.

### 1. Backend (API)

```bash
cd backend
npm install
npm run seed   # cria algumas atividades de exemplo (palestras, workshop...)
npm run dev    # inicia a API em http://localhost:3333
```

> Sempre rode `npm run seed` **antes** de iniciar o servidor (ou reinicie o
> `npm run dev` depois de rodar o seed), pois o servidor mantém os dados em
> memória durante a execução.

A API guarda os dados em `backend/data/db.json` (criado automaticamente).
Isso é só para o protótipo funcionar sem precisar de banco externo — veja a
seção "Evoluindo para produção" abaixo para trocar por Postgres/MongoDB.

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

1. Acesse `/admin`, crie uma atividade (ex: "Palestra de Abertura") e deixe
   o QR Code dela projetado na tela — é esse QR que fica no telão do evento.
2. Em outro navegador/aba (ou celular na mesma rede), acesse `/cadastro` e
   crie um perfil.
3. Vá em `/perfil` para ver seu QR Code pessoal.
4. Vá em `/scanner` e escaneie o QR da atividade projetada → ganha XP de
   presença.
5. Crie um segundo perfil e escaneie o QR de perfil de outro participante
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
  `zod`, IDs únicos com `uuid`.
- **Dados**: camada de repositório simples em `backend/src/db.ts` que lê e
  grava um arquivo JSON. Todas as rotas passam por essa camada, então trocar
  o storage por um banco de verdade não exige mexer nas rotas.

### Evoluindo para produção

Para um evento real, vale trocar o `db.ts` baseado em arquivo por um banco
de verdade:

- **PostgreSQL** com [Prisma](https://www.prisma.io/) — bom encaixe pelo
  modelo relacional (usuários, atividades, presenças, conexões).
- **MongoDB** com Mongoose — se preferir documentos.

Como toda leitura/escrita passa pelas funções `readDb`/`mutate` de
`db.ts`, a troca fica isolada nesse arquivo (e nas rotas que hoje usam
`readDb()` diretamente).

Outros pontos para produção:
- Autenticação leve (ex: o próprio QR Code como "sessão" já dá para o MVP,
  mas para produção vale um login simples ou vincular ao e-mail/matrícula).
- Rate limiting nas rotas de scan.
- Deploy: backend em qualquer serviço Node (Railway, Render, Fly.io...),
  frontend como site estático (Vercel, Netlify) apontando para a URL da
  API.
