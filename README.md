# Interview Prep

Daily interview practice app with spaced repetition. Full-stack Nuxt 4 app with MongoDB.

## Stack

- **Frontend:** Nuxt 4, Vue 3, Nuxt UI
- **Backend:** Nitro server API routes
- **Database:** MongoDB
- **Deploy:** Docker on DigitalOcean

## Local development

### 1. Start MongoDB

```bash
cp .env.example .env
pnpm docker:dev
```

### 2. Install and migrate content

```bash
pnpm install
pnpm migrate:content    # imports Markdown → MongoDB, removes content/
```

### 3. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker (full stack)

```bash
cp .env.example .env
pnpm docker:up
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server (needs MongoDB) |
| `pnpm build` | Production build |
| `pnpm docker:dev` | Start MongoDB only |
| `pnpm docker:up` | Start app + MongoDB |
| `pnpm migrate:content` | Migrate Markdown questions to MongoDB |
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

- [Droplet setup](./docs/droplet-setup.md) — DigitalOcean + `interview.ainga.me`
- [Deploy guide](./docs/deploy.md) — production deployment steps

## Data

- **Questions** — stored in MongoDB `questions` collection
- **Progress** — stored in MongoDB `user_states` collection (keyed by `APP_USER_ID`)

See [spec.md](./spec.md) for product details.
