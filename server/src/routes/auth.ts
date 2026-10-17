import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validateBody, registerSchema, loginSchema } from '../middleware/validate.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secret-key-change-in-production-2026';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('eduflow_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      console.warn(`[AUTH] Registration conflict: email "${normalizedEmail}" already exists`);
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        planTier: 'Student',
        weeklyTargetHours: 15,
        preferences: {
          preferredStudyDays: [1, 2, 3, 4, 5],
          preferredStudyTime: 'morning',
          streakReminders: true,
          examCountdownAlerts: true,
          newResourceAlerts: true,
          accentColor: '#7C3AED',
          themeMode: 'system',
        },
      },
    });

    console.info(`[AUTH] User registered successfully: id=${user.id} email="${normalizedEmail}"`);
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        planTier: user.planTier,
        totalHoursStudied: user.totalHoursStudied,
        totalCertifications: user.totalCertifications,
        weeklyTargetHours: user.weeklyTargetHours,
        preferences: user.preferences,
      },
    });
  } catch (err: any) {
    console.error('[AUTH] Registration error:', err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      console.warn(`[AUTH] Login failed: User not found for email "${normalizedEmail}"`);
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.warn(`[AUTH] Login failed: Password mismatch for user id=${user.id} email="${normalizedEmail}"`);
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    console.info(`[AUTH] User signed in successfully: id=${user.id} email="${normalizedEmail}"`);
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        planTier: user.planTier,
        totalHoursStudied: user.totalHoursStudied,
        totalCertifications: user.totalCertifications,
        weeklyTargetHours: user.weeklyTargetHours,
        preferences: user.preferences,
      },
    });
  } catch (err: any) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('eduflow_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        planTier: user.planTier,
        totalHoursStudied: user.totalHoursStudied,
        totalCertifications: user.totalCertifications,
        weeklyTargetHours: user.weeklyTargetHours,
        preferences: user.preferences,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch user session.' });
  }
});

export default router;
