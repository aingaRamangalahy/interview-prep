# Interview Prep

Daily interview practice app with spaced repetition. Full-stack Nuxt 4 app with MongoDB Atlas, deployed on Vercel.

## Stack

- **Frontend:** Nuxt 4, Vue 3, Nuxt UI
- **Backend:** Nitro server API routes (Vercel serverless)
- **Database:** MongoDB Atlas
- **Deploy:** Vercel (Hobby free tier)

## Local development

### 1. Configure environment

```bash
cp .env.example .env
```

Set `MONGODB_URI` to your [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

### 2. Install and migrate content

```bash
pnpm install
pnpm migrate:content:dry   # preview
pnpm migrate:content     # import Markdown → Atlas, remove content/
```

### 3. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm migrate:content` | Migrate Markdown questions to MongoDB Atlas |
| `pnpm migrate:content:dry` | Preview migration without changes |

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/questions` | GET | List all questions |
| `/api/questions/:id` | GET | Single question |
| `/api/state` | GET | User progress |
| `/api/state` | PUT | Save user progress |

## Deploy

See [docs/deploy.md](./docs/deploy.md) — Vercel + MongoDB Atlas + `interview.ainga.me`.

## Data

- **Questions** — MongoDB Atlas `questions` collection
- **Progress** — MongoDB Atlas `user_states` collection (keyed by `APP_USER_ID`)

See [spec.md](./spec.md) for product details.
