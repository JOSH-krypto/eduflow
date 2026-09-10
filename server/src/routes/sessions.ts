import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/sessions
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return res.json({ sessions });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to retrieve study sessions.' });
  }
});

// POST /api/sessions
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { courseId, taskTitle, taskType, durationMinutes, notes } = req.body;

    if (!taskTitle || !durationMinutes) {
      return res.status(400).json({ message: 'taskTitle and durationMinutes are required.' });
    }

    const session = await prisma.studySession.create({
      data: {
        userId: req.userId!,
        courseId: courseId || null,
        taskTitle,
        taskType: taskType || 'study',
        durationMinutes: Number(durationMinutes),
        notes: notes || null,
      },
    });

    // Increment user total hours
    const hours = Number(durationMinutes) / 60;
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalHoursStudied: { increment: Math.round(hours * 10) / 10 },
      },
    });

    if (courseId) {
      await prisma.course.update({
        where: { id: courseId },
        data: {
          studiedHoursThisWeek: { increment: Math.round(hours * 10) / 10 },
          completedSessionsToday: { increment: 1 },
        },
      });
    }

    return res.status(201).json({ session });
  } catch (err: any) {
    console.error('Session logging error:', err);
    return res.status(500).json({ message: 'Failed to record study session.' });
  }
});

export default router;
