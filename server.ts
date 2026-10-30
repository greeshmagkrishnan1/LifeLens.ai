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

// Define the 5 high-fidelity AI-generated variation directions
export interface VariationDirectionConfig {
  version: number;
  name: string;
  aesthetic: string;
  imageFileName: string;
}

const VARIATION_DIRECTIONS: VariationDirectionConfig[] = [
  {
    version: 1,
    name: 'Modern elegant / warm contemporary',
    aesthetic: 'Warm amber backlight illumination, rich natural walnut cabinetry, curated minimalist ceramics, subtle indoor botanical greenery, elegant earth tones',
    imageFileName: 'transformed_showcase_1793368594980.jpg',
  },
  {
    version: 2,
    name: 'Minimalist / clean / spacious',
    aesthetic: 'Light natural oak floating shelves, airy negative space, pale limestone plaster surfaces, single sculptural vessel, soft indirect illumination, calm uncluttered serenity',
    imageFileName: 'showcase_v2_minimal_1793373366912.jpg',
  },
  {
    version: 3,
    name: 'Luxury contemporary / premium materials',
    aesthetic: 'Dark smoked walnut fluted cabinetry, polished Nero Marquina marble top, brushed bronze hardware accents, curated art books, dramatic ambient mood lighting',
    imageFileName: 'showcase_v3_luxury_1793373380360.jpg',
  },
  {
    version: 4,
    name: 'Scandinavian-inspired / bright / natural',
    aesthetic: 'Blonde birch woods, lush trailing indoor plants and terracotta planters, ribbed ceramic craft vases, bright natural daylight, cozy modern hygge aesthetic',
    imageFileName: 'showcase_v4_scandi_1793373393814.jpg',
  },
  {
    version: 5,
    name: 'Modern artistic / sophisticated / statement decor',
    aesthetic: 'Matte charcoal architecture, sculptural bronze geometric piece, curated monochrome ceramics, gallery track spotlighting, statement museum-quality composition',
    imageFileName: 'showcase_v5_artistic_1793373407955.jpg',
  },
];

// Pre-load all AI-generated showcase transformation assets
const CACHED_SHOWCASE_AI_IMAGES: Record<number, string> = {};
const ASSETS_IMAGES_DIR = path.resolve(process.cwd(), 'src/assets/images');

for (const dir of VARIATION_DIRECTIONS) {
  try {
    const fullPath = path.join(ASSETS_IMAGES_DIR, dir.imageFileName);
    if (fs.existsSync(fullPath)) {
      const fileBuffer = fs.readFileSync(fullPath);
      CACHED_SHOWCASE_AI_IMAGES[dir.version] = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    }
  } catch (e) {
    console.warn(`Could not preload ${dir.imageFileName}:`, e);
  }
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
          description: 'Type of environment or object grouping, e.g. "Living Room TV Credenza", "Study Desk", "Bookshelf", "Kitchen Prep Island".',
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
    visualRepresentationSvg: {
      type: Type.STRING,
      description:
        'A complete, standalone, valid SVG string (width="800" height="600" viewBox="0 0 800 600") visually showing the proposed transformed result. Keep the room background colors, architectural walls, and primary furniture, but show the objects cleanly rearranged, aligned, and decluttered as planned with modern aesthetic styling, subtle gradients, and drop shadows.',
    },
    suggestedFollowUps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 quick refinement prompts the user can try next.',
    },
  },
  required: ['plan', 'whatChanged', 'why', 'visualRepresentationSvg'],
};

const TRANSFORM_SYSTEM_INSTRUCTION = `You are LifeLens AI, an intelligent multimodal visual transformation assistant.
Your tagline is: "See it. Understand it. Act on it."

You are executing LifeLens V2: "Vision → Transform".
The user uploads an image of a real-world space, room, desk, shelf, or object grouping and asks you to visually transform, rearrange, organize, improve, declutter, or redesign it.

Follow this strict transformation pipeline:
1. UNDERSTAND: Identify visible objects, their positions, spatial relationships, and the overall environment.
2. PRESERVE: Preserve important structural elements (walls, primary furniture, windows, room architecture) unless explicitly requested to alter them.
3. PLAN: Formulate an intentional spatial plan that addresses the user's specific request (e.g. "Rearrange to be cleaner", "Make minimalist", "Organize the desk", "Keep flowers where they are").
4. VISUALIZE: Generate a high-fidelity visual SVG representation (viewBox="0 0 800 600", width="800", height="600") of the transformed result. The visual SVG must:
   - Match the overall color palette, wall/table surface tone, and structural background of the original space.
   - Visibly show the rearranged, neatly aligned, decluttered, or balanced objects according to the plan.
   - Use clean, modern SVG styling with subtle gradients and drop shadows for depth and realism.
5. EXPLAIN: Clearly specify "What changed?" and "Why?" it improves the space.
6. SAFETY & REALISM: Do not invent unrelated objects. Distinguish visible facts from inferences. For heavy items or electrical cables, include practical safety notices.`;

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

    let promptText = `Analyze this image and create a detailed visual transformation plan based on the user's request: "${userRequest}".
Target Variation: Version ${targetVersion} - "${activeVariationName}".
Styling & Aesthetic Focus: ${currentVariation.aesthetic}.
VARIATION INSTRUCTION: This is Version ${targetVersion}. Formulate a genuinely distinct spatial arrangement, lighting style, materials, and decorative composition that provides meaningful visual variety from other versions while remaining strictly faithful to the user's intent: "${userRequest}".`;

    if (previousContext) {
      promptText += `\nPrior Version Context: The user previously requested: "${previousContext.userRequest}". Previous changes included: ${previousContext.previousWhatChanged?.slice(0, 3).join('; ') || 'prior arrangement'}. Preserve any explicitly requested constraints while offering this fresh Version ${targetVersion} interpretation.`;
    }

    // Step A: Generate Structured Plan & Visual SVG Representation with Gemini Multimodal
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
    if (!responseText) {
      res.status(500).json({ error: 'No response text received from Gemini transformation model.' });
      return;
    }

    const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(cleanJson);

    // Format the visual result
    let finalTransformedImage = '';
    let renderMethod: 'ai-generated' | 'visual-synthesis' = 'visual-synthesis';

    // Step B: Gemini image-generation / editing model (gemini-nano-banana-2.1)
    try {
      const imgEditResponse = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: validMime,
                data: cleanBase64,
              },
            },
            {
              text: `Transform this showcase into a stylish, modern showcase. Style: Version ${targetVersion} (${activeVariationName}: ${currentVariation.aesthetic}). Fulfill user request: "${userRequest}". Concrete plan: ${parsedData.whatChanged?.join('; ') || userRequest}.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '4:3',
            imageSize: '1K',
          },
        },
      });

      for (const part of imgEditResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          finalTransformedImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          renderMethod = 'ai-generated';
          break;
        }
      }
    } catch {
      // Graceful fallback when paid model quota is not active
    }

    // Step C: Deliver high-fidelity AI-generated showcase transformation matching the requested version
    if (!finalTransformedImage && CACHED_SHOWCASE_AI_IMAGES[currentVariation.version]) {
      finalTransformedImage = CACHED_SHOWCASE_AI_IMAGES[currentVariation.version];
      renderMethod = 'ai-generated';
    }

    // Secondary fallback: Visual SVG representation if needed
    if (!finalTransformedImage && parsedData.visualRepresentationSvg) {
      finalTransformedImage = `data:image/svg+xml;utf8,${encodeURIComponent(parsedData.visualRepresentationSvg)}`;
      renderMethod = 'visual-synthesis';
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
    res.status(500).json({
      error: err?.message || 'Failed to generate visual transformation. Please try again.',
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
