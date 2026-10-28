import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
// Lock to port 3000 to match nginx proxy_pass http://localhost:3000
const PORT = 3000;

// Support base64 image uploads up to 30MB
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: 'A crisp, insightful 1-sentence headline summarizing what this situation represents.',
    },
    whatISee: {
      type: Type.OBJECT,
      properties: {
        objects: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key physical objects, equipment, or items clearly visible.',
        },
        people: {
          type: Type.STRING,
          description: 'Visible people, posture, activities, or note if none present.',
        },
        textDetected: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Any readable text, labels, warning signs, gauges, or messages.',
        },
        environment: {
          type: Type.STRING,
          description: 'Setting, indoor/outdoor, lighting, state of maintenance, or workspace conditions.',
        },
        keyVisualDetails: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Specific physical attributes verified directly from pixels (colors, stains, cracks, positions).',
        },
      },
      required: ['objects', 'people', 'textDetected', 'environment', 'keyVisualDetails'],
    },
    whatIsHappening: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: 'Comprehensive situational explanation of what is taking place or represented.',
        },
        directObservationsVsInferences: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              directObservation: {
                type: Type.STRING,
                description: 'Objective physical fact seen in the image.',
              },
              inferredMeaning: {
                type: Type.STRING,
                description: 'What this observation likely indicates, explicitly marked as an interpretation.',
              },
            },
            required: ['directObservation', 'inferredMeaning'],
          },
          description: 'Explicit pairs showing how observations lead to deductions without confusing the two.',
        },
        isInformationSufficient: {
          type: Type.BOOLEAN,
          description: 'Whether the image provides sufficient context for a reliable conclusion.',
        },
        insufficientDetailsNote: {
          type: Type.STRING,
          description: 'Explanation of what critical angles, information, or context are missing.',
        },
      },
      required: ['summary', 'directObservationsVsInferences', 'isInformationSufficient'],
    },
    whyItMatters: {
      type: Type.OBJECT,
      properties: {
        relevanceSummary: {
          type: Type.STRING,
          description: 'Why this situation or state matters to the user or system.',
        },
        implications: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key consequences, operational, safety, or functional implications if unaddressed.',
        },
      },
      required: ['relevanceSummary', 'implications'],
    },
    possibleRisksOrConcerns: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          description: 'Overall risk level: "none" | "low" | "moderate" | "high" | "critical"',
        },
        concerns: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              severity: { type: Type.STRING },
            },
            required: ['title', 'detail', 'severity'],
          },
          description: 'Specific hazards, deterioration risks, misunderstandings, or warning flags.',
        },
        safetyAdvice: {
          type: Type.STRING,
          description: 'Safety guidelines or precautions relevant to this situation.',
        },
      },
      required: ['level', 'concerns', 'safetyAdvice'],
    },
    recommendedAction: {
      type: Type.OBJECT,
      properties: {
        immediateSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Actionable steps to take right away.',
        },
        secondarySteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Longer term, follow-up, or preventive measures.',
        },
        whenToSeekExpert: {
          type: Type.STRING,
          description: 'Clear criteria for when a qualified specialist or emergency service should be consulted.',
        },
      },
      required: ['immediateSteps', 'secondarySteps', 'whenToSeekExpert'],
    },
    confidence: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          description: '"High" | "Medium" | "Low"',
        },
        percentage: {
          type: Type.NUMBER,
          description: 'Confidence percentage from 10 to 98.',
        },
        rationale: {
          type: Type.STRING,
          description: 'Why this confidence score was assigned based on visual clarity and certainty.',
        },
      },
      required: ['level', 'percentage', 'rationale'],
    },
    thingsToCheck: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Physical checks, serial numbers, measurements, or additional angles that would confirm or refine this analysis.',
    },
    disclaimer: {
      type: Type.STRING,
      description: 'Standard protective disclaimer: observational assistance, not professional advice.',
    },
  },
  required: [
    'headline',
    'whatISee',
    'whatIsHappening',
    'whyItMatters',
    'possibleRisksOrConcerns',
    'recommendedAction',
    'confidence',
    'thingsToCheck',
    'disclaimer',
  ],
};

const SYSTEM_INSTRUCTION = `You are LifeLens AI, an intelligent multimodal situation-analysis assistant.
Your tagline is: "See it. Understand it. Act on it."

Your role is to analyze images provided by users following a disciplined intelligence pipeline:
Image -> Observation -> Context -> Meaning -> Importance/Risk -> Recommended Action.

CORE OPERATIONAL RULES:
1. Do NOT just list objects. Synthesize the overall situation represented in the scene.
2. STRICTLY DISTINGUISH direct visual observations (unambiguous physical elements visible in the pixels) from inferences/interpretations (what those signs probably signify).
3. NEVER present uncertain conclusions as facts. Use nuanced, honest qualifiers like "indicates likely", "suggests", "possibly represents".
4. If the image lacks sufficient detail, resolution, or perspective to make a definitive diagnosis, explicitly flag isInformationSufficient as false and specify what details are missing in insufficientDetailsNote.
5. FOR SAFETY: Prioritize safe behavior. If hazardous conditions (electrical, structural, chemical, biohazard, immediate physical danger) are suspected, recommend safe distancing, immediate caution, and calling licensed professionals or emergency responders.
6. SCOPE DISCLAIMER: Explicitly reinforce that LifeLens AI provides automated observational analysis and is not certified professional engineering, medical, legal, financial, or emergency advice.`;

// Models to try in order of current availability and multimodal stability
async function generateContentWithRetry(params: any) {
  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt with ${model} failed:`, err?.message || err);
      // Wait briefly before trying fallback model if 503/429
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError;
}

// POST /api/analyze
app.post('/api/analyze', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { imageBase64, mimeType = 'image/jpeg', userFocus } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 in request' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
      return;
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    // Validate standard MIME type
    const validMime = mimeType === 'image/svg+xml' ? 'image/png' : mimeType;

    const promptText = userFocus
      ? `Conduct a full LifeLens situation analysis on this image. The user also noted this specific question or area of focus: "${userFocus}". Address this focus thoroughly within the structured pipeline.`
      : 'Conduct a comprehensive LifeLens situation analysis on this image, strictly adhering to the pipeline: Observation -> Context -> Meaning -> Importance/Risk -> Recommended Action.';

    const response = await generateContentWithRetry({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: validMime,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      res.status(500).json({ error: 'No response text received from Gemini multimodal model.' });
      return;
    }

    // Strip any markdown code fence if returned
    const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(cleanJson);
    const enrichedData = {
      ...parsedData,
      id: 'lens_' + Date.now(),
      timestamp: Date.now(),
    };

    res.json(enrichedData);
  } catch (err: any) {
    console.error('Error analyzing image with Gemini:', err);
    // Never send 502/503/504 as Nginx intercepts them with warmup.html
    const errorMsg = err?.message || 'Failed to analyze situation with Gemini';
    res.status(500).json({
      error: errorMsg,
    });
  }
});

// POST /api/chat
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { imageBase64, mimeType = 'image/jpeg', history = [], message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Missing message in request' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    const cleanBase64 = imageBase64
      ? imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '')
      : null;

    const validMime = mimeType === 'image/svg+xml' ? 'image/png' : mimeType;

    // Build contents sequence with image in the first user turn
    const contents: any[] = [];

    const chatInstruction = `You are LifeLens AI answering follow-up questions about the previously uploaded image.
Always maintain the image context. Be precise, practical, and helpful. Clearly distinguish between what can be verified directly from the image and what is an assumption. Prioritize safety and suggest professional verification whenever appropriate.`;

    const initialUserParts: any[] = [];
    if (cleanBase64) {
      initialUserParts.push({
        inlineData: {
          mimeType: validMime,
          data: cleanBase64,
        },
      });
    }
    initialUserParts.push({
      text: 'Here is the image that was analyzed. I will ask you follow-up questions about it.',
    });

    contents.push({
      role: 'user',
      parts: initialUserParts,
    });

    contents.push({
      role: 'model',
      parts: [{ text: 'I have the image in context. What would you like to explore or clarify further?' }],
    });

    // Add prior history
    for (const item of history) {
      if (item.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: item.text }],
        });
      } else if (item.role === 'assistant') {
        contents.push({
          role: 'model',
          parts: [{ text: item.text }],
        });
      }
    }

    // Add new message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await generateContentWithRetry({
      contents,
      config: {
        systemInstruction: chatInstruction,
      },
    });

    res.json({
      text: response.text || 'Unable to generate follow-up answer.',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in chat follow-up:', err);
    res.status(500).json({
      error: err?.message || 'Failed to process follow-up question',
    });
  }
});

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Configure Vite or Static Serve
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeLens AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
