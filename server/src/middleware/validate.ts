import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid request data',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ message: 'Malformed request payload' });
    }
  };
};

// Zod validation schemas
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(150),
  code: z.string().max(30).optional(),
  category: z.string().max(50).optional(),
  examDate: z.string().min(1, 'Exam date is required'),
  targetHoursPerWeek: z.number().min(1).max(100).optional(),
  phases: z.array(z.any()).optional(),
  agenda: z.array(z.any()).optional(),
});

export const createTaskSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Task title is required').max(200),
  type: z.enum(['video', 'lab', 'reading', 'quiz', 'practice', 'study']).optional(),
  durationMinutes: z.number().min(1).max(720).optional(),
  phaseId: z.string().nullable().optional(),
  subtopicId: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  status: z.enum(['current', 'completed', 'upcoming', 'pending']).optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  completedAt: z.string().nullable().optional(),
});

export const createSessionSchema = z.object({
  courseId: z.string().nullable().optional(),
  taskTitle: z.string().min(1, 'Task title is required').max(200),
  taskType: z.string().max(50).optional(),
  durationMinutes: z.number().min(1).max(720),
  notes: z.string().max(5000).nullable().optional(),
});

export const createSummarySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  originalText: z.string().min(1, 'Original text is required').max(100000),
  fileName: z.string().max(255).nullable().optional(),
  fileType: z.string().max(50).nullable().optional(),
  overview: z.string().min(1, 'Overview is required').max(5000),
  keyConcepts: z.array(z.any()).optional(),
  examHighYield: z.array(z.string()).optional(),
  wordCount: z.number().optional(),
  estimatedStudyTimeMinutes: z.number().optional(),
  courseId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  weeklyTargetHours: z.number().min(1).max(100).optional(),
  preferences: z.record(z.any()).optional(),
  avatar: z.string().max(1000).optional(),
});
