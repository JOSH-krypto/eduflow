# EduFlow Deployment Guide

EduFlow is built with a **mobile-first React + TypeScript frontend** deployed on **Vercel** and a high-performance **Node.js + Express + PostgreSQL (Prisma)** backend deployed on **Render** with server-side rate-limited Gemini AI proxying and secure cross-origin JWT httpOnly cookie auth.

---

## 1. Production Deployment Status & Endpoints

- **Live Backend (Render)**: `https://eduflow-el1u.onrender.com`
  - Health Check: `https://eduflow-el1u.onrender.com/healthz`
  - AI Proxy: `https://eduflow-el1u.onrender.com/api/ai/summarize`
- **Live Frontend (Vercel)**: `https://eduflow-one-dun.vercel.app`
- **Database**: Neon Managed PostgreSQL Serverless with connection pooling & SSL
- **Object Storage**: Cloudflare R2 / AWS S3 for profile avatars and file attachments
- **AI Engine**: Google Gemini AI (kept strictly server-side on Render)

---

## 2. Vercel Frontend Configuration

1. **Framework Preset**: Vite
2. **Root Directory**: `./` (repository root)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://eduflow-el1u.onrender.com`

---

## 3. Render Backend Configuration

1. **Service Type**: Web Service (Node.js)
2. **Root Directory**: `server`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start` (or `node dist/index.js`)
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or dynamic port assigned by Render)
   - `CLIENT_URL`: `https://eduflow-one-dun.vercel.app`
   - `ALLOWED_ORIGINS`: `https://eduflow-one-dun.vercel.app`
   - `DATABASE_URL`: `postgresql://...neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: `<secure-random-secret>`
   - `GEMINI_API_KEY`: `<google-ai-studio-api-key>`
   - `S3_BUCKET_NAME`: `eduflow`
   - `AWS_REGION`: `auto`
   - `AWS_ACCESS_KEY_ID`: `<r2-access-key>`
   - `AWS_SECRET_ACCESS_KEY`: `<r2-secret-key>`
   - `PUBLIC_UPLOADS_URL`: `https://eduflow-el1u.onrender.com/uploads`

---

## 4. Local Development Setup (Examples)

### A. Frontend Setup
```bash
# In the repository root
npm install
npm run dev
```
*Local dev example URL:* `http://localhost:5173` or `http://localhost:3000`

### B. Backend Setup
```bash
# In the server folder
cd server
npm install

# Generate Prisma Client & Run Migrations
npm run prisma:generate
npm run prisma:migrate

# Seed Demo Course & User (optional)
npm run prisma:seed

# Start the dev server
npm run dev
```
*Local dev example API URL:* `http://localhost:4000` with health check at `http://localhost:4000/healthz`.

---

## 5. Docker Fullstack Compose (Local Testing)

```bash
docker-compose up --build
```
