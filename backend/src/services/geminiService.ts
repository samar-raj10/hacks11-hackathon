import { GoogleGenAI } from '@google/genai';

export type NormalizedSymptomResult = {
  symptoms: Array<{
    canonical: string;
    confidence: number;
  }>;
  syndrome: string;
  status: 'NORMALIZED' | 'FALLBACK';
  source: 'GEMINI' | 'RULE_BASED';
};

const canonicalSymptoms = [
  'nausea',
  'vomiting',
  'diarrhea',
  'fever',
  'abdominal pain',
  'headache',
  'weakness',
  'stomach upset',
  'dehydration',
  'body ache',
  'dizziness',
  'loss of appetite',
] as const;

const syndromeMap: Record<string, string> = {
  nausea: 'gastrointestinal',
  vomiting: 'gastrointestinal',
  diarrhea: 'gastrointestinal',
  fever: 'systemic',
  'abdominal pain': 'gastrointestinal',
  headache: 'systemic',
  weakness: 'systemic',
  'stomach upset': 'gastrointestinal',
  dehydration: 'gastrointestinal',
  'body ache': 'systemic',
  dizziness: 'systemic',
  'loss of appetite': 'gastrointestinal',
};

const ALLOWED_CANONICALS = new Set<string>(canonicalSymptoms);

const buildRuleBasedResult = (rawSymptoms: string): NormalizedSymptomResult => {
  const text = rawSymptoms.trim();

  if (!text) {
    return {
      symptoms: [{ canonical: 'other', confidence: 0.2 }],
      syndrome: 'unknown',
      status: 'FALLBACK',
      source: 'RULE_BASED',
    };
  }

  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s,/-]/g, ' ');
  const matched = new Map<string, number>();

  for (const symptom of canonicalSymptoms) {
    if (normalizedText.includes(symptom)) {
      matched.set(symptom, (matched.get(symptom) ?? 0) + 1);
    }
  }

  const phraseAliases: Record<string, string> = {
    'throwing up': 'vomiting',
    'throw up': 'vomiting',
    'loose motions': 'diarrhea',
    'loose stools': 'diarrhea',
    'loose motion': 'diarrhea',
    'stomach hurts': 'abdominal pain',
    'stomach hurt': 'abdominal pain',
    'stomach pain': 'abdominal pain',
    'stomach cramps': 'abdominal pain',
    'cramps': 'abdominal pain',
    'body ache': 'body ache',
    'aches': 'body ache',
    'feeling sick': 'other',
    'unwell': 'other',
  };

  for (const [phrase, canonical] of Object.entries(phraseAliases)) {
    if (normalizedText.includes(phrase)) {
      const validCanonical = ALLOWED_CANONICALS.has(canonical) ? canonical : 'other';
      matched.set(validCanonical, (matched.get(validCanonical) ?? 0) + 1);
    }
  }

  const symptoms = Array.from(matched.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([canonical, count]) => ({
      canonical: canonical === 'other' ? 'other' : canonical,
      confidence: Math.min(0.99, 0.55 + count * 0.12),
    }));

  if (symptoms.length === 0) {
    return {
      symptoms: [{ canonical: 'other', confidence: 0.25 }],
      syndrome: 'unknown',
      status: 'FALLBACK',
      source: 'RULE_BASED',
    };
  }

  const syndrome = symptoms
    .filter((item) => item.canonical !== 'other')
    .map((item) => syndromeMap[item.canonical] ?? 'unknown')[0] ?? 'unknown';

  return {
    symptoms,
    syndrome,
    status: 'FALLBACK',
    source: 'RULE_BASED',
  };
};

const extractGeminiText = (payload: unknown): string | null => {
  if (typeof payload === 'string') return payload;
  if (!payload || typeof payload !== 'object') return null;

  if ('text' in payload && typeof (payload as { text?: unknown }).text === 'string') {
    return (payload as { text: string }).text;
  }

  if ('output' in payload && typeof (payload as { output?: unknown }).output === 'string') {
    return (payload as { output: string }).output;
  }

  if ('candidates' in payload && Array.isArray((payload as { candidates?: unknown[] }).candidates)) {
    for (const candidate of (payload as { candidates: unknown[] }).candidates) {
      const text = extractGeminiText(candidate);
      if (text) return text;
    }
  }

  if ('content' in payload && payload && typeof payload === 'object' && 'parts' in payload) {
    const parts = (payload as { content?: { parts?: unknown[] } }).content?.parts;
    if (Array.isArray(parts)) {
      for (const part of parts) {
        const text = extractGeminiText(part);
        if (text) return text;
      }
    }
  }

  return null;
};

const sanitizeGeminiResult = (data: any): NormalizedSymptomResult => {
  const symptoms = Array.isArray(data?.symptoms) ? data.symptoms : [];
  const normalizedSymptoms = symptoms
    .filter((item: any) => item && typeof item.canonical === 'string')
    .map((item: any) => {
      const canonical = ALLOWED_CANONICALS.has(item.canonical) ? item.canonical : 'other';
      const confidence = typeof item.confidence === 'number' ? Math.min(1, Math.max(0, item.confidence)) : 0.4;
      return { canonical, confidence };
    })
    .slice(0, 5);

  const syndrome = typeof data?.syndrome === 'string' && data.syndrome.trim() ? data.syndrome.trim() : 'unknown';

  return {
    symptoms: normalizedSymptoms.length > 0 ? normalizedSymptoms : [{ canonical: 'other', confidence: 0.25 }],
    syndrome: syndrome === 'gastrointestinal' || syndrome === 'systemic' ? syndrome : 'unknown',
    status: 'NORMALIZED',
    source: 'GEMINI',
  };
};

const tryGeminiNormalization = async (rawSymptoms: string): Promise<NormalizedSymptomResult | null> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.0-flash';
    const prompt = [
      'You are a symptom extraction engine only.',
      'Normalize the student report to the canonical symptom categories exactly: nausea, vomiting, diarrhea, fever, abdominal pain, headache, weakness, stomach upset, dehydration, body ache, dizziness, loss of appetite.',
      'Return strict JSON only with this schema: {"symptoms":[{"canonical":"...","confidence":0.0-1.0}],"syndrome":"gastrointestinal|systemic|unknown"}.',
      'Do not diagnose disease, outbreak, contamination, or causation. If no allowed symptom matches, use "other" with low confidence.',
      'Student report: ' + rawSymptoms,
    ].join('\n');

    const result = await Promise.race([
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          topP: 0.8,
          responseMimeType: 'application/json',
          maxOutputTokens: 200,
        },
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini request timed out')), 15000);
      }),
    ]);

    const rawText = extractGeminiText(result);
    if (!rawText) throw new Error('No text returned by Gemini');

    const jsonText = rawText.trim();
    const parsed = JSON.parse(jsonText);
    return sanitizeGeminiResult(parsed);
  } catch {
    return null;
  }
};

export async function normalizeSymptomsText(rawSymptoms: string): Promise<NormalizedSymptomResult> {
  const text = rawSymptoms?.trim() ?? '';

  if (!text) {
    return buildRuleBasedResult(text);
  }

  try {
    const geminiResult = await tryGeminiNormalization(text);
    if (geminiResult) {
      return geminiResult;
    }
  } catch {
    // Fallback handled below.
  }

  return buildRuleBasedResult(text);
}
