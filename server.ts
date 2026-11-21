import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simple in-memory LRU cache to make repeat lookups instantaneous
const guideCache = new Map<string, unknown>();
const vehicleSpecCache = new Map<string, unknown>();

function setCache(cache: Map<string, unknown>, key: string, value: unknown) {
  if (cache.size >= 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
  cache.set(key, value);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: unknown }).status)
          : 0;
      // Do not retry 400/401/403/404 client/auth errors
      if (status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const rawStatus =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: unknown }).status)
      : 500;

  if (msg.includes('GEMINI_API_KEY is not configured')) {
    return {
      status: 500,
      message:
        'Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (rawStatus === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: rawStatus || 403,
      message:
        'API key permission denied or invalid. Please check your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (rawStatus === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Rate limit reached on the repair lookup service. Please wait a moment and try again.',
    };
  }
  return {
    status: rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500,
    message: msg || 'Failed to retrieve repair data.',
  };
}

const repairGuideSchema = {
  type: Type.OBJECT,
  properties: {
    repairTitle: {
      type: Type.STRING,
      description: 'Standardized automotive repair title.',
    },
    systemCategory: {
      type: Type.STRING,
      description: 'Automotive system category (e.g., Brakes & Hydraulics, Engine & Valvetrain).',
    },
    vehicleLabel: {
      type: Type.STRING,
      description: 'Full vehicle description including year, make, model, and engine.',
    },
    bookLaborHours: {
      type: Type.NUMBER,
      description:
        'Standard industry flat-rate book labor hours (e.g., 1.8, 2.5, 0.8) matching Mitchell/ALLDATA standards for this specific vehicle and engine.',
    },
    laborRangeHours: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.NUMBER },
        max: { type: Type.NUMBER },
      },
      required: ['min', 'max'],
      description: 'Realistic labor hour range accounting for ideal vs corroded/field conditions.',
    },
    difficulty: {
      type: Type.STRING,
      description: 'Must be one of: Routine, Moderate, Advanced, Master Tech.',
    },
    mobileFeasibility: {
      type: Type.STRING,
      description:
        'Must be one of: Ideal Mobile Job, Driveway Ready (Jack Stands), Shop Lift Recommended.',
    },
    mobileFeasibilityNote: {
      type: Type.STRING,
      description: 'Practical 1-2 sentence field note on doing this repair on-site as a mobile mechanic.',
    },
    fluidCapacities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Relevant fluid types and capacities if applicable (e.g., Coolant capacity, Oil spec). Empty array if none.',
    },
    safetyWarnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Critical safety warnings specific to this vehicle and repair (jack stands, high voltage, pressurized fuel/coolant, etc.).',
    },
    toolsRequired: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific socket sizes, specialty tools, torque wrenches, and scan tools needed.',
    },
    partsRequired: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          qty: { type: Type.STRING },
          estimatedPriceRange: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
        required: ['name', 'qty', 'estimatedPriceRange', 'notes'],
      },
      description: 'Parts, gaskets, fasteners (e.g., torque-to-yield bolts), and fluids required.',
    },
    torqueSpecs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fastener: { type: Type.STRING },
          spec: { type: Type.STRING },
        },
        required: ['fastener', 'spec'],
      },
      description: 'Exact factory fastener torque specifications in ft-lbs / in-lbs / Nm.',
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          torqueSpec: { type: Type.STRING },
          proTip: { type: Type.STRING },
        },
        required: ['stepNumber', 'title', 'instruction'],
      },
      description: 'Detailed, sequential, technician-grade step-by-step repair instructions specific to this exact vehicle and engine.',
    },
  },
  required: [
    'repairTitle',
    'systemCategory',
    'vehicleLabel',
    'bookLaborHours',
    'laborRangeHours',
    'difficulty',
    'mobileFeasibility',
    'mobileFeasibilityNote',
    'safetyWarnings',
    'toolsRequired',
    'partsRequired',
    'torqueSpecs',
    'steps',
  ],
};

const vehicleOptionsSchema = {
  type: Type.OBJECT,
  properties: {
    engines: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Factory engine options offered on this exact Year, Make, and Model.',
    },
    drivetrains: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Drivetrains offered (FWD, RWD, AWD, 4WD).',
    },
    transmissions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Transmissions offered (Automatic, Manual, CVT, Dual-Clutch (DCT), EV Single-Speed).',
    },
    trims: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Common factory trim levels.',
    },
  },
  required: ['engines', 'drivetrains', 'transmissions', 'trims'],
};

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/repair-guide', async (req, res) => {
    try {
      const {
        year,
        make,
        model,
        engine,
        drivetrain,
        transmission,
        trim,
        repairQuery,
        systemCategory,
      } = req.body ?? {};

      if (!year || !make || !model || !engine || !repairQuery) {
        res.status(400).json({
          error: 'Vehicle year, make, model, engine, and repair description are required.',
        });
        return;
      }

      const cacheKey = [
        year,
        make,
        model,
        engine,
        drivetrain || '',
        transmission || '',
        trim || '',
        repairQuery,
      ]
        .join('|')
        .toLowerCase();

      const cached = guideCache.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const ai = getAiClient();
      const vehicleDesc = `${year} ${make} ${model}${trim ? ` ${trim}` : ''} — ${engine}${drivetrain ? `, ${drivetrain}` : ''}${transmission ? `, ${transmission}` : ''}`;

      const prompt = `Provide an accurate, master-technician-grade flat-rate labor estimate and complete step-by-step repair procedure for:
Vehicle: ${vehicleDesc}
Requested Repair: ${repairQuery}
${systemCategory ? `System Category Hint: ${systemCategory}` : ''}

Requirements:
1. Give realistic Mitchell/ALLDATA flat-rate book labor hours specifically calibrated for THIS exact year, make, model, engine layout, and drivetrain (e.g., transverse V6 rear bank spark plugs take much longer than inline-4; 4WD front hub/oil pan takes longer than RWD; German/European subframes vs domestic trucks).
2. Provide 8 to 14 detailed, actionable step-by-step repair instructions tailored to this exact vehicle's layout (mention actual component access routes—such as wheel well liner removal, cowl removal, subframe drop, bleeding sequence, or relearn/reset procedures where applicable).
3. Include realistic factory torque specs (ft-lbs / Nm), specific metric or SAE socket/tool sizes, required parts & one-time-use fasteners, and practical mobile-mechanic field notes (whether it's driveway-safe on jack stands or requires a shop lift/AC recovery machine).
4. Ensure difficulty is exactly one of: "Routine", "Moderate", "Advanced", "Master Tech".
5. Ensure mobileFeasibility is exactly one of: "Ideal Mobile Job", "Driveway Ready (Jack Stands)", "Shop Lift Recommended".`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are an ASE Master Automobile Technician and Flat-Rate Labor Estimator. Always return accurate, practical, safety-first repair procedures, torque specs, and realistic flat-rate book times in strict JSON format.',
            responseMimeType: 'application/json',
            responseSchema: repairGuideSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const result = {
        ...parsed,
        generatedAt: new Date().toISOString(),
      };

      setCache(guideCache, cacheKey, result);
      res.json(result);
    } catch (err: unknown) {
      const { status, message } = formatGeminiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/vehicle-options', async (req, res) => {
    try {
      const { year, make, model } = req.body ?? {};
      if (!year || !make || !model) {
        res.status(400).json({ error: 'Year, make, and model are required.' });
        return;
      }

      const cacheKey = `${year}|${make}|${model}`.toLowerCase();
      const cached = vehicleSpecCache.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const ai = getAiClient();
      const prompt = `List the exact factory engine sizes (e.g., "2.5L I4", "3.5L V6 EcoBoost"), drivetrains ("FWD", "RWD", "AWD", "4WD"), transmission types ("Automatic", "Manual", "CVT", "Dual-Clutch (DCT)", "EV Single-Speed"), and main trims for a ${year} ${make} ${model}.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are an automotive VIN & vehicle specification database. Return accurate factory powertrain configurations for the requested year, make, and model.',
            responseMimeType: 'application/json',
            responseSchema: vehicleOptionsSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      setCache(vehicleSpecCache, cacheKey, parsed);
      res.json(parsed);
    } catch (err: unknown) {
      const { status, message } = formatGeminiError(err);
      res.status(status).json({ error: message });
    }
  });

  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`WrenchBook server running on http://localhost:${PORT}`);
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    let viteMiddleware: express.RequestHandler | null = null;
    const vitePromise = (async () => {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr:
            process.env.DISABLE_HMR === 'true'
              ? false
              : { server: httpServer },
        },
        appType: 'spa',
      });
      viteMiddleware = vite.middlewares;
      return vite.middlewares;
    })();

    app.use(async (req, res, next) => {
      try {
        const mw = viteMiddleware ?? (await vitePromise);
        return mw(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
}

createApp();
