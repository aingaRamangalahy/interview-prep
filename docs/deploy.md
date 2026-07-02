# Deploy — Interview Prep on DigitalOcean

Deploy the full-stack app (Nuxt + MongoDB) to a small DigitalOcean droplet, served at a subdomain of **ainga.me**.

> **Prerequisites:** Complete [droplet-setup.md](./droplet-setup.md) first (server, DNS, Docker, Caddy).

---

## Architecture

```
Internet
   │
   ▼
Caddy (443) ──► interview.ainga.me
   │
   ▼
Docker: app container (:3000)
   │
   ▼
Docker: mongodb container (internal only)
```

MongoDB is **not** exposed publicly — only the `app` service talks to it on the Docker network.

---

## 1. Clone the repository on the droplet

```bash
cd /opt
sudo git clone https://github.com/YOUR_USER/interview-prep.git
sudo chown -R $USER:$USER interview-prep
cd interview-prep
```

---

## 2. Configure environment

```bash
cp .env.example .env
nano .env
```

Production `.env` example:

```env
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=<strong-random-password>
MONGODB_URI=mongodb://root:<strong-random-password>@mongodb:27017/interview-prep?authSource=admin
APP_USER_ID=default
NUXT_PUBLIC_APP_URL=https://interview.ainga.me
APP_PORT=3000
```

Generate a password:

```bash
openssl rand -base64 32
```

---

## 3. Migrate content (first deploy only)

> **Skip this step if you already ran `pnpm migrate:content` in development** and your MongoDB
> volume was exported and transferred to the droplet, or if you are redeploying an existing instance.

If this is a brand-new server and you have no existing MongoDB data, run the migration against
the production stack:

```bash
# Start the full stack first (MongoDB must be healthy before migration)
docker compose up -d --build

# Wait for MongoDB to be healthy
docker compose ps

# Install dependencies on the host (one-time, for the migration script)
pnpm install

# Run migration
MONGODB_URI="mongodb://root:<password>@127.0.0.1:27017/interview-prep?authSource=admin" \
  pnpm migrate:content

# Verify the count via mongosh inside the container
docker compose exec mongodb mongosh \
  --uri "mongodb://root:<password>@localhost:27017/interview-prep?authSource=admin" \
  --eval 'db.questions.countDocuments()'
```

> The migration script connects to MongoDB using `MONGODB_URI`. In production the container port is
> not published; use `docker-compose.dev.yml` only on your local machine. On the server, temporarily
> add `127.0.0.1:27017:27017` to the mongodb `ports` block, run the migration, then remove it again.

---

## 4. Build and start production stack

```bash
docker compose up -d --build
```

Verify:

```bash
docker compose ps
curl -s http://localhost:3000/api/health
# {"status":"ok","database":"connected"}
```

---

## 5. Caddy reverse proxy

Caddy should already be configured in [droplet-setup.md](./droplet-setup.md). Confirm `/etc/caddy/Caddyfile` contains the hardened config (see droplet-setup.md §7). Then reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Visit **https://interview.ainga.me**.

---

## 6. Updates (redeploy)

```bash
cd /opt/interview-prep
git pull
docker compose up -d --build --remove-orphans
```

- `--remove-orphans` removes containers for services no longer in the compose file.
- MongoDB data persists in the `mongo_data` Docker volume across all rebuilds.
- The `app` service depends on `mongodb:healthy`, so the app only starts after Mongo is ready.

---

## 7. Backups

### MongoDB dump

```bash
# Dump inside the container
docker compose exec mongodb mongodump \
  --uri "mongodb://root:<password>@localhost:27017/?authSource=admin" \
  --db interview-prep \
  --out /data/backup/$(date +%Y%m%d)

# Copy dump from container to host
docker compose cp mongodb:/data/backup ./backups
```

`mongodump` creates a subdirectory per database: `<out>/interview-prep/`.

### Restore

```bash
# Copy the dated folder back into the container
docker compose cp ./backups/20260701 mongodb:/data/restore

# mongorestore expects the database directory (not the date folder)
docker compose exec mongodb mongorestore \
  --uri "mongodb://root:<password>@localhost:27017/?authSource=admin" \
  --db interview-prep \
  /data/restore/20260701/interview-prep
```

---

## 8. Monitoring

| Check | Command |
|---|---|
| App logs | `docker compose logs -f app` |
| Mongo logs | `docker compose logs -f mongodb` |
| Health | `curl https://interview.ainga.me/api/health` |
| Disk | `df -h` |
| Memory | `free -h` |

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `Database unavailable` | Check `MONGODB_URI` matches compose credentials; `docker compose logs mongodb` |
| 502 from Caddy | App not running — `docker compose ps`, restart app |
| SSL error | DNS not propagated; check `dig interview.ainga.me` |
| Empty question list | Run `pnpm migrate:content` or restore MongoDB backup |

---

## Environment reference

| Variable | Description |
|---|---|
| `MONGODB_URI` | Mongo connection string (app container) |
| `APP_USER_ID` | Key for user progress document |
| `NUXT_PUBLIC_APP_URL` | Public URL (canonical) |
| `MONGO_ROOT_USERNAME` | Mongo root user (compose) |
| `MONGO_ROOT_PASSWORD` | Mongo root password (compose) |
| `APP_PORT` | Host port mapped to app (default 3000) |
