import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validateBody, createSummarySchema } from '../middleware/validate.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/summaries
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const summaries = await prisma.researchSummary.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ summaries });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to retrieve summaries.' });
  }
});

// POST /api/summaries
router.post('/', authMiddleware, validateBody(createSummarySchema), async (req: AuthRequest, res) => {
  try {
    const {
      title,
      originalText,
      fileName,
      fileType,
      overview,
      keyConcepts,
      examHighYield,
      wordCount,
      estimatedStudyTimeMinutes,
      courseId,
      tags,
    } = req.body;

    let validCourseId: string | null = null;
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, userId: req.userId },
      });
      if (course) validCourseId = course.id;
    }

    const summary = await prisma.researchSummary.create({
      data: {
        userId: req.userId!,
        courseId: validCourseId,
        title,
        originalText,
        fileName: fileName || null,
        fileType: fileType || 'text',
        overview,
        keyConcepts: keyConcepts || [],
        examHighYield: examHighYield || [],
        wordCount: Number(wordCount) || 0,
        estimatedStudyTimeMinutes: Number(estimatedStudyTimeMinutes) || 15,
        tags: tags || [],
      },
    });

    return res.status(201).json({ summary });
  } catch (err: any) {
    console.error('Save summary error:', err);
    return res.status(500).json({ message: 'Failed to save summary.' });
  }
});

// DELETE /api/summaries/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.researchSummary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Summary not found or unauthorized.' });
    }

    await prisma.researchSummary.delete({ where: { id } });
    return res.json({ message: 'Summary deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete summary.' });
  }
});

export default router;
