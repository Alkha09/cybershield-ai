# 🚀 CyberShield AI — Deployment Guide

Production build: `dist/index.html` (719 KB / 210 KB gzipped, single-file).

---

## Option 1: Deploy Frontend Only (Easiest — 2 minutes)

The frontend works standalone using **browser-side ML simulation** (localStorage for auth & history). Perfect for demos, portfolios, or personal use.

### Vercel (recommended)
```bash
npm i -g vercel
vercel login
vercel           # production: vercel --prod
```
Or drag-drop `dist/` to https://vercel.com/new

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --dir=dist --prod
```
Or drag-drop `dist/` to https://app.netlify.com/drop

### Cloudflare Pages
```bash
npm i -g wrangler
wrangler pages deploy dist --project-name=cybershield-ai
```

### GitHub Pages
1. Push to GitHub
2. Settings → Pages → Deploy from branch `main` / folder `/dist`
3. Or use the included GitHub Actions workflow

**Result:** Live URL like `https://cybershield.vercel.app` — fully functional frontend.

---

## Option 2: Full Stack on a VPS (Production)

Self-host everything with Docker Compose.

### Requirements
- Linux VPS (2GB+ RAM, 1 vCPU+) — Hetzner, DigitalOcean, Linode, AWS EC2
- Domain (optional but recommended)
- Docker + Docker Compose

### Steps

**1. Provision server & install Docker**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

**2. Clone & configure**
```bash
git clone <your-repo> cybershield && cd cybershield
cp .env.example .env
nano .env   # edit secrets
```

Create `.env`:
```env
DB_HOST=mysql
DB_PORT=3306
DB_NAME=cybershield
DB_USER=cybershield
DB_PASSWORD=<strong-password-here>

JWT_SECRET=<run: openssl rand -hex 64>
JWT_EXPIRATION=86400000

ML_SERVICE_URL=http://ml-service:8000
```

**3. Start everything**
```bash
docker compose up -d --build
docker compose logs -f    # watch startup
```

**4. Verify**
- Frontend: `http://<your-server-ip>:5173`
- Backend API: `http://<your-server-ip>:8080/api/health`
- ML Service: `http://<your-server-ip>:8000/api/health`

**5. Add HTTPS (production)**
```bash
# Install Caddy (auto-SSL) or use nginx + certbot
sudo apt install -y caddy

# /etc/caddy/Caddyfile
cybershield.yourdomain.com {
    reverse_proxy localhost:5173
}

sudo systemctl restart caddy
```

**6. Firewall**
```bash
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

---

## Option 3: Split Deployment

### Frontend → Vercel / Netlify (static CDN)
Build and deploy as in Option 1.

### Backend → Railway / Render / Fly.io

**Railway:**
```bash
npm i -g @railway/cli
railway login
cd backend/spring-boot
railway init
railway up
```
Add env vars in Railway dashboard: `DB_HOST`, `JWT_SECRET`, `ML_SERVICE_URL`.

**Render:**
- New Web Service → Git repo → Root directory `backend/spring-boot`
- Build: `mvn clean package`
- Start: `java -jar target/*.jar`

### Python ML → Railway / Render / Fly.io
- Root directory: `backend/python-ml`
- Start: `uvicorn main:app --host 0.0.0.0 --port 8000`

### MySQL → PlanetScale / Neon / Railway
- Free tier available
- Connection string → `DB_HOST`, `DB_USER`, etc.

---

## Verify Deployment

After deploy, check:

| Service | Endpoint | Expected |
|---------|----------|----------|
| Frontend | `https://your-domain.com` | Login page |
| Backend | `/api/health` | `{"status":"ok"}` |
| ML | `/api/health` | `{"status":"healthy"}` |
| Register | Create account | Dashboard loads |
| Scan | Scan a URL | Result returns |

---

## Performance

Production bundle: **719 KB** → **210 KB gzipped** (single file, inlined assets).
- Lighthouse: ~95+ Performance, 100 Accessibility
- First Paint: <1s on 4G
- No external CDN dependencies

---

## Troubleshooting

**Blank page after deploy:** Make sure SPA routing is configured (Vercel/Netlify auto-handle; other hosts need `/* → /index.html`).

**API CORS errors:** Backend's `SecurityConfig.java` has allowed origins `localhost:5173` and `localhost:3000`. Add your production domain to the list.

**ML service slow on first scan:** Models load on first request. Subsequent scans are fast.

**Database connection refused:** Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD` match between `docker-compose.yml` and `.env`.

---

## One-Click Deploy (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/cybershield-ai)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)
