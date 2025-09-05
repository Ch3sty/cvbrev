// src/lib/openai/cv-parser-ai.ts
// Client-side wrapper för AI-driven CV parsing via server-side API

import type { CVMetadata } from '@/lib/cv/cv-metadata';

// Interface för AI-parsning resultat med metadata
export interface AIParseResult {
  cvData: CVMetadata;
  metadata: {
    model: string;
    tokens: {
      prompt: number;
      completion: number;
      total: number;
    } | null;
    cost: number | null;
    processingTime: number; // millisekunder
    detectedIndustry?: string;
    confidenceScore?: number; // 0-100
  };
}

// Förbättrad CV-extraktion med branschdetektering
interface EnhancedCVData extends CVMetadata {
  detectedIndustry: string;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'executive';
  keyStrengths: string[];
  quantifiableAchievements: Array<{
    metric: string;
    value: string;
    context: string;
  }>;
}

/**
 * Client-side wrapper för AI-driven CV parsing
 * Anropar server-side API för säker hantering av OpenAI-anrop
 */
export async function parseCVWithAI(cvText: string): Promise<AIParseResult> {
  if (!cvText || typeof cvText !== 'string') {
    throw new Error('CV text is required');
  }

  try {
    const response = await fetch('/api/cv/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cvText }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: AIParseResult = await response.json();
    return result;

  } catch (error: any) {
    console.error('Client-side CV parsing error:', error);
    
    // Fallback till grundläggande extraktion vid API-fel
    const fallbackData: CVMetadata = {
      personalInfo: extractBasicPersonalInfo(cvText),
      summary: 'CV-innehåll kunde inte parsas automatiskt.',
      experience: [],
      education: [],
      skills: [{ category: 'Extraherade färdigheter', skills: [] }],
      projects: [],
      certifications: [],
      languages: [],
      interests: [],
      references: 'Referenser lämnas på begäran'
    };

    return {
      cvData: fallbackData,
      metadata: {
        model: 'fallback',
        tokens: null,
        cost: null,
        processingTime: 0,
        confidenceScore: 0
      }
    };
  }
}

/**
 * Enkel fallback-extraktion för grundläggande personlig info
 */
function extractBasicPersonalInfo(rawText: string) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+46|0)[\s-]?[\d\s-]{8,}/;
  
  const lines = rawText.split('\n').filter(line => line.trim());
  const email = rawText.match(emailRegex)?.[0] || '';
  const phone = rawText.match(phoneRegex)?.[0] || '';
  
  // Hitta namn (första raden med minst 2 ord, ingen email, inte bara siffror)
  const nameCandidate = lines.find(line => 
    line.trim().length > 5 && 
    !line.includes('@') && 
    !line.match(/^\d/) &&
    line.split(' ').length >= 2
  ) || '';

  return {
    fullName: nameCandidate,
    email,
    phone: phone?.replace(/\s/g, ''),
    address: '',
    linkedIn: '',
    website: '',
    github: ''
  };
}

/**
 * Hjälpfunktion för att validera och säkerställa komplett CV-data
 */
export function validateCVData(cvData: CVMetadata): CVMetadata {
  return {
    personalInfo: {
      fullName: cvData.personalInfo?.fullName || 'Namn saknas',
      email: cvData.personalInfo?.email || '',
      phone: cvData.personalInfo?.phone || '',
      address: cvData.personalInfo?.address || '',
      linkedIn: cvData.personalInfo?.linkedIn || '',
      website: cvData.personalInfo?.website || '',
      github: cvData.personalInfo?.github || ''
    },
    summary: cvData.summary || 'Professionell bakgrund finns tillgänglig.',
    experience: cvData.experience || [],
    education: cvData.education || [],
    skills: cvData.skills || [{ category: 'Färdigheter', skills: ['Finns specificerade i CV'] }],
    projects: cvData.projects || [],
    certifications: cvData.certifications || [],
    languages: cvData.languages || [],
    interests: cvData.interests || [],
    references: cvData.references || 'Referenser lämnas på begäran'
  };
}