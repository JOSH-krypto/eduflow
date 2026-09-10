import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/courses
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { userId: req.userId },
      include: {
        phases: { orderBy: { phaseNumber: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      category: c.category,
      examDate: c.examDate,
      targetHoursPerWeek: c.targetHoursPerWeek,
      studiedHoursThisWeek: c.studiedHoursThisWeek,
      streakDays: c.streakDays,
      completedSessionsToday: c.completedSessionsToday,
      phases: c.phases.map((p) => ({
        id: p.id,
        phaseNumber: p.phaseNumber,
        title: p.title,
        description: p.description,
        status: p.status,
        dateRange: p.dateRange,
        progressPercent: p.progressPercent,
        topicsCovered: p.topicsCovered,
        nextVideo: p.nextVideo,
        upcomingLab: p.upcomingLab,
        subtopics: p.subtopics,
      })),
      agenda: c.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        durationMinutes: t.durationMinutes,
        status: t.status,
        progressPercent: t.progressPercent,
        phaseId: t.phaseId,
        subtopicId: t.subtopicId,
        completedAt: t.completedAt?.toISOString(),
        date: t.date,
      })),
      weeklyActivity: c.weeklyActivity || [],
      topicMastery: c.topicMastery || [],
      resources: [],
    }));

    return res.json({ courses: formatted });
  } catch (err: any) {
    console.error('Fetch courses error:', err);
    return res.status(500).json({ message: 'Failed to retrieve courses.' });
  }
});

// POST /api/courses
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, code, category, examDate, targetHoursPerWeek, phases, agenda } = req.body;

    if (!title || !examDate) {
      return res.status(400).json({ message: 'Title and target exam date are required.' });
    }

    const course = await prisma.course.create({
      data: {
        userId: req.userId!,
        title,
        code: code || 'CERT',
        category: category || 'General',
        examDate,
        targetHoursPerWeek: Number(targetHoursPerWeek) || 15,
        studiedHoursThisWeek: 0,
        streakDays: 1,
        completedSessionsToday: 0,
        phases: {
          create: (phases || []).map((p: any, index: number) => ({
            phaseNumber: p.phaseNumber || index + 1,
            title: p.title || `Phase ${index + 1}`,
            description: p.description || '',
            status: p.status || (index === 0 ? 'in_progress' : 'locked'),
            dateRange: p.dateRange || 'TBD',
            progressPercent: p.progressPercent || 0,
            topicsCovered: p.topicsCovered || [],
            nextVideo: p.nextVideo || null,
            upcomingLab: p.upcomingLab || null,
            subtopics: p.subtopics || [],
          })),
        },
        tasks: {
          create: (agenda || []).map((t: any) => ({
            title: t.title,
            type: t.type || 'video',
            durationMinutes: t.durationMinutes || 30,
            status: t.status || 'current',
            progressPercent: t.progressPercent || 0,
          })),
        },
      },
      include: {
        phases: true,
        tasks: true,
      },
    });

    return res.status(201).json({ course });
  } catch (err: any) {
    console.error('Create course error:', err);
    return res.status(500).json({ message: 'Failed to create course track.' });
  }
});

export default router;
