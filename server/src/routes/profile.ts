import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validateBody, updateProfileSchema } from '../middleware/validate.js';
import { storageService } from '../services/storage.js';

const router = Router();

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, WebP, and GIF images up to 4MB are supported.'));
    }
  },
});

// PATCH /api/profile
router.patch('/', authMiddleware, validateBody(updateProfileSchema), async (req: AuthRequest, res) => {
  try {
    const { name, weeklyTargetHours, preferences, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(weeklyTargetHours && { weeklyTargetHours: Number(weeklyTargetHours) }),
        ...(preferences && { preferences }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    return res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar || '',
        planTier: updated.planTier,
        totalHoursStudied: updated.totalHoursStudied,
        totalCertifications: updated.totalCertifications,
        weeklyTargetHours: updated.weeklyTargetHours,
        preferences: updated.preferences,
      },
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// POST /api/profile/avatar
router.post('/avatar', authMiddleware, (req, res, next) => {
  upload.single('avatar')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image file size exceeds the 4MB limit.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'File upload error.' });
    }
    next();
  });
}, async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const result = await storageService.uploadFile(req.file, 'avatars');

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: result.url },
    });

    return res.json({ avatarUrl: result.url });
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ message: 'Failed to upload avatar.' });
  }
});

export default router;
