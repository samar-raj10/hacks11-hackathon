import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    public models = { generateContent: mockGenerateContent };
  }

  return { GoogleGenAI: MockGoogleGenAI };
});

import { normalizeSymptomsText } from './geminiService.js';

describe('normalizeSymptomsText', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it('uses Gemini normalization when the API key and response are valid', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        symptoms: [
          { canonical: 'vomiting', confidence: 0.95 },
          { canonical: 'diarrhea', confidence: 0.94 },
          { canonical: 'abdominal pain', confidence: 0.91 },
        ],
        syndrome: 'gastrointestinal',
      }),
    });

    for (const input of [
      'throwing up and loose motions',
      'stomach cramps and nausea',
      'fever and weakness',
      "I've been feeling sick and my stomach hurts",
    ]) {
      const result = await normalizeSymptomsText(input);

      expect(result.status).toBe('NORMALIZED');
      expect(result.source).toBe('GEMINI');
      expect(result.symptoms.length).toBeGreaterThan(0);
    }
  });

  it('falls back to rule-based logic when GEMINI_API_KEY is missing', async () => {
    const result = await normalizeSymptomsText('stomach cramps and nausea');

    expect(result.status).toBe('FALLBACK');
    expect(result.source).toBe('RULE_BASED');
    expect(result.symptoms.some((symptom) => symptom.canonical === 'nausea')).toBe(true);
  });

  it('falls back when Gemini returns invalid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    mockGenerateContent.mockResolvedValue({
      text: 'this is not valid JSON',
    });

    const result = await normalizeSymptomsText('fever and weakness');

    expect(result.status).toBe('FALLBACK');
    expect(result.source).toBe('RULE_BASED');
    expect(result.symptoms.some((symptom) => symptom.canonical === 'fever')).toBe(true);
  });

  it('handles empty and unknown symptoms safely', async () => {
    const emptyResult = await normalizeSymptomsText('');
    expect(emptyResult.status).toBe('FALLBACK');
    expect(emptyResult.source).toBe('RULE_BASED');

    const unknownResult = await normalizeSymptomsText('I feel generally unwell and tired');
    expect(unknownResult.status).toBe('FALLBACK');
    expect(unknownResult.source).toBe('RULE_BASED');
    expect(unknownResult.symptoms.some((symptom) => symptom.canonical === 'other')).toBe(true);
  });
});
