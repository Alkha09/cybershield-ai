# CyberShield AI - Backend Reference

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  Spring Boot    │────▶│  Python ML      │
│  (Vite + TW)    │     │  REST API       │     │  Service        │
│  Port: 5173     │     │  Port: 8080     │     │  Port: 8000     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  MySQL Database │
                        │  Port: 3306     │
                        └─────────────────┘
```

## Services

### 1. React Frontend (This directory)
- Vite + React + TypeScript + Tailwind CSS
- JWT authentication with protected routes
- Real-time ML detection simulation
- Dashboard with charts and analytics

### 2. Spring Boot Backend (See `backend/spring-boot/`)
- JWT authentication & authorization
- REST API endpoints for scanning
- MySQL integration with JPA/Hibernate
- Proxy to Python ML service

### 3. Python ML Service (See `backend/python-ml/`)
- FastAPI REST API
- Scikit-learn models (Random Forest, XGBoost, BERT)
- Trained on provided datasets
- Feature extraction pipelines

### 4. MySQL Database
- Users table
- Scan history table
- Model metadata table

## Quick Start

```bash
# Start all services with Docker
docker-compose up --build

# Or run individually:
# Frontend
npm install && npm run dev

# Backend (requires Java 17+ and Maven)
cd backend/spring-boot && mvn spring-boot:run

# ML Service (requires Python 3.9+)
cd backend/python-ml && pip install -r requirements.txt && uvicorn main:app --reload
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cybershield
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000

# ML Service
ML_SERVICE_URL=http://localhost:8000
```
