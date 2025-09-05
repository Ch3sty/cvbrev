// src/lib/openai/cv-parser-ai.ts
// AI-driven CV parsing för intelligent strukturering av CV-innehåll

import { openai, calculateOpenAICost } from './api';
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
 * AI-driven CV parsing som ersätter enkel regex-baserad parsing
 * Använder strukturerad JSON-extraktion för maximal noggrannhet
 */
export async function parseCVWithAI(cvText: string): Promise<AIParseResult> {
  const startTime = Date.now();
  
  // Begränsa input för att hålla kostnader nere
  const truncatedCV = cvText.substring(0, 8000);
  const modelToUse = "gpt-4o"; // Balans mellan kvalitet och kostnad

  const systemPrompt = `
Du är en expert på CV-analys och dataextraktion. Din uppgift är att analysera svenska CV:n och extrahera strukturerad information med hög noggrannhet.

Analysera CV:t och returnera ALLTID data i exakt detta JSON-format:

{
  "personalInfo": {
    "fullName": "Fullständigt namn från CV:t",
    "email": "E-postadress",
    "phone": "Telefonnummer (formaterat som +46... eller 07...)",
    "address": "Adress/ort om tillgänglig",
    "linkedIn": "LinkedIn URL om den finns",
    "website": "Personlig webbsida om den finns",
    "github": "GitHub URL om den finns"
  },
  "summary": "En kort sammanfattning av personens professionella profil baserat på CV:t (2-3 meningar)",
  "experience": [
    {
      "position": "Jobbtitel/position",
      "company": "Företagsnamn",
      "location": "Plats/ort om tillgänglig",
      "startDate": "YYYY-MM-DD format, gissa om bara år anges",
      "endDate": "YYYY-MM-DD eller null för nuvarande jobb",
      "description": ["Lista med arbetsuppgifter och ansvarsområden"],
      "achievements": ["Lista med kvantifierbara prestationer som ökat försäljning med X%, lett team på Y personer, etc"]
    }
  ],
  "education": [
    {
      "degree": "Examen/utbildning",
      "institution": "Skola/universitet",
      "location": "Plats om tillgänglig",
      "graduationYear": "YYYY format",
      "field": "Ämnesområde/inriktning",
      "honors": ["Utmärkelser eller betyg om angivet"]
    }
  ],
  "skills": [
    {
      "category": "Tekniska färdigheter",
      "skills": ["Lista med tekniska kompetenser"]
    },
    {
      "category": "Mjuka färdigheter", 
      "skills": ["Lista med sociala/personliga färdigheter"]
    },
    {
      "category": "Språk",
      "skills": ["Svenska (modersmål)", "Engelska (flyt)", etc]
    }
  ],
  "projects": [
    {
      "name": "Projektnamn",
      "description": "Kort beskrivning",
      "technologies": ["Tekniker som användes"],
      "achievements": ["Resultat eller påverkan"]
    }
  ],
  "certifications": [
    {
      "name": "Certifikatnamn",
      "issuer": "Utfärdande organisation",
      "date": "YYYY-MM-DD",
      "expiryDate": "YYYY-MM-DD eller null"
    }
  ],
  "languages": [
    {
      "name": "Språknamn",
      "level": "Nivå (modersmål/flyt/grundläggande/etc)"
    }
  ],
  "interests": ["Lista med intressen och hobbyer"],
  "references": "Text om referenser (t.ex. 'Lämnas på begäran')",
  "metadata": {
    "detectedIndustry": "Bransch baserat på erfarenhet (Tech, Finance, Healthcare, etc)",
    "experienceLevel": "junior/mid/senior/executive baserat på år och roller",
    "keyStrengths": ["3-5 identifierade huvudstyrkor"],
    "confidenceScore": "0-100 baserat på hur komplett/tydligt CV:t är"
  }
}

VIKTIGA INSTRUKTIONER:
- Extrahera ALL tillgänglig information, även om vissa fält blir tomma
- Gissa rimliga datum om bara år anges (använd 01-01 för startdatum, 12-31 för slutdatum)
- Kategorisera färdigheter intelligent (tekniska vs mjuka)
- Identifiera kvantifierbara prestationer (siffror, procent, belopp)
- Branschanalys baserad på arbetslivserfarenhet och kompetenser
- Om information saknas, använd tom array [] eller tom sträng "", ALDRIG null
- Var noggrann med datumformat: YYYY-MM-DD
`;

  try {
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analysera och extrahera strukturerad data från följande CV:\n\n${truncatedCV}` }
      ],
      temperature: 0.3, // Låg temperatur för konsistent extraktion
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || '{}';
    const parsedData = JSON.parse(content) as EnhancedCVData;

    // Extrahera usage och beräkna kostnad
    const usage = completion.usage;
    let tokensInfo = null;
    let calculatedCost = null;

    if (usage) {
      const promptTokens = usage.prompt_tokens ?? 0;
      const completionTokens = usage.completion_tokens ?? 0;
      tokensInfo = {
        prompt: promptTokens,
        completion: completionTokens,
        total: usage.total_tokens ?? (promptTokens + completionTokens)
      };
      calculatedCost = calculateOpenAICost(modelToUse, promptTokens, completionTokens);
    }

    const processingTime = Date.now() - startTime;

    // Konvertera till CVMetadata format och lägg till extra metadata
    const cvData: CVMetadata = {
      personalInfo: parsedData.personalInfo || {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        website: '',
        github: ''
      },
      summary: parsedData.summary || 'Professionell med bred erfarenhet.',
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      skills: parsedData.skills || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      languages: parsedData.languages || [],
      interests: parsedData.interests || [],
      references: parsedData.references || 'Referenser lämnas på begäran'
    };

    const result: AIParseResult = {
      cvData,
      metadata: {
        model: modelToUse,
        tokens: tokensInfo,
        cost: calculatedCost,
        processingTime,
        detectedIndustry: parsedData.detectedIndustry,
        confidenceScore: undefined // Will be calculated separately if needed
      }
    };

    return result;

  } catch (error: any) {
    console.error('AI CV parsing error:', error);
    
    // Fallback till grundläggande extraktion vid fel
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
        processingTime: Date.now() - startTime,
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