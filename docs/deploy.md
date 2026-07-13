# Deploy — Vercel + MongoDB Atlas

Deploy the full-stack app (Nuxt on Vercel, MongoDB on Atlas) at **interview.ainga.me**.

---

## Architecture

```
Browser
   │
   ▼
Vercel (Nuxt SSR + /api/* serverless functions)
   │
   ▼
MongoDB Atlas M0 (free tier)
```

- **Frontend + API:** Vercel Hobby (free)
- **Database:** MongoDB Atlas M0 (free, 512 MB)
- **DNS:** `interview.ainga.me` → Vercel

---

## 1. MongoDB Atlas setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create → Shared → M0 FREE** cluster (pick a region close to your Vercel region)
3. **Database Access → Add Database User**
   - Username + strong password
   - Built-in role: `readWriteAnyDatabase` (or scoped to `interview-prep`)
4. **Network Access → Add IP Address**
   - For development + Vercel: **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Vercel serverless functions use dynamic IPs; restrict further only if you use Vercel Static IPs (Pro)
5. **Database → Connect → Drivers** — copy the connection string:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/interview-prep?retryWrites=true&w=majority
```

Replace `<password>` with your URL-encoded password.

---

## 2. Migrate questions to Atlas

Run locally with your Atlas URI in `.env`:

```bash
cp .env.example .env
# Edit .env — set MONGODB_URI to your Atlas connection string

pnpm install
pnpm migrate:content:dry   # preview
pnpm migrate:content      # import Markdown → Atlas, remove content/
```

Verify in Atlas UI: **Browse Collections → interview-prep → questions**.

---

## 3. Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add MONGODB_URI
vercel env add APP_USER_ID
vercel env add NUXT_PUBLIC_APP_URL
vercel --prod
```

### Option B — GitHub integration (recommended)

1. Push the repo to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework: **Nuxt.js** (auto-detected)
4. Add **Environment Variables**:

| Variable | Value | Environments |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `APP_USER_ID` | `default` | Production, Preview, Development |
| `NUXT_PUBLIC_APP_URL` | `https://interview.ainga.me` | Production |
| `NUXT_PUBLIC_APP_URL` | `https://<preview-url>.vercel.app` | Preview |

5. Deploy

---

## 4. Custom domain — interview.ainga.me

1. Vercel project → **Settings → Domains → Add**
2. Enter `interview.ainga.me`
3. Vercel shows the required DNS record. At your DNS provider for **ainga.me**:

| Type | Name | Value |
|---|---|---|
| **CNAME** | `interview` | `cname.vercel-dns.com` |

4. Wait for DNS propagation (minutes to hours)
5. Vercel provisions HTTPS automatically

Update production env:

```
NUXT_PUBLIC_APP_URL=https://interview.ainga.me
```

Redeploy if you changed env vars after the first deploy.

---

## 5. Verify

```bash
curl https://interview.ainga.me/api/health
# {"status":"ok","database":"connected"}

curl https://interview.ainga.me/api/questions | head -c 200
```

Open the app, start a practice session, rate a question — progress should persist in Atlas (`user_states` collection).

---

## 6. Local development

Use the same Atlas cluster for local dev (simplest — no local MongoDB needed):

```bash
cp .env.example .env
# MONGODB_URI=mongodb+srv://...
pnpm dev
```

Or use a separate Atlas database/user for dev vs production.

---

## 7. Redeploys

Every push to `main` auto-deploys if GitHub integration is connected.

Manual:

```bash
vercel --prod
```

---

## 8. Backups (Atlas)

M0 free tier has **no automated backups**. Options:

- **Manual export:** Atlas → Cluster → … → Export Data
- **Upgrade to M2+** for continuous cloud backup
- **Script:** run `mongodump` locally against Atlas URI periodically

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `Database unavailable` | Check `MONGODB_URI` in Vercel env; verify Atlas IP allowlist includes `0.0.0.0/0` |
| `Authentication failed` | URL-encode special chars in password; verify user + database name |
| Empty question list | Run `pnpm migrate:content` against Atlas |
| 500 on cold start | Normal on free tier; retry — check Vercel function logs |
| Domain not working | Confirm CNAME points to `cname.vercel-dns.com`; check Vercel domain status |

---

## Environment reference

| Variable | Description |
|---|---|
| `MONGODB_URI` | Atlas connection string (`mongodb+srv://...`) |
| `APP_USER_ID` | Key for user progress document in `user_states` |
| `NUXT_PUBLIC_APP_URL` | Public canonical URL |

---

## Vercel free tier notes

- **Hobby plan** — personal/non-commercial use
- **Cold starts** — first request after idle may be slower
- **Function timeout** — 10 seconds (more than enough for this app)
- **Bandwidth** — 100 GB/month

For interview-prep, this is sufficient.
