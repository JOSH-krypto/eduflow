import { Router } from 'express';
import { prisma } from '../db.js';
import { refreshAllFeeds, getLastRefreshTime } from '../services/newsService.js';

const router = Router();

const VALID_CATEGORIES = [
  'Top stories',
  'Latest',
  'Science',
  'Technology',
  'Health & Medicine',
  'Humanities',
  'Arts',
  'Social Sciences',
  'Education',
];

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const categoryQuery = (req.query.category as string)?.trim() || 'Top stories';
    const searchQuery = (req.query.search as string)?.trim() || '';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    // Check if database is empty or stale (> 15 minutes) - lazy load for cold starts on Render
    const totalCount = await prisma.newsItem.count();
    const lastRefresh = getLastRefreshTime();
    const isStale = Date.now() - lastRefresh > 15 * 60 * 1000;

    if (totalCount === 0 || isStale) {
      // Lazy refresh asynchronously or await if 0 items
      if (totalCount === 0) {
        await refreshAllFeeds(true);
      } else {
        refreshAllFeeds(false).catch(() => {});
      }
    }

    // Build Prisma query filter
    const where: any = {};

    if (categoryQuery && categoryQuery !== 'Top stories' && categoryQuery !== 'Latest') {
      where.category = {
        equals: categoryQuery,
        mode: 'insensitive',
      };
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { excerpt: { contains: searchQuery, mode: 'insensitive' } },
        { source: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.newsItem.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsItem.count({ where }),
    ]);

    return res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      lastUpdated: new Date(getLastRefreshTime() || Date.now()).toISOString(),
      categories: VALID_CATEGORIES,
    });
  } catch (err: any) {
    console.error('[NEWS] Failed to query news items:', err);
    return res.status(500).json({ message: 'Failed to retrieve academic news.' });
  }
});

// POST /api/news/refresh
router.post('/refresh', async (_req, res) => {
  try {
    const updatedCount = await refreshAllFeeds(true);
    return res.json({
      message: 'Academic feeds refreshed successfully.',
      itemsSynced: updatedCount,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[NEWS] Manual refresh failed:', err);
    return res.status(500).json({ message: 'Failed to refresh feeds.' });
  }
});

export default router;
