import { GoogleGenAI } from '@google/genai';
import { ResearchSummary } from '../types/eduflow';
import { getStoredApiKey } from './storage';
import { api } from './api';

export interface SummarizeParams {
  materialText: string;
  courseTitle?: string;
  fileName?: string;
  customPromptFocus?: string;
}

export interface SummarizerStatus {
  hasKey: boolean;
  source: 'env' | 'localStorage' | 'backend' | 'none';
  keyMasked: string;
}

export function getGeminiApiKeyStatus(): SummarizerStatus {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
  if (envKey && envKey.trim().length > 5) {
    return {
      hasKey: true,
      source: 'env',
      keyMasked: `••••••••${envKey.slice(-4)}`,
    };
  }

  const storedKey = getStoredApiKey();
  if (storedKey && storedKey.trim().length > 5) {
    return {
      hasKey: true,
      source: 'localStorage',
      keyMasked: `••••••••${storedKey.slice(-4)}`,
    };
  }

  return {
    hasKey: true,
    source: 'backend',
    keyMasked: 'Server-Side Managed',
  };
}

export function getEffectiveApiKey(): string {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  return getStoredApiKey().trim();
}

export async function summarizeResearchMaterial(params: SummarizeParams): Promise<Omit<ResearchSummary, 'id' | 'createdAt'>> {
  const { materialText, courseTitle = 'Certification Exam', fileName, customPromptFocus } = params;

  if (!materialText || materialText.trim().length < 20) {
    throw new Error('Please provide at least 20 characters of study material to summarize.');
  }

  // If text is extremely long (> 60,000 characters), truncate with warning
  let textToAnalyze = materialText;
  if (textToAnalyze.length > 60000) {
    textToAnalyze = textToAnalyze.substring(0, 60000) + '\n\n[...Content truncated for model token length...]';
  }

  // 1. Try Backend Proxy First (Keeps Gemini API key secure on server)
  try {
    const backendSummary = await api.summarizeResearchMaterial(
      textToAnalyze,
      fileName ? fileName.replace(/\.[^/.]+$/, '') : `${courseTitle} Study Summary`,
      undefined
    );
    return {
      title: backendSummary.title || fileName || `${courseTitle} Summary`,
      originalText: textToAnalyze,
      fileName,
      overview: backendSummary.overview,
      keyConcepts: backendSummary.keyConcepts || [],
      examHighYield: backendSummary.examHighYield || [],
      wordCount: textToAnalyze.split(/\s+/).filter(Boolean).length,
      estimatedStudyTimeMinutes: backendSummary.estimatedStudyTimeMinutes || 20,
      tags: backendSummary.tags || ['StudyNotes', 'ExamPrep'],
    };
  } catch (backendErr) {
    console.warn('Backend AI proxy unavailable, attempting client fallback:', backendErr);
  }

  // 2. Client-side fallback if a local key is configured
  const apiKey = getEffectiveApiKey();
  if (apiKey) {
    try {
      return await callGeminiAPI(apiKey, textToAnalyze, courseTitle, fileName, customPromptFocus);
    } catch (err: any) {
      console.warn('Direct Gemini call failed, generating local intelligent analysis:', err);
      return generateLocalIntelligentSummary(textToAnalyze, courseTitle, fileName);
    }
  }

  // 3. High-yield local algorithmic extraction
  return generateLocalIntelligentSummary(textToAnalyze, courseTitle, fileName);
}

async function callGeminiAPI(
  apiKey: string, 
  text: string, 
  courseTitle: string, 
  fileName?: string,
  focus?: string
): Promise<Omit<ResearchSummary, 'id' | 'createdAt'>> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a learning scientist and exam preparation specialist. Analyze the following study notes / material for a student preparing for ${courseTitle}.
${focus ? `Special focus area requested by student: ${focus}` : ''}

SOURCE MATERIAL:
"""
${text}
"""

Return a strict JSON object with this EXACT structure (no markdown formatting outside the JSON, no backticks):
{
  "title": "A concise, descriptive 4-8 word title for this topic",
  "overview": "A concise 2-3 sentence executive synopsis explaining the core architectural/technical purpose of this material.",
  "keyConcepts": [
    {
      "concept": "Name of concept/component/rule",
      "definition": "Clear, precise explanation of how it works and its exact purpose"
    }
  ],
  "examHighYield": [
    "High-probability exam test point or trap to watch out for",
    "Comparison rule or scenario requirement (e.g. When to choose X over Y)",
    "Critical limit, default behavior, or troubleshooting step"
  ],
  "estimatedStudyTimeMinutes": 25,
  "tags": ["Tag1", "Tag2", "Tag3"]
}

Ensure you provide 4 to 8 key concepts and 3 to 6 high-yield exam points.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const rawText = response.text || '';
  
  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse structured summary response from Gemini.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || fileName || 'Research Study Notes Summary',
    originalText: text,
    fileName,
    overview: parsed.overview || 'Overview of key concepts extracted from study material.',
    keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
    examHighYield: Array.isArray(parsed.examHighYield) ? parsed.examHighYield : [],
    wordCount: text.split(/\s+/).filter(Boolean).length,
    estimatedStudyTimeMinutes: Number(parsed.estimatedStudyTimeMinutes) || 20,
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['Research', 'StudyNotes'],
  };
}

// Intelligent local summarizer fallback (when offline or before API key is provided)
function generateLocalIntelligentSummary(
  text: string, 
  courseTitle: string, 
  fileName?: string
): Omit<ResearchSummary, 'id' | 'createdAt'> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  
  // Extract title candidate
  let derivedTitle = fileName ? fileName.replace(/\.[^/.]+$/, '') : '';
  if (!derivedTitle && lines.length > 0) {
    derivedTitle = lines[0].replace(/^#+\s*/, '').substring(0, 50);
  }
  if (!derivedTitle || derivedTitle.length < 4) {
    derivedTitle = `${courseTitle} Study Material Summary`;
  }

  // Extract key sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const overview = sentences.slice(0, 3).join(' ').trim() || 
    `Key technical summary extracted from ${words.length} words of notes covering core foundational principles and exam objectives.`;

  // Identify terms and definitions (looking for colons, dashes, or bold markers)
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
    } else if (line.toLowerCase().includes('important') || line.toLowerCase().includes('note') || line.toLowerCase().includes('exam') || line.toLowerCase().includes('vs')) {
      const cleanLine = line.replace(/^[-*•#\d.]+\s*/, '').trim();
      if (cleanLine.length > 15 && cleanLine.length < 220 && highYield.length < 5) {
        highYield.push(cleanLine);
      }
    }
  }

  // Fallback defaults if text had unstructured prose — extract directly from key sentences
  if (concepts.length === 0) {
    const keySentences = sentences.slice(0, 3);
    keySentences.forEach((s, i) => {
      concepts.push({
        concept: `Key Topic ${i + 1}`,
        definition: s.trim(),
      });
    });
  }

  if (highYield.length === 0) {
    const remainingSentences = sentences.slice(3, 6);
    if (remainingSentences.length > 0) {
      remainingSentences.forEach(s => highYield.push(s.trim()));
    } else {
      highYield.push(`Review core definitions and practice questions for ${courseTitle}.`);
    }
  }

  return {
    title: derivedTitle,
    originalText: text,
    fileName,
    overview,
    keyConcepts: concepts,
    examHighYield: highYield,
    wordCount: words.length,
    estimatedStudyTimeMinutes: Math.max(10, Math.round(words.length / 100) * 5),
    tags: ['StudyNotes', 'Extracted', courseTitle.split(' ')[0] || 'Cloud'],
  };
}
