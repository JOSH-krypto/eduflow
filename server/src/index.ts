import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import coursesRoutes from './routes/courses.js';
import tasksRoutes from './routes/tasks.js';
import sessionsRoutes from './routes/sessions.js';
import summariesRoutes from './routes/summaries.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration for cross-origin httpOnly cookie auth
const rawAllowed = process.env.ALLOWED_ORIGINS || CLIENT_URL;
const allowedOrigins = rawAllowed
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Always allow standard dev origins in non-production
const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      if (
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && defaultDevOrigins.includes(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by EduFlow CORS security policy.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Static uploads directory for local file preview
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'EduFlow Backend',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/summaries', summariesRoutes);
app.use('/api/ai', aiRoutes);

// Fallback 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 EduFlow Backend running at http://localhost:${PORT}`);
  console.log(`🩺 Health check at http://localhost:${PORT}/healthz`);
  console.log(`🔒 Gemini AI Proxy active on /api/ai/summarize`);
});
