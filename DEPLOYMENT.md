# EduFlow Deployment Guide

EduFlow is built with a **mobile-first React + TypeScript frontend** and a scalable **Node.js + Express + PostgreSQL (Prisma)** backend with server-side rate-limited Gemini AI proxying and JWT httpOnly cookie auth.

---

## 1. Architecture Overview

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Outfit Google Font.
- **Backend**: Express, TypeScript, Prisma ORM, PostgreSQL, bcryptjs, jsonwebtoken, cookie-parser, multer.
- **AI Security**: The Gemini API key is configured **exclusively on the backend** (`process.env.GEMINI_API_KEY`). The frontend never makes direct client-side calls to Google servers.
- **Storage**: Profile photos support AWS S3 / Cloudflare R2 object storage with local disk fallback in development.

---

## 2. Local Development Setup

### A. Frontend Setup
```bash
# In the root directory
npm install
npm run dev
```
The frontend dev server will launch at `http://localhost:3000` (or `http://localhost:5173`).

### B. Backend Setup
```bash
# Navigate to the server folder
cd server
npm install

# Copy environment template
cp .env.example .env
# Edit .env and supply your DATABASE_URL and optional GEMINI_API_KEY

# Generate Prisma Client & Run Migrations
npm run prisma:generate
npm run prisma:migrate

# Seed Demo Course & User
npm run prisma:seed

# Start the dev server
npm run dev
```
The backend API will run at `http://localhost:4000` with health check at `http://localhost:4000/healthz`.

---

## 3. Docker Compose (Fullstack)

To run the entire stack with PostgreSQL in a single command:

```bash
# In the root directory
docker-compose up --build
```

---

## 4. Production Cloud Deployment

### Option A: Render / Fly.io / Railway (Container or Monorepo)
1. Set the Root Directory to the repository root.
2. Build Command: `npm run build && cd server && npm install && npm run build`
3. Start Command: `node server/dist/index.js`
4. Environment Variables:
   - `DATABASE_URL`: Your managed PostgreSQL connection URI
   - `JWT_SECRET`: A secure random 64-character secret
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `CLIENT_URL`: `https://your-frontend-domain.com`

### Option B: Cloudflare R2 / AWS S3 for Profile Photos
In `server/.env`, specify:
```env
S3_BUCKET_NAME="eduflow-assets"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
```
