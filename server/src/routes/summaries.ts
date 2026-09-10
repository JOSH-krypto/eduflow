import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

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
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
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

    if (!title || !originalText || !overview) {
      return res.status(400).json({ message: 'Title, original text, and overview are required.' });
    }

    const summary = await prisma.researchSummary.create({
      data: {
        userId: req.userId!,
        courseId: courseId || null,
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
    await prisma.researchSummary.delete({ where: { id } });
    return res.json({ message: 'Summary deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete summary.' });
  }
});

export default router;
