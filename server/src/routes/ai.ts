import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../db.js';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Multer memory storage configuration (Max 10 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.txt', '.md'];
    if (
      allowed.includes(ext) ||
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('text/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF (.pdf), Markdown (.md), and Text (.txt) files up to 10MB are supported.'));
    }
  },
});

// Rate limiter for AI proxy: max 25 requests per 10 minutes per IP/User
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  message: { message: 'Too many AI summary requests. Please slow down and try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Validates magic bytes for PDF and detects potential encryption
 */
function validateFileBuffer(buffer: Buffer, originalname: string): { valid: boolean; message?: string } {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === '.pdf') {
    if (buffer.length < 5 || !buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
      return {
        valid: false,
        message: 'Corrupt or invalid PDF file. Document missing valid %PDF- header magic bytes.',
      };
    }

    // Inspect first 64KB and last 8KB for /Encrypt token
    const startStr = buffer.subarray(0, Math.min(buffer.length, 65536)).toString('latin1');
    const endStr = buffer.subarray(Math.max(0, buffer.length - 8192)).toString('latin1');
    if (startStr.includes('/Encrypt') || endStr.includes('/Encrypt')) {
      return {
        valid: false,
        message: 'This PDF is password-protected or encrypted. Please upload an unlocked PDF.',
      };
    }
  }
  return { valid: true };
}

// POST /api/ai/summarize
router.post(
  '/summarize',
  aiLimiter,
  upload.single('file'),
  optionalAuthMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const file = req.file;
      const body = req.body || {};
      const materialText = body.materialText;
      const title = body.title || (file ? path.parse(file.originalname).name : 'Study Notes');
      const courseId = body.courseId;
      const courseTitle = body.courseTitle;
      const customPromptFocus = body.customPromptFocus || 'High-Yield Exam Concepts';

      // 1. Validation: Ensure either file or materialText was provided
      if (!file && (!materialText || typeof materialText !== 'string' || !materialText.trim())) {
        return res.status(400).json({
          message: 'Please provide a document (.pdf, .txt, .md up to 10MB) or enter text to summarize.',
        });
      }

      // 2. Validate file buffer & magic bytes
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            message: 'File exceeds 10MB size limit. Please upload a smaller document.',
          });
        }

        const bufferCheck = validateFileBuffer(file.buffer, file.originalname);
        if (!bufferCheck.valid) {
          return res.status(400).json({ message: bufferCheck.message });
        }
      }

      // Check text character limits
      if (!file && materialText && materialText.length > 100000) {
        return res.status(400).json({
          message: 'Text exceeds the maximum allowed length of 100,000 characters. Please shorten or upload in sections.',
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('[AI] GEMINI_API_KEY not configured on server.');
        return res.status(500).json({
          message: 'AI summarization service is currently unconfigured. Please contact support.',
        });
      }

      const systemPrompt = `
You are an expert exam preparation tutor and technical summarizer.
Analyze the provided study document (which may include text, equations, code, diagrams, or scanned study materials) and output a high-yield study breakdown strictly in valid JSON format with NO markdown fences or preamble.

Required JSON Schema:
{
  "title": "A concise, descriptive title for this study unit",
  "overview": "2-3 clear sentences summarizing the core concepts and importance for exams",
  "keyConcepts": [
    { "concept": "Concept Name / Formula / Law", "definition": "Clear, concise technical definition or explanation" }
  ],
  "examHighYield": [
    "High-yield exam tip, common trap, or likely test scenario"
  ],
  "estimatedStudyTimeMinutes": 15,
  "tags": ["Tag1", "Tag2"]
}
`;

      const userPrompt = `
Focus Area: ${customPromptFocus}
Course: ${courseTitle || 'Technical Examination'}
Document Title: ${title}
Please extract key definitions, formulas, pitfalls, and high-yield exam takeaways.
`;

      const ai = new GoogleGenAI({ apiKey });
      const contentsParts: any[] = [];

      let fileType = 'text';
      let originalTextSample = '';
      let calculatedWordCount = 0;

      if (file) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.pdf') {
          fileType = 'pdf';
          const base64Pdf = file.buffer.toString('base64');
          contentsParts.push({
            inlineData: {
              data: base64Pdf,
              mimeType: 'application/pdf',
            },
          });
          contentsParts.push({
            text: `${systemPrompt}\n\n${userPrompt}`,
          });
          originalTextSample = `[PDF Document: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)]`;
          calculatedWordCount = Math.round(file.size / 7);
        } else {
          // .txt or .md
          fileType = ext === '.md' ? 'markdown' : 'text';
          const textContent = file.buffer.toString('utf-8');
          originalTextSample = textContent.slice(0, 1000);
          calculatedWordCount = textContent.split(/\s+/).filter(Boolean).length;
          contentsParts.push({
            text: `${systemPrompt}\n\n${userPrompt}\n\nStudy Material:\n${textContent.slice(0, 50000)}`,
          });
        }
      } else {
        // Plain text
        originalTextSample = materialText.slice(0, 1000);
        calculatedWordCount = materialText.split(/\s+/).filter(Boolean).length;
        contentsParts.push({
          text: `${systemPrompt}\n\n${userPrompt}\n\nStudy Material:\n${materialText.slice(0, 50000)}`,
        });
      }

      console.info(`[AI] Processing summarization for "${title}" (${fileType})...`);

      let responseText = '{}';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [{ role: 'user', parts: contentsParts }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        responseText = response.text || '{}';
      } catch (genErr: any) {
        console.error('[AI] Gemini generation error:', genErr.message || genErr);
        if (genErr.message?.includes('password') || genErr.message?.includes('encrypted')) {
          return res.status(400).json({
            message: 'Unable to read PDF because it is encrypted or password-protected. Please upload an unlocked PDF.',
          });
        }
        return res.status(500).json({
          message: 'AI model failed to process document. Please ensure the document is legible and try again.',
        });
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = {};
        }
      }

      const summaryData = {
        title: parsed.title || title || 'Study Summary',
        originalText: originalTextSample,
        fileName: file ? file.originalname : null,
        fileType,
        overview: parsed.overview || `Executive study breakdown summarizing high-yield concepts for exam readiness.`,
        keyConcepts: Array.isArray(parsed.keyConcepts) && parsed.keyConcepts.length > 0
          ? parsed.keyConcepts
          : [{ concept: 'Core Concept', definition: 'Review fundamental principles and definitions for this topic.' }],
        examHighYield: Array.isArray(parsed.examHighYield) && parsed.examHighYield.length > 0
          ? parsed.examHighYield
          : ['Review foundational definitions and terminology.', 'Focus on trade-offs and edge-case scenarios.'],
        wordCount: calculatedWordCount,
        estimatedStudyTimeMinutes: Number(parsed.estimatedStudyTimeMinutes) || Math.max(10, Math.round(calculatedWordCount / 100) * 5),
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['AI-Generated', 'StudyNotes'],
      };

      // 3. Persist to database if user is authenticated
      let savedSummary: any = null;
      if (req.userId) {
        try {
          let validCourseId: string | null = null;
          if (courseId) {
            const course = await prisma.course.findFirst({
              where: { id: courseId, userId: req.userId },
            });
            if (course) validCourseId = course.id;
          }

          savedSummary = await prisma.researchSummary.create({
            data: {
              userId: req.userId,
              courseId: validCourseId,
              title: summaryData.title,
              originalText: summaryData.originalText,
              fileName: summaryData.fileName,
              fileType: summaryData.fileType,
              overview: summaryData.overview,
              keyConcepts: summaryData.keyConcepts,
              examHighYield: summaryData.examHighYield,
              wordCount: summaryData.wordCount,
              estimatedStudyTimeMinutes: summaryData.estimatedStudyTimeMinutes,
              tags: summaryData.tags,
            },
          });
          console.info(`[AI] Summary saved to database id=${savedSummary.id} for userId=${req.userId}`);
        } catch (dbErr) {
          console.error('[AI] Failed to save summary to database:', dbErr);
        }
      }

      const finalSummary = savedSummary || {
        id: `ai-sum-${Date.now()}`,
        ...summaryData,
        createdAt: new Date().toISOString(),
      };

      return res.json({
        summary: finalSummary,
        aiDisclosure: 'Summarization powered by Google Gemini AI. Uploaded content is processed securely according to AI data guidelines.',
      });
    } catch (err: any) {
      console.error('[AI] Summarize route uncaught error:', err);
      return res.status(500).json({
        message: err.message || 'An unexpected error occurred while analyzing the document.',
      });
    }
  }
);

export default router;
