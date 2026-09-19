import { Router } from 'express';
import { prisma } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validateBody, createTaskSchema, updateTaskSchema } from '../middleware/validate.js';

const router = Router();

// POST /api/tasks
router.post('/', authMiddleware, validateBody(createTaskSchema), async (req: AuthRequest, res) => {
  try {
    const { courseId, title, type, durationMinutes, phaseId, subtopicId } = req.body;

    // Verify course belongs to authenticated user
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId: req.userId },
    });

    if (!course) {
      return res.status(403).json({ message: 'Course not found or unauthorized.' });
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
router.patch('/:id', authMiddleware, validateBody(updateTaskSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, progressPercent, completedAt } = req.body;

    // Verify task exists and belongs to user's course
    const existing = await prisma.task.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!existing || existing.course.userId !== req.userId) {
      return res.status(403).json({ message: 'Task not found or unauthorized.' });
    }

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

    const existing = await prisma.task.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!existing || existing.course.userId !== req.userId) {
      return res.status(403).json({ message: 'Task not found or unauthorized.' });
    }

    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Task deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
});

export default router;
