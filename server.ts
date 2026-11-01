import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
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

// Define the 5 variation styling directions
export interface VariationDirectionConfig {
  version: number;
  name: string;
  aesthetic: string;
}

const VARIATION_DIRECTIONS: VariationDirectionConfig[] = [
  {
    version: 1,
    name: 'Modern elegant / warm contemporary',
    aesthetic: 'Warm amber backlight illumination, rich natural walnut cabinetry, curated minimalist ceramics, subtle indoor botanical greenery, elegant earth tones',
  },
  {
    version: 2,
    name: 'Minimalist / clean / spacious',
    aesthetic: 'Light natural oak floating shelves, airy negative space, pale limestone plaster surfaces, single sculptural vessel, soft indirect illumination, calm uncluttered serenity',
  },
  {
    version: 3,
    name: 'Luxury contemporary / premium materials',
    aesthetic: 'Dark smoked walnut fluted cabinetry, polished Nero Marquina marble top, brushed bronze hardware accents, curated art books, dramatic ambient mood lighting',
  },
  {
    version: 4,
    name: 'Scandinavian-inspired / bright / natural',
    aesthetic: 'Blonde birch woods, lush trailing indoor plants and terracotta planters, ribbed ceramic craft vases, bright natural daylight, cozy modern hygge aesthetic',
  },
  {
    version: 5,
    name: 'Modern artistic / sophisticated / statement decor',
    aesthetic: 'Matte charcoal architecture, sculptural bronze geometric piece, curated monochrome ceramics, gallery track spotlighting, statement museum-quality composition',
  },
];

// Helper to detect image aspect ratio from raw image buffer
function detectImageAspectRatio(buffer: Buffer): '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | undefined {
  try {
    let width = 0;
    let height = 0;

    // PNG: signature 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    }
    // JPEG: SOI marker 0xFF 0xD8
    else if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF markers: SOF0 to SOF3, SOF5 to SOF7, SOF9 to SOF11, SOF13 to SOF15
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          height = buffer.readUInt16BE(offset + 5);
          width = buffer.readUInt16BE(offset + 7);
          break;
        }
        const blockLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + blockLength;
      }
    }

    if (width > 0 && height > 0) {
      const ratio = width / height;
      if (ratio >= 1.55) return '16:9';
      if (ratio >= 1.18) return '4:3';
      if (ratio >= 0.85) return '1:1';
      if (ratio >= 0.62) return '3:4';
      return '9:16';
    }
  } catch {
    // Graceful fallback to undefined to let image models use source framing
  }
  return undefined;
}

// Helper to determine if an API error is transient/temporary (503, 429, 5xx, high demand, overloaded)
function isTemporaryError(err: any): boolean {
  const status = err?.status || err?.code || err?.statusCode;
  const message = String(err?.message || '').toLowerCase();
  const statusStr = String(status || '').toLowerCase();

  // Permanent client errors - do NOT retry
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    message.includes('invalid argument') ||
    message.includes('api key not valid') ||
    message.includes('unauthenticated') ||
    message.includes('permission denied')
  ) {
    return false;
  }

  // Temporary / transient errors - retry with backoff
  if (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    statusStr === 'unavailable' ||
    statusStr === 'resource_exhausted' ||
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('resource_exhausted') ||
    message.includes('overloaded') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('busy')
  ) {
    return true;
  }

  return true;
}

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
      // Wait briefly before trying fallback model if 503/429
      await new Promise((resolve) => setTimeout(resolve, 500));
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

const TRANSFORM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plan: {
      type: Type.OBJECT,
      properties: {
        environmentType: {
          type: Type.STRING,
          description:
            'Dynamic diagnosis of the environment or subject, e.g. "Messy Dressing Table", "Clothes Rack", "Bookshelf", "Living Room TV Showcase", "Study Desk", "Kitchen Prep Island", "Bedroom", "Balcony", "Storage Cabinet", etc.',
        },
        mainSubject: {
          type: Type.STRING,
          description: 'Primary focal subject or furniture identified in the scene.',
        },
        importantElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Elements that define the identity and structure of the scene (e.g. mirror frame, bed outline, shelf architecture, wall edges) that MUST be preserved.',
        },
        transformableElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Elements that can reasonably be rearranged, organized, restyled, cleaned, or improved according to user request.',
        },
        optionalElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Small decorative or clutter items (cables, loose cosmetics, paper piles) that can be modified, tucked, or removed.',
        },
        perspectiveAndLighting: {
          type: Type.STRING,
          description: 'Camera viewpoint, perspective angle, and primary lighting characteristics.',
        },
        detectedObjects: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Visible physical objects and decorative elements identified in the scene.',
        },
        spatialRelationships: {
          type: Type.STRING,
          description: 'Detailed analysis of current layout, balance, crowding, and visual weight.',
        },
        preservedElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Core structural anchors and cherished items that must remain fixed.',
        },
        rearrangedObjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              originalPosition: { type: Type.STRING },
              proposedPosition: { type: Type.STRING },
              action: {
                type: Type.STRING,
                description: '"kept" | "repositioned" | "decluttered" | "realigned" | "enhanced" | "grouped"',
              },
              reason: { type: Type.STRING },
            },
            required: ['name', 'originalPosition', 'proposedPosition', 'action', 'reason'],
          },
          description: 'Item-by-item spatial transformation mapping.',
        },
        safetyAndRealismNotes: {
          type: Type.STRING,
          description: 'Practical physical feasibility notes, cord safety, or weight distribution checks.',
        },
      },
      required: [
        'environmentType',
        'mainSubject',
        'importantElements',
        'transformableElements',
        'detectedObjects',
        'spatialRelationships',
        'preservedElements',
        'rearrangedObjects',
      ],
    },
    whatChanged: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Clear bullet points explaining what concrete visual changes were made.',
    },
    why: {
      type: Type.STRING,
      description: 'Clear explanation of why these changes improve balance, ergonomics, aesthetics, or spaciousness.',
    },
    safetyNotice: {
      type: Type.STRING,
      description: 'Any safety notice regarding heavy lifting, heat ventilation, or electrical cords.',
    },
    suggestedFollowUps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 quick refinement prompts the user can try next.',
    },
  },
  required: ['plan', 'whatChanged', 'why'],
};

const TRANSFORM_SYSTEM_INSTRUCTION = `You are LifeLens AI, an intelligent multimodal visual transformation assistant.
Your tagline is: "See it. Understand it. Act on it."

You are executing LifeLens V2: "Vision → Transform".
The user may upload ANY real-world image:
- TV/showcase area
- Clothes shelf or clothes rack
- Messy dressing table
- Bookshelf
- Bedroom
- Living room
- Kitchen
- Study table
- Office desk
- Storage cabinet
- Wardrobe
- Balcony
- Workspace
- Dining area
- Any other room, furniture, or physical space

Follow this strict transformation pipeline:
1. UNDERSTAND THE SCENE DYNAMICALLY:
   - Identify the main subject, furniture, architecture, room structure, camera viewpoint, perspective, and object positions.
   - Do NOT assume the image is a TV showcase. Dynamically diagnose the actual scene.
   - Classify visible elements into:
     a) IMPORTANT ELEMENTS: Define the identity and structure of the scene (e.g. dressing table mirror, bed frame, bookshelf unit, wardrobe outline). Must be preserved!
     b) TRANSFORMABLE ELEMENTS: Items that can reasonably be rearranged, organized, cleaned, restyled, or improved according to user request.
     c) OPTIONAL ELEMENTS: Small accessories, cosmetics, paperwork, cables, or clutter that can be modified, tucked, or removed.
2. PRESERVE THE ORIGINAL SCENE:
   - The goal is: "Transform this real situation/space", NOT "Generate a completely different room".
   - The result MUST be recognizably based on the original image: preserve overall layout, perspective, camera angle, room proportions, major furniture, and identity-defining objects.
   - Never randomly replace the scene with an unrelated stock interior.
3. USER REQUEST & CONSTRAINTS:
   - The user's request dictates what changes (e.g. organization, decluttering, minimalism, luxury materials, aesthetic styling).
   - If the user provides explicit constraints (e.g. "Keep the flowers where they are", "Don't change the TV", "Keep the mirror", "Don't move the desk"), strictly honor them across all versions!
4. EXPLAIN: Clearly specify "What changed?" and "Why?" it improves the space.
5. SAFETY & REALISM: Do not invent unrelated objects. Distinguish visible facts from inferences. For heavy items or electrical cables, include practical safety notices.`;

const SUGGESTIONS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    environmentType: {
      type: Type.STRING,
      description:
        'Specific diagnosis of the environment or scene, e.g. "Messy Dressing Table", "Overgrown Garden Patio", "Open Clothes Rack", "Bookshelf Unit", "Living Room TV Showcase", "Kitchen Prep Island", "Study Desk", "Balcony", "Storage Cabinet", etc.',
    },
    mainSubject: {
      type: Type.STRING,
      description: 'The main focal subject, furniture piece, or area identified in the image.',
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        '5 to 7 concise, highly realistic, actionable transformation prompts (under 12 words each) tailored specifically to THIS scene. Each must be a direct command.',
    },
  },
  required: ['environmentType', 'mainSubject', 'suggestions'],
};

const SUGGESTIONS_SYSTEM_INSTRUCTION = `You are LifeLens AI, an intelligent multimodal visual transformation assistant.
Your tagline is: "See it. Understand it. Act on it."

You are analyzing an image uploaded by a user to provide 5 to 7 scene-aware, actionable transformation suggestions.
The user may upload ANY real-world image:
- Garden, patio, backyard, or outdoor space
- Dressing table, vanity, cosmetics desk
- Clothes rack, wardrobe, closet, garment rail
- Bookshelf, library unit, display shelving
- TV showcase, media console, entertainment center
- Kitchen island, countertop, pantry
- Bedroom, nightstand, bed area
- Study table, home office desk, workbench
- Dining area, coffee table, entryway
- Any other room, furniture piece, or physical scene

STRICT RULES:
1. SCENE-AWARE RELEVANCE: Dynamically diagnose the EXACT scene shown. NEVER suggest desk or bookshelf organization if the image is a garden, clothes rack, or dressing table!
2. ACTIONABLE & CONCISE: Each suggestion must be a direct, compelling command (under 12 words) that clearly states what to transform, rearrange, organize, declutter, or aesthetically improve.
3. REALISTIC & PRACTICAL: Suggestions must be physically sensible and respectful of the scene's actual layout and objects.
4. VARIETY: Provide 5 to 7 diverse prompts covering:
   - Functional decluttering and clean organization
   - Aesthetic/decorative refinement and styling
   - Spatial openness and negative space
   - Practical alignment, symmetry, or ergonomic arrangement
   - Mood elevation (e.g. warm lighting, natural botanicals, minimalist serenity)`;

// POST /api/transform/suggestions
app.post('/api/transform/suggestions', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 in request' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const validMime = mimeType === 'image/svg+xml' ? 'image/png' : mimeType;

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
              text: 'Examine this scene closely. Identify the exact environment and subject, and generate 5 to 7 specific, actionable transformation prompts tailored exclusively to this real scene.',
            },
          ],
        },
      ],
      config: {
        systemInstruction: SUGGESTIONS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: SUGGESTIONS_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      res.status(500).json({ error: 'No response from model' });
      return;
    }

    const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(cleanJson);

    res.json({
      environmentType: parsedData.environmentType || 'Space',
      mainSubject: parsedData.mainSubject || 'Main Subject',
      suggestions: Array.isArray(parsedData.suggestions) && parsedData.suggestions.length > 0
        ? parsedData.suggestions.slice(0, 7)
        : [
            'Rearrange the objects to make it cleaner and more balanced',
            'Improve the decoration and aesthetic balance',
            'Create a minimalist arrangement with maximum negative space',
            'Remove visual clutter and organize essentials',
            'Make the space look more spacious and open',
          ],
    });
  } catch (err: any) {
    console.error('Error generating suggestions:', err);
    res.json({
      environmentType: 'Scene',
      mainSubject: 'Physical Space',
      suggestions: [
        'Rearrange the objects to make it cleaner and more balanced',
        'Improve the decoration and aesthetic balance',
        'Create a minimalist arrangement with maximum negative space',
        'Remove visual clutter and organize essentials',
        'Make the space look more spacious and open',
      ],
    });
  }
});

// POST /api/transform
app.post('/api/transform', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');
  // Prevent any browser or intermediary caching of transformation versions
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      userRequest,
      version = 1,
      variationDirection,
      previousContext,
    } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 in request' });
      return;
    }

    if (!userRequest || !userRequest.trim()) {
      res.status(400).json({ error: 'Please describe how you would like LifeLens to transform or rearrange the image.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const validMime = mimeType === 'image/svg+xml' ? 'image/png' : mimeType;

    // Calculate active target version and dynamic variation direction
    const targetVersion = typeof version === 'number' && version > 0 ? version : 1;
    const variationIdx = (targetVersion - 1) % VARIATION_DIRECTIONS.length;
    const currentVariation = VARIATION_DIRECTIONS[variationIdx];
    const activeVariationName = variationDirection || currentVariation.name;

    let promptText = `Analyze this uploaded image and create a detailed visual transformation plan based on the user's request: "${userRequest}".
Target Variation: Version ${targetVersion} - "${activeVariationName}".
Styling & Aesthetic Focus: ${currentVariation.aesthetic}.
CRITICAL INSTRUCTIONS:
1. Identify the actual scene and main subject. Do NOT assume it is a TV showcase. (It could be a dressing table, clothes rack, bookshelf, desk, kitchen, bedroom, garden, or any other space).
2. Classify visible items into IMPORTANT elements (preserve identity/structure), TRANSFORMABLE elements (rearrange/organize/restyle), and OPTIONAL elements (declutter/tuck).
3. The result must be a realistic transformation of THIS actual space, preserving camera perspective, proportions, and key structural anchors.
4. Formulate a genuinely distinct Version ${targetVersion} spatial arrangement and styling that provides meaningful visual variety from other versions while strictly faithful to: "${userRequest}".
5. REQUEST-DRIVEN VISUAL SYNTHESIS: The generated visualRepresentationSvg MUST visibly and unmistakably portray the user's exact request ("${userRequest}") on this specific scene!
   - If the user requested organization or alignment: show objects neatly sorted, aligned, and categorized.
   - If the user requested improving decoration: show tasteful curated accents, ceramics, subtle botanical plants, or lighting.
   - If the user requested minimalism or spaciousness: remove clutter, emphasize clean surfaces, and create open negative space.
   - If the user requested garden improvements: show trimmed greenery, neat walking path, and arranged pots.
   - If the user requested clothes rack organization: show color-coordinated clothing and uniform hangers.
   - If the user requested dressing table organization: show makeup/skincare organized in trays or vanity stands.`;

    if (previousContext) {
      promptText += `\nPrior Version Context: The user previously requested: "${previousContext.userRequest}". Previous changes included: ${previousContext.previousWhatChanged?.slice(0, 3).join('; ') || 'prior arrangement'}. Preserve any explicitly requested constraints while offering this fresh Version ${targetVersion} interpretation.`;
    }

    // Step A: Generate Structured Plan with Gemini Multimodal
    let parsedData: any = null;
    try {
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
          systemInstruction: TRANSFORM_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: TRANSFORM_SCHEMA,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        parsedData = JSON.parse(cleanJson);
      }
    } catch (stepAErr: any) {
      console.warn('Step A multimodal planning encountered temporary issue (will proceed with image transformation):', stepAErr?.message || stepAErr);
    }

    if (!parsedData || !parsedData.plan) {
      parsedData = {
        plan: {
          environmentType: 'Scene',
          mainSubject: 'Main Subject',
          importantElements: ['room architecture', 'major furniture', 'main structural walls'],
          transformableElements: ['visible objects', 'clutter', 'decorations', 'accessories'],
          preservedElements: ['original room architecture', 'major furniture'],
          rearrangedObjects: [],
        },
        whatChanged: [userRequest],
        why: 'Optimized and transformed cleanly according to your request.',
        suggestedFollowUps: ['Make it more minimal', 'Group small items onto a tray', 'Add subtle lighting'],
      };
    }

    // Detect aspect ratio from original image buffer to preserve exact framing
    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    const detectedAspectRatio = detectImageAspectRatio(imageBuffer);

    const sceneType = parsedData.plan?.environmentType || 'space';
    const mainFocal = parsedData.plan?.mainSubject || sceneType;
    const importantAnchors = (parsedData.plan?.importantElements || parsedData.plan?.preservedElements || []).join(', ');
    const transformItems = (parsedData.plan?.transformableElements || []).join(', ');

    const dynamicImgPrompt = `Edit the provided image according to the user's request. This is an image-to-image transformation, not a new scene generation.

Change ONLY the elements necessary to satisfy the user's request: "${userRequest}".

Preserve the exact original camera viewpoint, framing, perspective, scene boundaries, architecture, major furniture, main subject, important objects, materials and overall spatial identity unless the user explicitly asks to change them.
Important anchors to preserve: ${importantAnchors || 'room architecture, major furniture, and main structural subject'}.

Do not remove, replace, resize, relocate, or invent important elements unless required by the user's request.

Keep all unrequested areas as visually unchanged as possible.

The final result must be immediately recognizable as the SAME original image/scene, realistically transformed according to the user's request.

If the user asks for organization, decoration, decluttering, or rearrangement, modify only the relevant objects while preserving the original room and major elements.
Transformable elements to modify/rearrange: ${transformItems || 'visible objects, clutter, decoration, and accessories'}.
Specific planned changes: ${parsedData.whatChanged?.join('; ') || userRequest}.

Version variation: Version ${targetVersion} styling theme: "${activeVariationName}" (${currentVariation.aesthetic}). Version variation may change styling only within the requested transformation. It must NEVER override preservation of the original scene.`;

    // Step B: Gemini image-generation / editing models in required priority order:
    // Primary: gemini-nano-banana-2.1
    // Fallback: gemini-3.1-flash-image
    let finalTransformedImage = '';
    let renderMethod: 'ai-generated' = 'ai-generated';
    let lastImageError: any = null;

    const imageModels = [
      'gemini-nano-banana-2.1',
      'gemini-3.1-flash-image',
    ];

    const retryDelaysMs = [2000, 4000, 8000];

    modelLoop: for (const imgModel of imageModels) {
      console.log(`Starting image transformation with model: ${imgModel}`);

      for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
        try {
          const config: any = {
            responseModalities: ['IMAGE'],
            imageConfig: {
              imageSize: '1K',
              ...(detectedAspectRatio ? { aspectRatio: detectedAspectRatio } : {}),
            },
          };

          let imgEditResponse;
          try {
            imgEditResponse = await ai.models.generateContent({
              model: imgModel,
              contents: {
                parts: [
                  {
                    inlineData: {
                      mimeType: validMime,
                      data: cleanBase64,
                    },
                  },
                  {
                    text: dynamicImgPrompt,
                  },
                ],
              },
              config,
            });
          } catch (modelCallErr: any) {
            // If imageSize is unsupported or returns INVALID_ARGUMENT, retry without imageSize
            if (
              modelCallErr?.message?.includes('imageSize') ||
              modelCallErr?.message?.includes('INVALID_ARGUMENT') ||
              modelCallErr?.status === 400
            ) {
              imgEditResponse = await ai.models.generateContent({
                model: imgModel,
                contents: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: validMime,
                        data: cleanBase64,
                      },
                    },
                    {
                      text: dynamicImgPrompt,
                    },
                  ],
                },
                config: {
                  responseModalities: ['IMAGE'],
                  ...(detectedAspectRatio ? { imageConfig: { aspectRatio: detectedAspectRatio } } : {}),
                },
              });
            } else {
              throw modelCallErr;
            }
          }

          if (imgEditResponse?.candidates) {
            for (const candidate of imgEditResponse.candidates) {
              for (const part of candidate.content?.parts || []) {
                if (part.inlineData?.data && part.inlineData.data.trim().length > 50) {
                  const mime = part.inlineData.mimeType || 'image/png';
                  finalTransformedImage = `data:${mime};base64,${part.inlineData.data}`;
                  renderMethod = 'ai-generated';
                  break;
                }
              }
              if (finalTransformedImage) break;
            }
          }

          if (finalTransformedImage) {
            console.log(`Successfully generated transformed image with ${imgModel} on attempt ${attempt + 1}`);
            break modelLoop;
          }
        } catch (err: any) {
          lastImageError = err;
          console.warn(`Model ${imgModel} (attempt ${attempt + 1}) encountered error:`, err?.message || err);

          // If error is permanent (400, 401, 403, 404, invalid key), don't retry this model
          if (!isTemporaryError(err)) {
            console.warn(`Non-retryable error on ${imgModel}:`, err?.message || err);
            break;
          }

          // If we haven't exhausted our retry delays, wait and retry
          if (attempt < retryDelaysMs.length) {
            const waitMs = retryDelaysMs[attempt];
            console.log(`Temporary error on ${imgModel}. Waiting ${waitMs}ms before attempt ${attempt + 2}...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
          } else {
            console.warn(`Exhausted retries on ${imgModel}, checking fallback model...`);
          }
        }
      }
    }

    // Step C: Strict validation - do NOT fall back to SVG, cached assets, or original image
    if (!finalTransformedImage || finalTransformedImage.length < 50) {
      console.error('All image-generation attempts failed:', lastImageError?.message || lastImageError);
      res.status(503).json({
        error: "Image transformation is temporarily unavailable. Gemini's image service is busy. Please try again in a few seconds.",
      });
      return;
    }

    const transformationResult = {
      id: 'trans_' + Date.now() + '_v' + targetVersion,
      timestamp: Date.now(),
      userRequest,
      version: targetVersion,
      variationDirection: activeVariationName,
      plan: parsedData.plan,
      whatChanged: parsedData.whatChanged || [],
      why: parsedData.why || 'Optimized for spatial balance, visual calm, and functionality.',
      transformedImage: finalTransformedImage,
      renderMethod,
      safetyNotice: parsedData.safetyNotice || parsedData.plan?.safetyAndRealismNotes,
      preservedElements: parsedData.plan?.preservedElements || [],
      suggestedFollowUps: parsedData.suggestedFollowUps || [
        'Make it more minimal',
        'Group small items onto a tray',
        'Add a decorative indoor plant',
      ],
      disclaimer:
        'LifeLens AI Vision → Transform provides conceptual visual rearrangements. Verify physical safety, wall anchor loads, and cable clearances before physically moving heavy furniture or electrical appliances.',
    };

    res.json(transformationResult);
  } catch (err: any) {
    console.error('Error during transformation:', err);
    res.status(503).json({
      error: "Image transformation is temporarily unavailable. Gemini's image service is busy. Please try again in a few seconds.",
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
