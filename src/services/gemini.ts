import { GoogleGenAI } from '@google/genai';
import { GeminiPlanResponse, Phase, StudyMode } from '../types/plan';
import { formatDate, addDays, formatShortDay } from '../data/sampleExams';
import { getStoredApiKey } from './storage';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface GeneratePlanParams {
  examName: string;
  examDate: string; // YYYY-MM-DD
  syllabus: string;
  studyDays: number[]; // e.g. [1, 2, 3, 4, 5]
  hoursPerDay: number;
  apiKey?: string;
  completedTopics?: string[]; // For replanning
}

export function buildSystemPrompt(): string {
  return `You are an elite study strategist and learning scientist. Your goal is to produce a high-impact, realistic exam preparation schedule.

STRICT JSON OUTPUT CONTRACT:
Return ONLY valid JSON matching this exact structure without markdown code blocks, backticks, or any extraneous text:
{
  "phases": [
    {
      "type": "daily",
      "label": "Week 1: Core Foundations",
      "dateRange": "Sep 9 – Sep 15",
      "entries": [
        {
          "label": "Mon 9",
          "date": "2026-09-09",
          "focus": "Cellular Energetics & Membranes",
          "sessions": [
            { "topic": "Glycolysis Steps", "hours": 1.5, "mode": "learn" },
            { "topic": "Membrane Transport FRQ", "hours": 1.5, "mode": "practice" }
          ]
        }
      ]
    }
  ],
  "tips": [
    "Short actionable study tip 1",
    "Short actionable study tip 2"
  ]
}

CRITICAL RULES:
1. Mode MUST strictly be one of: "learn", "revise", "practice".
2. Detail level: Provide day-by-day ("daily" type) entries with exact "YYYY-MM-DD" calendar dates for approximately the first 14 available study days.
3. Switch to weekly summary blocks ("weekly" type) for days beyond the first 14 available study days.
4. Total entries cap: Cap the whole plan at roughly 12 to 20 total entries across all phases so the mind map remains clean, readable, and compact.
5. Syllabus coverage: Cover EVERY topic listed in the syllabus at least once (initial "learn" pass, then "revise"/"practice").
6. Topics marked with "(hard)" MUST receive extra study sessions and practice drills.
7. Total hours per day must roughly match the user's specified hours available per study day.
8. Only schedule sessions on the user's selected study days of the week.
9. Final Days: Keep the last 1-2 days before the exam date light, focusing only on high-yield review and formula recall ("revise").
10. Session topic names must be concise (max 4-5 words). Focus phrase should be 3-6 words.
11. Return 3-5 high-yield, specific study tips for this exact subject.`;
}

export async function generateStudyPlanWithGemini(params: GeneratePlanParams): Promise<{
  phases: Phase[];
  tips: string[];
  isMock?: boolean;
}> {
  const activeApiKey = (params.apiKey || getStoredApiKey()).trim();
  const todayStr = formatDate(new Date());
  
  const studyDayNames = params.studyDays
    .map(d => DAY_NAMES[d % 7])
    .join(', ');

  const isReplan = params.completedTopics && params.completedTopics.length > 0;

  const userPrompt = `
Generate an exam study plan for:
- Exam Name: ${params.examName}
- Today's Date: ${todayStr}
- Exam Date: ${params.examDate}
- Available Study Days of Week: ${studyDayNames} (Selected Day Indices: ${params.studyDays.join(', ')})
- Hours Available per Study Day: ${params.hoursPerDay} hours/day
- Syllabus Topics:
${params.syllabus}
${
  isReplan
    ? `\nREPLAN INSTRUCTIONS:
The student has already completed the following topics:
${params.completedTopics?.map(t => `- ${t}`).join('\n')}
Please optimize and condense the remaining schedule starting from ${todayStr} up to the exam date on ${params.examDate}, focusing heavily on the remaining uncompleted topics and final exam readiness!`
    : ''
}

Remember: Output ONLY the raw JSON object matching the contract. No explanations, no markdown ticks.`;

  if (!activeApiKey) {
    console.warn('No Gemini API key provided. Using intelligent algorithmic fallback.');
    const fallback = generateAlgorithmicPlan(params);
    return { ...fallback, isMock: true };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeApiKey });
    // Use gemini-2.5-flash or gemini-1.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${buildSystemPrompt()}\n\n${userPrompt}` }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    const parsed: GeminiPlanResponse = JSON.parse(cleanJson);

    // Transform and assign unique IDs
    const phases: Phase[] = parsed.phases.map((phase, pIdx) => ({
      id: `phase-${pIdx + 1}-${Date.now()}`,
      type: phase.type === 'weekly' ? 'weekly' : 'daily',
      label: phase.label || `Phase ${pIdx + 1}`,
      dateRange: phase.dateRange || '',
      entries: (phase.entries || []).map((entry, eIdx) => ({
        id: `entry-${pIdx + 1}-${eIdx + 1}-${Date.now()}`,
        label: entry.label,
        date: entry.date,
        focus: entry.focus || 'Core Topic Mastery',
        sessions: (entry.sessions || []).map((session, sIdx) => ({
          id: `s-${pIdx + 1}-${eIdx + 1}-${sIdx + 1}-${Math.random().toString(36).substring(2, 6)}`,
          topic: session.topic,
          hours: Number(session.hours) || 1,
          mode: normalizeMode(session.mode),
        }))
      }))
    }));

    const tips = Array.isArray(parsed.tips) && parsed.tips.length > 0 
      ? parsed.tips 
      : [
          'Break study blocks into 45-minute focused sprints with 10-minute active breaks.',
          'Test yourself with active recall before checking notes or answer keys.',
          'Review the hardest concepts early in your study session when focus is highest.'
        ];

    return { phases, tips, isMock: false };
  } catch (error: any) {
    console.error('Gemini API request failed:', error);
    // If API failed due to bad key or rate limit, fall back to algorithmic generator
    const fallback = generateAlgorithmicPlan(params);
    return { ...fallback, isMock: true };
  }
}

function normalizeMode(mode: string): StudyMode {
  const lower = (mode || '').toLowerCase();
  if (lower.includes('prac')) return 'practice';
  if (lower.includes('rev')) return 'revise';
  return 'learn';
}

/**
 * Intelligent algorithmic fallback generator for offline / no-key demo execution
 */
export function generateAlgorithmicPlan(params: GeneratePlanParams): { phases: Phase[]; tips: string[] } {
  const today = new Date();
  const examDate = new Date(params.examDate);
  const totalDaysToExam = Math.max(1, Math.round((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const rawTopics = params.syllabus
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const completedSet = new Set((params.completedTopics || []).map(t => t.toLowerCase()));
  const topics = rawTopics.filter(t => !completedSet.has(t.replace(/\(hard\)/i, '').trim().toLowerCase()));
  const activeTopics = topics.length > 0 ? topics : rawTopics;

  // Calculate available study dates
  const studyDates: Date[] = [];
  for (let i = 0; i < totalDaysToExam; i++) {
    const d = addDays(today, i);
    const dayOfWeek = d.getDay();
    if (params.studyDays.includes(dayOfWeek)) {
      studyDates.push(d);
    }
  }

  const effectiveStudyDates = studyDates.length > 0 ? studyDates : [today, addDays(today, 1), addDays(today, 2)];
  const dailyDates = effectiveStudyDates.slice(0, 12);
  const remainingDates = effectiveStudyDates.slice(12);

  const phases: Phase[] = [];
  let topicIndex = 0;
  let phaseNum = 1;

  // Phase 1: First 6 daily study dates
  if (dailyDates.length > 0) {
    const chunk1 = dailyDates.slice(0, 6);
    const p1Entries = chunk1.map((d, eIdx) => {
      const isLastDays = totalDaysToExam <= 2;
      const topic1 = activeTopics[topicIndex % activeTopics.length] || 'Core Subject Review';
      const isHard1 = topic1.toLowerCase().includes('(hard)');
      const cleanTopic1 = topic1.replace(/\(hard\)/i, '').trim();
      topicIndex++;

      const topic2 = activeTopics[topicIndex % activeTopics.length] || 'Exam Question Drills';
      const cleanTopic2 = topic2.replace(/\(hard\)/i, '').trim();
      topicIndex++;

      const h1 = Math.max(0.5, Math.round((params.hoursPerDay * 0.6) * 10) / 10);
      const h2 = Math.max(0.5, Math.round((params.hoursPerDay * 0.4) * 10) / 10);

      return {
        id: `fallback-e-1-${eIdx}-${Date.now()}`,
        label: formatShortDay(d),
        date: formatDate(d),
        focus: isLastDays ? 'High-Yield Formula & Concept Review' : `${cleanTopic1} Deep Dive`,
        sessions: [
          {
            id: `f-s-1-${eIdx}-1-${Math.random().toString(36).substring(2, 6)}`,
            topic: cleanTopic1.slice(0, 24),
            hours: isHard1 ? h1 + 0.5 : h1,
            mode: isLastDays ? 'revise' : ('learn' as StudyMode)
          },
          {
            id: `f-s-1-${eIdx}-2-${Math.random().toString(36).substring(2, 6)}`,
            topic: isHard1 ? `${cleanTopic1} Practice Drills` : cleanTopic2.slice(0, 24),
            hours: h2,
            mode: 'practice' as StudyMode
          }
        ]
      };
    });

    phases.push({
      id: `fallback-phase-1-${Date.now()}`,
      type: 'daily',
      label: 'Phase 1: Foundation & Core Topics',
      dateRange: `${formatShortDay(chunk1[0])} – ${formatShortDay(chunk1[chunk1.length - 1])}`,
      entries: p1Entries
    });
    phaseNum++;
  }

  // Phase 2: Next 6 daily study dates
  if (dailyDates.length > 6) {
    const chunk2 = dailyDates.slice(6, 12);
    const p2Entries = chunk2.map((d, eIdx) => {
      const topic1 = activeTopics[topicIndex % activeTopics.length] || 'Advanced Problem Sets';
      const cleanTopic1 = topic1.replace(/\(hard\)/i, '').trim();
      topicIndex++;

      return {
        id: `fallback-e-2-${eIdx}-${Date.now()}`,
        label: formatShortDay(d),
        date: formatDate(d),
        focus: `${cleanTopic1} & Practice Sets`,
        sessions: [
          {
            id: `f-s-2-${eIdx}-1-${Math.random().toString(36).substring(2, 6)}`,
            topic: cleanTopic1.slice(0, 24),
            hours: Math.max(1, params.hoursPerDay * 0.5),
            mode: 'revise' as StudyMode
          },
          {
            id: `f-s-2-${eIdx}-2-${Math.random().toString(36).substring(2, 6)}`,
            topic: 'Timed Past Exam Questions',
            hours: Math.max(1, params.hoursPerDay * 0.5),
            mode: 'practice' as StudyMode
          }
        ]
      };
    });

    phases.push({
      id: `fallback-phase-2-${Date.now()}`,
      type: 'daily',
      label: 'Phase 2: Reinforcement & Weak Spots',
      dateRange: `${formatShortDay(chunk2[0])} – ${formatShortDay(chunk2[chunk2.length - 1])}`,
      entries: p2Entries
    });
    phaseNum++;
  }

  // Phase 3: Weekly blocks for remainder
  if (remainingDates.length > 0) {
    const p3Entries = [
      {
        id: `fallback-e-3-1-${Date.now()}`,
        label: 'Comprehensive Mock 1',
        date: formatDate(remainingDates[0]),
        focus: 'Full Diagnostic Simulation',
        sessions: [
          {
            id: `f-s-3-1-1-${Math.random().toString(36).substring(2, 6)}`,
            topic: 'Timed Full-Length Exam',
            hours: params.hoursPerDay,
            mode: 'practice' as StudyMode
          }
        ]
      },
      {
        id: `fallback-e-3-2-${Date.now()}`,
        label: 'Eve of Exam Sprint',
        date: formatDate(remainingDates[remainingDates.length - 1]),
        focus: 'Formula Recall & Light Rest',
        sessions: [
          {
            id: `f-s-3-2-1-${Math.random().toString(36).substring(2, 6)}`,
            topic: 'High-Yield Formula Review',
            hours: Math.min(1.5, params.hoursPerDay),
            mode: 'revise' as StudyMode
          }
        ]
      }
    ];

    phases.push({
      id: `fallback-phase-3-${Date.now()}`,
      type: 'weekly',
      label: `Phase ${phaseNum}: Final Mock Simulations`,
      dateRange: `${formatShortDay(remainingDates[0])} – ${formatShortDay(remainingDates[remainingDates.length - 1])}`,
      entries: p3Entries
    });
  }

  const tips = [
    'Use the Feynman technique: explain complex topics aloud as if teaching a beginner.',
    'Focus on hard-tagged topics in the morning when mental energy is at its peak.',
    'Do full timed mock exams in conditions identical to the real test day.'
  ];

  return { phases, tips };
}
