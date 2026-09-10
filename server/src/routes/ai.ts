import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Rate limiter for AI proxy: max 20 requests per 10 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { message: 'Too many AI summary requests. Please slow down and try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/ai/summarize
router.post('/summarize', aiLimiter, optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { materialText, title, courseTitle, customPromptFocus } = req.body;

    if (!materialText || typeof materialText !== 'string' || !materialText.trim()) {
      return res.status(400).json({ message: 'materialText string is required for summarization.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const wordCount = materialText.split(/\s+/).filter(Boolean).length;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured on backend. Returning structured fallback breakdown.');
      // Return structured response if no key configured
      return res.json({
        summary: {
          id: `ai-sum-${Date.now()}`,
          title: title || `${courseTitle || 'Study'} High-Yield Summary`,
          originalText: materialText,
          overview: `Synthesized overview of ${wordCount} words covering high-yield concepts and exam scenarios. (Note: To enable live Gemini AI generation, set GEMINI_API_KEY in server/.env).`,
          keyConcepts: [
            {
              concept: 'Core Architecture Pattern',
              definition: 'Foundational framework emphasizing fault tolerance, resilience, and least-privilege security.',
            },
            {
              concept: 'Elastic Scaling & Health Checks',
              definition: 'Dynamic resource adjustments in response to metric thresholds with automated instance lifecycle management.',
            },
            {
              concept: 'Data Isolation & Encryption',
              definition: 'Enforcing client/server-side encryption policies and strict network segmentation.',
            },
          ],
          examHighYield: [
            'Target high-availability scenarios requiring multi-region or multi-AZ automated failover.',
            'Watch for questions testing transitive routing limits and bandwidth throughput.',
            'Review permission boundary hierarchies and explicit deny precedence.',
          ],
          wordCount,
          estimatedStudyTimeMinutes: Math.max(10, Math.round(wordCount / 100) * 5),
          createdAt: new Date().toISOString(),
          tags: ['StudyNotes', 'HighYield', courseTitle?.split(' ')[0] || 'Exam'],
        },
      });
    }

    // Initialize Gemini AI Client strictly on the backend
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
You are an expert exam preparation tutor and technical summarizer.
Analyze the following study material or notes and generate a high-yield study breakdown in pure JSON format (without markdown code fences).

Target Output JSON Schema:
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
Focus Area: ${customPromptFocus || 'High-Yield Exam Concepts'}
Course: ${courseTitle || 'Technical Certification'}
Document Title: ${title || 'Study Material'}

Study Content:
${materialText.slice(0, 15000)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean possible stray backticks
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const summary = {
      id: `ai-sum-${Date.now()}`,
      title: parsed.title || title || 'Study Summary',
      originalText: materialText,
      overview: parsed.overview || 'Overview of key concepts.',
      keyConcepts: parsed.keyConcepts || [],
      examHighYield: parsed.examHighYield || [],
      wordCount,
      estimatedStudyTimeMinutes: parsed.estimatedStudyTimeMinutes || Math.max(10, Math.round(wordCount / 100) * 5),
      createdAt: new Date().toISOString(),
      tags: parsed.tags || ['AI-Generated', 'StudyNotes'],
    };

    return res.json({ summary });
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({
      message: 'Failed to process AI summary with Gemini.',
      error: err.message,
    });
  }
});

export default router;
