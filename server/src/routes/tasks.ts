import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/tasks
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { courseId, title, type, durationMinutes, phaseId, subtopicId } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ message: 'courseId and title are required.' });
    }

    const task = await prisma.task.create({
      data: {
        courseId,
        title,
        type: type || 'lab',
        durationMinutes: Number(durationMinutes) || 30,
        status: 'current',
        progressPercent: 0,
        phaseId: phaseId || null,
        subtopicId: subtopicId || null,
      },
    });

    return res.status(201).json({ task });
  } catch (err: any) {
    console.error('Task creation error:', err);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, progressPercent, completedAt } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(progressPercent !== undefined && { progressPercent: Number(progressPercent) }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      },
    });

    return res.json({ task });
  } catch (err: any) {
    console.error('Task update error:', err);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Task deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
});

export default router;
