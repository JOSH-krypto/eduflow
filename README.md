# EduFlow

EduFlow is an exam preparation and study management application. It provides course tracking, study session scheduling, focus timers, academic article feeds, and document summaries.

## Architecture

- Frontend: React 18 with TypeScript, Vite, and Tailwind CSS.
- Backend: Node.js, Express, and Prisma ORM.
- Database: PostgreSQL (Neon or local).
- AI proxy: Optional Google Gemini integration via server-side proxy.

## Local development

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL database instance

### Frontend setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs at `http://localhost:3000` or `http://localhost:5173`.

### Backend setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the database client and apply migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The API server runs at `http://localhost:4000`.

## Environment variables

### Frontend (`.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:4000` |

### Backend (`server/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `PORT` | HTTP port for the Express server | `4000` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |
| `JWT_SECRET` | Secret key used to sign session tokens | `your-secret-key` |
| `GEMINI_API_KEY` | Optional API key for document summaries | `AIzaSy...` |
| `PUBLIC_UPLOADS_URL`| Base URL for served file uploads | `http://localhost:4000/uploads` |

## Deployment

### Frontend (Vercel)

1. Connect repository to Vercel.
2. Set Framework Preset to **Vite**.
3. Set Root Directory to `./`.
4. Configure Build Command: `npm run build`.
5. Configure Output Directory: `dist`.
6. Set environment variable: `VITE_API_URL` pointing to the deployed backend URL.

### Backend (Render or similar PaaS)

1. Create a Web Service connected to the repository.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install && npm run build`.
4. Set Start Command: `npm start`.
5. Provide required environment variables listed in the backend table above.
