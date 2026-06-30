# CyberShield AI — Option B: Full Stack Deployment

Complete full-stack deployment with Spring Boot backend, MySQL database, Python ML service, and React frontend.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│ Spring Boot  │────▶│   MySQL     │     │   Python    │
│  (Frontend) │     │   (API)      │     │ (Database)  │     │    (ML)     │
│   :80       │     │    :8080     │     │   :3306     │     │   :8000     │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                            │
                            └──────────────────────────────────────────────┘
```

## Prerequisites

- Docker & Docker Compose
- 4GB+ RAM available for containers
- Linux/macOS/Windows with WSL2

## Quick Start (One Command)

```bash
# 1. Clone and enter directory
cd cybershield-ai

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with strong secrets
nano .env

# 4. Start everything
docker compose up -d --build

# 5. Wait for services to start (30-60 seconds)
docker compose logs -f backend

# 6. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080/api/health
# ML Service: http://localhost:8000/api/health
```

## Environment Variables

Edit `.env` before starting:

```env
# Database
DB_ROOT_PASSWORD=your-secure-root-password
DB_NAME=cybershield
DB_USER=cybershield
DB_PASSWORD=your-secure-db-password

# JWT (generate: openssl rand -hex 64)
JWT_SECRET=your-64-char-hex-secret-key-here
JWT_EXPIRATION=86400000
```

## Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | React app served by Nginx |
| Backend API | http://localhost:8080/api | Spring Boot REST API |
| ML Service | http://localhost:8000/api | Python FastAPI |
| MySQL | localhost:3306 | Database (internal only) |

## API Endpoints

### Authentication
```
POST /api/auth/register    { name, email, password }
POST /api/auth/login       { email, password }
GET  /api/auth/me          (requires Bearer token)
PUT  /api/auth/profile     { name, email } (requires Bearer token)
```

### Scanning
```
POST /api/scan/url         { content } (requires Bearer token)
POST /api/scan/email       { content } (requires Bearer token)
POST /api/scan/sms         { content } (requires Bearer token)
POST /api/scan/text        { content } (requires Bearer token)
GET  /api/scan/history     (requires Bearer token)
GET  /api/scan/stats       (requires Bearer token)
DELETE /api/scan/history   (requires Bearer token)
```

### Health
```
GET /api/health            (public)
```

## Production Deployment

### 1. Harden Security

```bash
# Generate strong JWT secret
openssl rand -hex 64

# Set strong database passwords
# Update .env with production values
```

### 2. Use HTTPS

Replace Nginx with a reverse proxy that handles SSL termination:

```nginx
# /etc/nginx/sites-available/cybershield
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
    }
}
```

### 3. Cloud Deployment

**AWS:**
```bash
# Use ECS or EKS with the provided Dockerfiles
# Or deploy to EC2:
docker compose up -d
```

**DigitalOcean / Linode / Hetzner:**
```bash
# Provision a 2GB+ VPS
# Install Docker
# Clone repo and run docker compose up -d
```

**Railway / Render / Fly.io:**
- Connect your GitHub repo
- Set environment variables in dashboard
- Deploy each service separately

## Monitoring

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f ml-service

# Restart a service
docker compose restart backend

# Full reset (WARNING: deletes all data)
docker compose down -v
docker compose up -d --build
```

## Database Migrations

Spring Boot automatically creates tables on first run. To manually inspect:

```bash
# Connect to MySQL
docker exec -it cybershield-mysql mysql -u cybershield -p

# Show tables
USE cybershield;
SHOW TABLES;

# View users
SELECT id, name, email, role, created_at FROM users;

# View scan history
SELECT * FROM scan_results ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

**Backend won't start:**
```bash
docker compose logs backend
# Check MySQL is healthy first
docker compose ps
```

**ML service not responding:**
```bash
curl http://localhost:8000/api/health
# Should return {"status":"healthy"}
```

**Frontend shows blank page:**
```bash
# Check Nginx is serving files
docker exec cybershield-frontend ls /usr/share/nginx/html
```

**Database connection refused:**
```bash
# Wait for MySQL to be ready
docker compose logs mysql | grep "ready for connections"
```

## Scaling

For high-traffic deployments:

1. **Horizontal scaling:** Run multiple backend instances behind a load balancer
2. **Database:** Use managed MySQL (AWS RDS, Google Cloud SQL)
3. **ML Service:** Scale to multiple instances with a load balancer
4. **Caching:** Add Redis for session storage and API response caching

## Backup & Restore

```bash
# Backup database
docker exec cybershield-mysql mysqldump -u root -p cybershield > backup.sql

# Restore database
docker exec -i cybershield-mysql mysql -u root -p cybershield < backup.sql
```

## Tech Stack Summary

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | React 19 + Vite + Tailwind | 80 |
| Backend | Spring Boot 3.2 + Java 17 | 8080 |
| Database | MySQL 8.0 | 3306 |
| ML Service | Python 3.11 + FastAPI | 8000 |
| Reverse Proxy | Nginx | 80 |
| Container Orchestration | Docker Compose | - |
