// src/lib/gemini/client.ts - Delad Gemini-klient (singleton) + gemensamma safety settings
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, type SafetySetting } from '@google/genai';

// Lat initiering: SDK-konstruktorn kastar om API-nyckeln saknas, vilket annars
// fäller hela Next.js-bygget vid modulladdning (t.ex. lokalt utan env-variabeln).
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY är inte konfigurerad');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export const gemini: GoogleGenAI = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const instance = getClient();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// CV- och jobbannonsinnehåll (vård, säkerhet, "Heta Arbeten" m.m.) kan trippa
// default-trösklarna - blockera därför endast på hög sannolikhet.
export const DEFAULT_SAFETY_SETTINGS: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];
