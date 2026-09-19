import { Router } from 'express';
import { prisma } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validateBody, createSessionSchema } from '../middleware/validate.js';

const router = Router();

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
router.post('/', authMiddleware, validateBody(createSessionSchema), async (req: AuthRequest, res) => {
  try {
    const { courseId, taskTitle, taskType, durationMinutes, notes } = req.body;

    let validCourseId: string | null = null;
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, userId: req.userId },
      });
      if (course) {
        validCourseId = course.id;
      }
    }

    const session = await prisma.studySession.create({
      data: {
        userId: req.userId!,
        courseId: validCourseId,
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

    if (validCourseId) {
      await prisma.course.update({
        where: { id: validCourseId },
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
