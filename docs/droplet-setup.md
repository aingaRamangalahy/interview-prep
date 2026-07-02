# Droplet Setup — DigitalOcean + ainga.me

One-time setup for a small DigitalOcean droplet hosting **Interview Prep** at `interview.ainga.me`.

---

## 1. Create the droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. **Create → Droplets**
3. Recommended spec:
   - **Image:** Ubuntu 24.04 LTS
   - **Plan:** Basic — **2 GB RAM, 1 vCPU ($12/mo) is recommended**. MongoDB + Node.js + Docker can OOM on 1 GB even with swap during image builds. 1 GB works with the swap configured in §10 but is tight.
   - **Region:** Closest to you (e.g. NYC, AMS)
   - **Authentication:** SSH key (recommended — disable password auth after setup)
4. Hostname: `interview-prep` (optional)
5. Create droplet and note the **public IP address**

---

## 2. DNS — subdomain on ainga.me

Wherever **ainga.me** DNS is managed (DigitalOcean Networking, Cloudflare, Namecheap, etc.):

| Type | Name | Value | TTL |
|---|---|---|---|
| **A** | `interview` | `<DROPLET_IP>` | 300 (or Auto) |

This creates **interview.ainga.me** → your droplet.

Verify propagation:

```bash
dig interview.ainga.me +short
# Should return your droplet IP
```

> **Cloudflare users:** Set the record to **DNS only** (grey cloud) during initial Let's Encrypt setup if you use Caddy on the droplet directly. Orange-cloud proxy works too but requires Cloudflare SSL mode = Full.

---

## 3. Initial server access

```bash
ssh root@<DROPLET_IP>
```

### Create a deploy user (recommended)

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Log in as deploy:

```bash
ssh deploy@<DROPLET_IP>
```

---

## 4. System updates and firewall

```bash
sudo apt update && sudo apt upgrade -y

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 27017/tcp    # belt-and-suspenders: block Mongo even if compose config changes
sudo ufw enable
sudo ufw status
```

Ports **80** and **443** are for Caddy (HTTPS). MongoDB port 27017 is **not** published by the production compose, and this `ufw deny` rule adds an extra layer in case that ever changes.

### Harden SSH

Disable password authentication (use SSH keys only):

```bash
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload ssh
```

---

## 5. Install Docker

```bash
# Add Docker's official apt repository (avoids piping untrusted scripts as root)
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in, then verify:

```bash
docker --version
docker compose version   # must be v2 (compose is now a plugin, not standalone)
```

---

## 6. Install Node.js + pnpm (for migrations)

Only needed on the host for `pnpm migrate:content`. The app itself runs in Docker.

The recommended approach in 2026 is `fnm` (Fast Node Manager) — no sudo required, easy version switching:

```bash
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc          # or restart the shell

fnm install 22
fnm use 22
node --version            # v22.x.x

corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm --version
```

<details>
<summary>Alternative: NodeSource apt repository</summary>

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
corepack prepare pnpm@11.9.0 --activate
```
</details>

---

## 7. Install Caddy (reverse proxy + auto HTTPS)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace contents with:

```caddyfile
interview.ainga.me {
    # Gzip compression
    encode gzip

    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "geolocation=(), microphone=(), camera=()"
        # Remove the server fingerprint header
        -Server
    }

    reverse_proxy localhost:3000
}
```

Validate and start:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable caddy
sudo systemctl restart caddy
sudo systemctl status caddy
```

Caddy automatically obtains and renews a Let's Encrypt certificate once DNS points to this server and port 443 is reachable.

---

## 8. Optional — HTTP basic auth

For a private personal app, add basic auth in Caddy:

```bash
caddy hash-password
# Enter a password, copy the bcrypt hash shown
```

```caddyfile
interview.ainga.me {
    encode gzip

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }

    basicauth {
        ainga <paste-bcrypt-hash-here>
    }

    reverse_proxy localhost:3000
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

---

## 9. Deploy the app

Follow [deploy.md](./deploy.md) from step 1 onward:

```bash
cd /opt
git clone <your-repo-url> interview-prep
cd interview-prep
cp .env.example .env
# edit .env with production values
docker compose up -d --build
```

---

## 10. Swap (recommended for 1 GB RAM)

Prevents OOM during Docker builds:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 11. Automatic security updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 12. Checklist

- [ ] Droplet created with SSH key; password auth disabled
- [ ] `interview.ainga.me` A record → droplet IP
- [ ] UFW: 22, 80, 443 open; 27017 explicitly denied
- [ ] Docker (CE + Compose plugin v2) installed
- [ ] Node.js 22 + pnpm installed (for migrations)
- [ ] Caddy running; `sudo caddy validate` passes
- [ ] Valid HTTPS on `https://interview.ainga.me`
- [ ] `https://interview.ainga.me/api/health` returns `{"status":"ok","database":"connected"}`
- [ ] Swap enabled (especially on 1 GB droplets)
- [ ] Automatic security updates configured
- [ ] MongoDB backup cron scheduled (optional)

---

## Subdomain alternatives

If you prefer a different subdomain, replace `interview` everywhere:

| Subdomain | DNS name | Caddy host |
|---|---|---|
| `interview.ainga.me` | `interview` | `interview.ainga.me` |
| `prep.ainga.me` | `prep` | `prep.ainga.me` |
| `practice.ainga.me` | `practice` | `practice.ainga.me` |

Update `NUXT_PUBLIC_APP_URL` in `.env` to match.

---

## Useful commands

```bash
# SSH
ssh deploy@interview.ainga.me

# App status
cd /opt/interview-prep && docker compose ps

# Logs
docker compose logs -f app

# Restart app
docker compose restart app

# Caddy logs
sudo journalctl -u caddy -f
```
