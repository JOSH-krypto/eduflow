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

    if (materialText.length > 50000) {
      return res.status(400).json({ message: 'Study material exceeds the maximum allowed length of 50,000 characters.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const words = materialText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (!apiKey) {
      // Heuristic extraction directly from user's text
      const sentences = materialText.match(/[^.!?]+[.!?]+/g) || [materialText];
      const lines = materialText.split('\n').map(l => l.trim()).filter(Boolean);
      
      const concepts: { concept: string; definition: string }[] = [];
      const highYield: string[] = [];

      for (const line of lines) {
        if (line.includes(':') && line.length > 15 && line.length < 250) {
          const parts = line.split(':');
          const concept = parts[0].replace(/^[-*•#\d.]+\s*/, '').trim();
          const definition = parts.slice(1).join(':').trim();
          if (concept.length < 35 && definition.length > 10 && concepts.length < 6) {
            concepts.push({ concept, definition });
          }
        }
      }

      if (concepts.length === 0) {
        sentences.slice(0, 3).forEach((s, idx) => {
          concepts.push({ concept: `Key Concept ${idx + 1}`, definition: s.trim() });
        });
      }

      sentences.slice(3, 6).forEach(s => highYield.push(s.trim()));
      if (highYield.length === 0) {
        highYield.push(`Review core definitions and test items for ${courseTitle || 'this topic'}.`);
      }

      return res.json({
        summary: {
          id: `ai-sum-${Date.now()}`,
          title: title || `${courseTitle || 'Study Notes'} High-Yield Summary`,
          originalText: materialText,
          overview: sentences.slice(0, 2).join(' ').trim() || `Summary extracted from ${wordCount} words of user notes.`,
          keyConcepts: concepts,
          examHighYield: highYield,
          wordCount,
          estimatedStudyTimeMinutes: Math.max(10, Math.round(wordCount / 100) * 5),
          createdAt: new Date().toISOString(),
          tags: ['StudyNotes', 'Extracted', courseTitle?.split(' ')[0] || 'Certification'],
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
${materialText.slice(0, 25000)}
`;

    let responseText = '{}';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
      responseText = response.text || '{}';
    } catch (modelErr: any) {
      console.warn('Primary Gemini model error, falling back to algorithmic extraction:', modelErr.message || modelErr);
      return res.json({
        summary: extractHeuristicSummary(materialText, title, courseTitle, wordCount),
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

    const summary = {
      id: `ai-sum-${Date.now()}`,
      title: parsed.title || title || 'Study Summary',
      originalText: materialText,
      overview: parsed.overview || `Executive summary covering key technical principles for ${courseTitle || 'exam preparation'}.`,
      keyConcepts: Array.isArray(parsed.keyConcepts) && parsed.keyConcepts.length > 0 ? parsed.keyConcepts : [
        { concept: 'Core Principle', definition: materialText.substring(0, 150) + '...' }
      ],
      examHighYield: Array.isArray(parsed.examHighYield) && parsed.examHighYield.length > 0 ? parsed.examHighYield : [
        'Review foundational definitions and terminology in this topic.',
        'Focus on trade-offs and edge-case scenarios.'
      ],
      wordCount,
      estimatedStudyTimeMinutes: Number(parsed.estimatedStudyTimeMinutes) || Math.max(10, Math.round(wordCount / 100) * 5),
      createdAt: new Date().toISOString(),
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['AI-Generated', 'StudyNotes'],
    };

    return res.json({ summary });
  } catch (err: any) {
    console.error('Gemini proxy critical error:', err);
    return res.status(500).json({
      message: 'Failed to process AI summary. Please verify the prompt and try again.',
    });
  }
});

function extractHeuristicSummary(materialText: string, title?: string, courseTitle?: string, wordCount?: number) {
  const sentences = materialText.match(/[^.!?]+[.!?]+/g) || [materialText];
  const lines = materialText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const concepts: { concept: string; definition: string }[] = [];
  const highYield: string[] = [];

  for (const line of lines) {
    if (line.includes(':') && line.length > 15 && line.length < 250) {
      const parts = line.split(':');
      const concept = parts[0].replace(/^[-*•#\d.]+\s*/, '').trim();
      const definition = parts.slice(1).join(':').trim();
      if (concept.length < 35 && definition.length > 10 && concepts.length < 6) {
        concepts.push({ concept, definition });
      }
    }
  }

  if (concepts.length === 0) {
    sentences.slice(0, 3).forEach((s, idx) => {
      concepts.push({ concept: `Key Concept ${idx + 1}`, definition: s.trim() });
    });
  }

  sentences.slice(3, 6).forEach(s => highYield.push(s.trim()));
  if (highYield.length === 0) {
    highYield.push(`Review core definitions and test items for ${courseTitle || 'this topic'}.`);
  }

  const words = wordCount || materialText.split(/\s+/).filter(Boolean).length;

  return {
    id: `ai-sum-${Date.now()}`,
    title: title || `${courseTitle || 'Study Notes'} High-Yield Summary`,
    originalText: materialText,
    overview: sentences.slice(0, 2).join(' ').trim() || `Summary extracted from ${words} words of user notes.`,
    keyConcepts: concepts,
    examHighYield: highYield,
    wordCount: words,
    estimatedStudyTimeMinutes: Math.max(10, Math.round(words / 100) * 5),
    createdAt: new Date().toISOString(),
    tags: ['StudyNotes', 'Extracted', courseTitle?.split(' ')[0] || 'Certification'],
  };
}

export default router;
