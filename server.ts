import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import mammoth from 'mammoth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// CORS headers for seamless cross-origin and proxy support
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Increase body limit to support base64 study files (PDFs, images, documents)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI with required telemetry User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: truncate excessive text to avoid hitting context limits
const MAX_DOC_CHARS = 45000;

/**
 * Fast & robust caller with low thinking latency and multi-model fallback
 */
async function generateContentWithFallback(params: any): Promise<any> {
  // Model 1: gemini-3.8-flash with ThinkingLevel.LOW (fast ~3-5s response)
  try {
    const config38 = {
      ...(params.config || {}),
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    };
    const timeout38 = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout with gemini-3.8-flash')), 12000)
    );
    const res38: any = await Promise.race([
      ai.models.generateContent({
        ...params,
        model: 'gemini-3.8-flash',
        config: config38,
      }),
      timeout38,
    ]);
    if (res38 && res38.text) return res38;
  } catch (err38: any) {
    console.warn('gemini-3.8-flash attempt failed:', err38?.message || err38);
  }

  // Model 2: gemini-flash-latest fallback (without thinkingConfig)
  try {
    const configFlash = { ...(params.config || {}) };
    delete configFlash.thinkingConfig;
    const timeoutFlash = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout with gemini-flash-latest')), 10000)
    );
    const resFlash: any = await Promise.race([
      ai.models.generateContent({
        ...params,
        model: 'gemini-flash-latest',
        config: configFlash,
      }),
      timeoutFlash,
    ]);
    if (resFlash && resFlash.text) return resFlash;
  } catch (errFlash: any) {
    console.warn('gemini-flash-latest fallback failed:', errFlash?.message || errFlash);
  }

  return null;
}

/**
 * High-quality emergency local synthesis fallback if remote models are experiencing severe upstream outages
 */
function synthesizeNotesQuizFallback(notesText: string, count: number, difficulty: string, questionType: string, fileName: string) {
  const lines = notesText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 25);

  const topics: string[] = [];
  const questions: any[] = [];

  for (let i = 0; i < lines.length && questions.length < count; i++) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    let topic = 'Study Concept';
    let content = line;

    if (colonIdx > 3 && colonIdx < 50) {
      topic = line.slice(0, colonIdx).replace(/^[\d.\-\s]+/, '').trim();
      content = line.slice(colonIdx + 1).trim();
    } else {
      const match = line.match(/^([\w\s]{4,30})[\s\-–—]/);
      if (match) {
        topic = match[1].trim();
      }
    }

    if (!topics.includes(topic)) topics.push(topic);

    const isTF = questionType === 'true_false' || (questionType === 'mixed' && questions.length % 2 === 1);

    if (isTF) {
      questions.push({
        id: `notes-fb-${Date.now()}-${i}`,
        category: 'technology',
        difficulty: (difficulty === 'mixed' ? (i % 2 === 0 ? 'easy' : 'medium') : difficulty) as 'easy' | 'medium' | 'hard',
        question: `According to your study notes, is the following statement accurate: "${line}"?`,
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        topic,
        sourceExcerpt: line.slice(0, 140),
        explanation: `Why: As stated in your study material: "${line}"`,
        isFromNotes: true,
        notesFileName: fileName,
        type: 'true_false',
      });
    } else {
      // Multiple choice
      const otherLines = lines.filter((_, idx) => idx !== i);
      const distractors = [
        otherLines[0] ? `It is contrary to ${topic}, which specifies that: ${otherLines[0].slice(0, 70)}...` : 'It is unrelated to the defined principles.',
        otherLines[1] ? `It only applies in restricted conditions: ${otherLines[1].slice(0, 65)}...` : 'It contradicts the required sequence.',
        'It is an outdated obsolete principle not supported by the notes.',
      ];

      const options = [content, ...distractors].slice(0, 4);

      questions.push({
        id: `notes-fb-${Date.now()}-${i}`,
        category: 'technology',
        difficulty: (difficulty === 'mixed' ? (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') : difficulty) as 'easy' | 'medium' | 'hard',
        question: `What does your study material state regarding "${topic}"?`,
        options,
        correctAnswerIndex: 0,
        topic,
        sourceExcerpt: line.slice(0, 140),
        explanation: `Why: Your notes explicitly specify: "${content}"`,
        isFromNotes: true,
        notesFileName: fileName,
        type: 'multiple_choice',
      });
    }
  }

  return {
    topicsIdentified: topics.slice(0, 6),
    questions,
  };
}

/**
 * Extract readable text from uploaded study material
 */
app.post('/api/notes/extract', async (req: Request, res: Response) => {
  try {
    const { base64, mimeType, fileName, textContent } = req.body;

    // If client already provided clean plain text (e.g. .txt, .md, .csv)
    if (textContent && typeof textContent === 'string' && textContent.trim().length > 0) {
      const truncated = textContent.slice(0, MAX_DOC_CHARS);
      const isTruncated = textContent.length > MAX_DOC_CHARS;
      return res.json({
        success: true,
        extractedText: truncated,
        isTruncated,
        characterCount: truncated.length,
        originalCount: textContent.length,
      });
    }

    if (!base64 || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'Missing file content or mime type',
      });
    }

    const buffer = Buffer.from(base64, 'base64');
    let extractedText = '';

    // DOCX handling via mammoth
    if (
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('msword') ||
      (fileName && fileName.endsWith('.docx'))
    ) {
      try {
        const mammothResult = await (mammoth as any).extractRawText({ buffer });
        extractedText = mammothResult.value || '';
      } catch (docErr: any) {
        console.error('Mammoth extraction failed:', docErr);
      }
    }

    // PDF or Image handling via Gemini multimodal reasoning
    if (!extractedText.trim() && (mimeType.includes('pdf') || mimeType.startsWith('image/'))) {
      if (apiKey) {
        try {
          const prompt = `You are a high-precision educational OCR and text extractor.
Extract all educational content, lecture notes, textbook passages, definitions, formulas, and concepts from the provided document.
Output ONLY the clean, extracted educational text without conversational pleasantries or commentary.`;

          const response = await generateContentWithFallback({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: base64,
                      mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType,
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
          });

          extractedText = response.text || '';
        } catch (genErr) {
          console.error('Gemini OCR extraction fallback error:', genErr);
        }
      }
    }

    if (!extractedText.trim()) {
      // Fallback: try utf-8 string conversion if it was a plain text or markup buffer
      const textCandidate = buffer.toString('utf-8');
      if (textCandidate && !/[\x00-\x08\x0E-\x1F]/.test(textCandidate.slice(0, 100))) {
        extractedText = textCandidate;
      }
    }

    if (!extractedText.trim()) {
      return res.status(422).json({
        success: false,
        error:
          'Could not extract readable educational text from this file. Please verify it is a valid PDF, DOCX, TXT, or Image with study notes.',
      });
    }

    const truncated = extractedText.slice(0, MAX_DOC_CHARS);
    const isTruncated = extractedText.length > MAX_DOC_CHARS;

    return res.json({
      success: true,
      extractedText: truncated,
      isTruncated,
      characterCount: truncated.length,
      originalCount: extractedText.length,
    });
  } catch (err: any) {
    console.error('Error extracting notes text:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process and extract text from study material.',
    });
  }
});

/**
 * Generate Quiz from Notes
 */
app.post('/api/notes/generate-quiz', async (req: Request, res: Response) => {
  try {
    const {
      notesText,
      difficulty = 'medium',
      questionCount = 10,
      questionType = 'multiple_choice',
      fileName = 'My Notes',
    } = req.body;

    if (!notesText || typeof notesText !== 'string' || notesText.trim().length < 40) {
      return res.status(400).json({
        success: false,
        error: 'Study material text is too short or empty. Please upload richer notes.',
      });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 20);

    const systemInstruction = `You are Quizora's specialized Study Material Assessment Engine.
Your task is to generate challenging, high-quality quiz questions STRICTLY and EXCLUSIVELY from the user's provided study notes.

CRITICAL RULES:
1. Grounding: Generate questions ONLY from the information explicitly contained in the provided notes. Never introduce external knowledge or facts not present in the notes.
2. Question Types:
   - If questionType is 'multiple_choice': Provide exactly 4 options. Exactly 1 is correct. Distractors must be plausible based on the context of the notes.
   - If questionType is 'true_false': Provide exactly 2 options: ["True", "False"]. The statement must directly relate to a fact from the notes.
   - If questionType is 'mixed': Create a mix of multiple choice (4 options) and True/False (2 options).
3. Difficulty:
   - Target difficulty: ${difficulty} (if 'mixed', vary across easy, medium, and hard).
4. Explanations:
   - Provide a concise explanation starting with 'Why:'
   - Provide a 'sourceExcerpt': a short direct excerpt or paraphrase from the uploaded material proving the answer.
5. Topic Tagging:
   - Give each question a clear 'topic' derived from the notes (e.g., 'Functional Dependencies', 'Mitochondria Function', 'Process Scheduling').`;

    const prompt = `STUDY MATERIAL:
---
${notesText.slice(0, MAX_DOC_CHARS)}
---

TASK:
Generate exactly ${count} quiz questions following the system instructions.
Difficulty requested: ${difficulty}
Question type requested: ${questionType}`;

    let parsed: any = null;

    if (apiKey) {
      try {
        const response = await generateContentWithFallback({
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                topicsIdentified: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of main educational topics covered in this study material',
                },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING, description: 'The question prompt' },
                      type: {
                        type: Type.STRING,
                        description: 'multiple_choice or true_false',
                      },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: '4 options for multiple choice, or ["True", "False"] for true_false',
                      },
                      correctAnswerIndex: {
                        type: Type.INTEGER,
                        description: 'Zero-based index of the correct option',
                      },
                      difficulty: {
                        type: Type.STRING,
                        description: 'easy, medium, or hard',
                      },
                      topic: {
                        type: Type.STRING,
                        description: 'Specific topic from the study notes',
                      },
                      sourceExcerpt: {
                        type: Type.STRING,
                        description: 'Short relevant excerpt from the notes proving the answer',
                      },
                      explanation: {
                        type: Type.STRING,
                        description: 'Concise explanation why the answer is correct based on the notes',
                      },
                    },
                    required: [
                      'question',
                      'type',
                      'options',
                      'correctAnswerIndex',
                      'difficulty',
                      'topic',
                      'sourceExcerpt',
                      'explanation',
                    ],
                  },
                },
              },
              required: ['topicsIdentified', 'questions'],
            },
          },
        });

        if (response?.text) {
          parsed = JSON.parse(response.text);
        }
      } catch (aiErr) {
        console.warn('AI call failed, utilizing local structured notes synthesis:', aiErr);
      }
    }

    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      // Local guaranteed synthesis fallback so user is never stranded
      parsed = synthesizeNotesQuizFallback(notesText, count, difficulty, questionType, fileName);
    }

    // Format questions to match Quizora's internal Question interface
    const formattedQuestions = (parsed.questions || []).map((q: any, idx: number) => ({
      id: `notes-q-${Date.now()}-${idx}`,
      category: 'technology',
      difficulty: q.difficulty?.toLowerCase() === 'hard' ? 'hard' : q.difficulty?.toLowerCase() === 'easy' ? 'easy' : 'medium',
      question: q.question,
      options: q.options || ['True', 'False'],
      correctAnswerIndex: Math.max(0, Math.min(Number(q.correctAnswerIndex) || 0, (q.options?.length || 2) - 1)),
      topic: q.topic || 'General Notes',
      sourceExcerpt: q.sourceExcerpt || '',
      explanation: q.explanation || '',
      isFromNotes: true,
      notesFileName: fileName,
      type: q.type || ((q.options?.length || 4) === 2 ? 'true_false' : 'multiple_choice'),
    }));

    return res.json({
      success: true,
      topicsIdentified: parsed.topicsIdentified || [],
      questions: formattedQuestions,
    });
  } catch (err: any) {
    console.error('Error generating quiz from notes, falling back:', err);
    const count = Math.min(Math.max(Number(req.body?.questionCount) || 5, 3), 20);
    const fallback = synthesizeNotesQuizFallback(req.body?.notesText || '', count, req.body?.difficulty || 'medium', req.body?.questionType || 'multiple_choice', req.body?.fileName || 'My Notes');
    return res.json({
      success: true,
      topicsIdentified: fallback.topicsIdentified,
      questions: fallback.questions,
    });
  }
});

/**
 * Generate Weak Topics Revision Quiz
 */
app.post('/api/notes/retry-weak', async (req: Request, res: Response) => {
  try {
    const { notesText, weakTopics, fileName = 'My Notes' } = req.body;

    if (!notesText || !weakTopics || !Array.isArray(weakTopics) || weakTopics.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing notes text or weak topics list.',
      });
    }

    const topicsList = weakTopics.join(', ');
    const count = Math.min(Math.max(weakTopics.length * 2, 4), 10);

    let parsed: any = null;

    if (apiKey) {
      try {
        const systemInstruction = `You are Quizora's Revision Quiz Engine.
The student previously took a quiz on their uploaded notes and answered questions incorrectly on these specific weak topics: ${topicsList}.
Generate a targeted ${count}-question quiz focusing primarily on reinforcing understanding of these weak concepts, using ONLY the supplied notes.`;

        const prompt = `STUDY MATERIAL:
---
${notesText.slice(0, MAX_DOC_CHARS)}
---

WEAK TOPICS TO REINFORCE:
${topicsList}

Generate ${count} questions focusing on these weak topics. Ensure 4 clear options for multiple choice or ["True", "False"], correct index, clear explanations, and source excerpt.`;

        const response = await generateContentWithFallback({
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      type: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctAnswerIndex: { type: Type.INTEGER },
                      difficulty: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      sourceExcerpt: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: [
                      'question',
                      'type',
                      'options',
                      'correctAnswerIndex',
                      'difficulty',
                      'topic',
                      'sourceExcerpt',
                      'explanation',
                    ],
                  },
                },
              },
              required: ['questions'],
            },
          },
        });

        if (response?.text) {
          parsed = JSON.parse(response.text);
        }
      } catch (err) {
        console.warn('Weak revision AI generation failed, using local revision synthesis:', err);
      }
    }

    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      parsed = synthesizeNotesQuizFallback(notesText, count, 'medium', 'mixed', fileName);
    }

    const formattedQuestions = (parsed.questions || []).map((q: any, idx: number) => ({
      id: `notes-revision-${Date.now()}-${idx}`,
      category: 'technology',
      difficulty: q.difficulty?.toLowerCase() === 'hard' ? 'hard' : q.difficulty?.toLowerCase() === 'easy' ? 'easy' : 'medium',
      question: q.question,
      options: q.options || ['True', 'False'],
      correctAnswerIndex: Math.max(0, Math.min(Number(q.correctAnswerIndex) || 0, (q.options?.length || 2) - 1)),
      topic: q.topic || weakTopics[0] || 'Revision Topic',
      sourceExcerpt: q.sourceExcerpt || '',
      explanation: q.explanation || '',
      isFromNotes: true,
      notesFileName: fileName,
      type: q.type || ((q.options?.length || 4) === 2 ? 'true_false' : 'multiple_choice'),
    }));

    return res.json({
      success: true,
      questions: formattedQuestions,
    });
  } catch (err: any) {
    console.error('Error generating weak topic revision quiz, falling back:', err);
    const count = Math.min(Math.max((req.body?.weakTopics?.length || 1) * 2, 4), 10);
    const fallback = synthesizeNotesQuizFallback(req.body?.notesText || '', count, 'medium', 'mixed', req.body?.fileName || 'Revision Quiz');
    return res.json({
      success: true,
      questions: fallback.questions,
    });
  }
});

// Full-stack Vite dev server middleware mounting
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Quizora full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
