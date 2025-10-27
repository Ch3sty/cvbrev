// src/app/api/cv/parse/route.ts
// Server-side CV parsing API för att säkert hantera OpenAI-anrop

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { openai, calculateOpenAICost } from '@/lib/openai/api';
import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { calculateCostFromDatabase } from '@/lib/openai/pricing-sync';
import { trackAIUsage, AI_FEATURES } from '@/lib/ai-cost-tracker';
import { logUserActivity } from '@/lib/activity-logger';

// Interface för AI-parsning resultat med metadata (samma som cv-parser-ai.ts)
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
 * Server-side CV parsing med OpenAI för säker API-nyckel hantering
 */
export async function POST(request: NextRequest) {
  try {
    // Autentisering - samma mönster som andra AI API routes
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log activity: CV parsing started
    await logUserActivity(
      session.user.id,
      'cv_parsing_started',
      'Användare startade CV-parsing',
      {}
    );

    // Extrahera CV-text från request
    const { cvText } = await request.json();

    if (!cvText || typeof cvText !== 'string') {
      return NextResponse.json({
        error: 'CV text is required'
      }, { status: 400 });
    }

    // Utför AI-parsing (flyttad från cv-parser-ai.ts)
    const result = await parseCVWithAIServerSide(cvText, supabase, session.user.id);

    // Log activity: CV parsing completed
    await logUserActivity(
      session.user.id,
      'cv_parsing_completed',
      'CV-parsing slutfördes framgångsrikt',
      {
        model: result.metadata.model,
        processing_time_ms: result.metadata.processingTime,
        confidence_score: result.metadata.confidenceScore
      }
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('CV parsing API error:', error);

    // Try to log failed activity
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient({ cookies: cookieStore });
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await logUserActivity(
          session.user.id,
          'cv_parsing_failed',
          'CV-parsing misslyckades',
          { error: error.message }
        );
      }
    } catch (logError) {
      console.error('Failed to log error activity:', logError);
    }

    return NextResponse.json({
      error: 'Failed to parse CV',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Server-side CV parsing funktion (exporterad för intern användning)
 */
export async function parseCVWithAIServerSide(
  cvText: string,
  supabase?: any,
  userId?: string
): Promise<AIParseResult> {
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
    "github": "GitHub URL om den finns",
    "title": "Professionell titel/roll (t.ex. 'Senior Utvecklare', 'Projektledare')"
  },
  "summary": "En kort professionell sammanfattning skriven i FÖRSTA PERSON (jag/min/mitt) baserat på CV:t (2-3 meningar). Undvik tredje person som 'Christian är...' - skriv istället 'Jag är...' eller liknande",
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
      "language": "Språknamn",
      "proficiency": "Modersmål/Flyt/Konversation/Grundläggande"
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
- Extrahera ALL tillgänglig information från CV:t
- ALDRIG använd generisk placeholder-text som "PROFESSIONELL KANDIDAT" - extrahera verklig titel från CV:t eller lämna tomt
- Om information saknas helt, använd tom array [] eller tom sträng "", ALDRIG hardkodad text
- Gissa rimliga datum om bara år anges (använd 01-01 för startdatum, 12-31 för slutdatum)
- Kategorisera färdigheter intelligent (tekniska vs mjuka)
- Identifiera kvantifierbara prestationer (siffror, procent, belopp)
- Branschanalys baserad på arbetslivserfarenhet och kompetenser
- Var noggrann med datumformat: YYYY-MM-DD
- Använd 'language' och 'proficiency' för språk, inte 'name' och 'level'
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

      // Track AI usage if supabase and userId are provided
      if (supabase && userId) {
        try {
          const costUsd = await calculateCostFromDatabase(
            supabase,
            modelToUse,
            promptTokens,
            completionTokens
          );

          const processingTimeMs = Date.now() - startTime;

          await trackAIUsage({
            supabase,
            userId,
            featureName: AI_FEATURES.CV_PARSING,
            endpoint: '/api/cv/parse',
            model: modelToUse,
            promptTokens,
            completionTokens,
            costUsd,
            generationTimeMs: processingTimeMs,
            metadata: {
              cv_length: cvText.length,
              truncated: cvText.length > 8000
            }
          });

          console.log('[CV Parse] AI usage tracked:', {
            totalTokens: promptTokens + completionTokens,
            costUsd: costUsd.toFixed(6),
            processingTimeMs
          });
        } catch (trackingError) {
          console.error('[CV Parse] Failed to track AI usage:', trackingError);
        }
      }
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
        github: '',
        title: ''
      },
      summary: parsedData.summary || '',
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
        confidenceScore: (parsedData as any).metadata?.confidenceScore
      }
    };

    return result;

  } catch (error: any) {
    console.error('AI CV parsing error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data
    });
    
    // Förbättrad fallback med mer användbar extraktion
    const fallbackData: CVMetadata = {
      personalInfo: extractBasicPersonalInfo(cvText),
      summary: extractBasicSummary(cvText),
      experience: extractBasicExperience(cvText),
      education: extractBasicEducation(cvText),
      skills: extractBasicSkills(cvText),
      projects: [],
      certifications: [],
      languages: extractBasicLanguages(cvText),
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
        confidenceScore: 30, // Låg men inte noll för fallback
        detectedIndustry: 'Okänd'
      }
    };
  }
}

/**
 * Förbättrad fallback-extraktion för grundläggande personlig info
 */
export function extractBasicPersonalInfo(rawText: string) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+46|0)[\s-]?[\d\s-]{8,}/;
  const linkedInRegex = /linkedin\.com\/in\/[\w-]+/i;
  const githubRegex = /github\.com\/[\w-]+/i;
  
  const lines = rawText.split('\n').filter(line => line.trim());
  const email = rawText.match(emailRegex)?.[0] || '';
  const phone = rawText.match(phoneRegex)?.[0] || '';
  const linkedIn = rawText.match(linkedInRegex)?.[0] || '';
  const github = rawText.match(githubRegex)?.[0] || '';
  
  // Hitta namn (första raden med minst 2 ord, ingen email, inte bara siffror)
  const nameCandidate = lines.find(line => 
    line.trim().length > 5 && 
    !line.includes('@') && 
    !line.match(/^\d/) &&
    line.split(' ').length >= 2 &&
    !line.toLowerCase().includes('curriculum') &&
    !line.toLowerCase().includes('vitae')
  ) || '';

  return {
    fullName: nameCandidate,
    email,
    phone: phone?.replace(/\s/g, ''),
    address: '',
    linkedIn: linkedIn ? `https://${linkedIn}` : '',
    website: '',
    github: github ? `https://${github}` : ''
  };
}

/**
 * Extrahera grundläggande sammanfattning från CV-text
 */
export function extractBasicSummary(rawText: string): string {
  const lines = rawText.split('\n').filter(line => line.trim());
  
  // Leta efter sammanfattnings-sektioner
  const summaryKeywords = ['sammanfattning', 'profil', 'om mig', 'summary', 'profile', 'about'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Ta nästa få rader som potentiell sammanfattning
      const summaryLines = [];
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().length > 20) {
          summaryLines.push(lines[j].trim());
        }
      }
      if (summaryLines.length > 0) {
        return summaryLines.join(' ').substring(0, 300);
      }
    }
  }
  
  return ''; // Return empty string instead of generic text
}

/**
 * Extrahera grundläggande arbetslivserfarenhet
 */
export function extractBasicExperience(rawText: string) {
  const lines = rawText.split('\n').filter(line => line.trim());
  const experienceKeywords = ['arbetslivserfarenhet', 'experience', 'anställning', 'tjänst', 'position', 'work'];
  const experiences = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      // Leta efter jobbposter efter nyckelordet
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const expLine = lines[j];
        if (expLine.length > 10 && (expLine.includes(' - ') || expLine.includes(' | '))) {
          const separator = expLine.includes(' - ') ? ' - ' : ' | ';
          const parts = expLine.split(separator);
          if (parts.length >= 2) {
            experiences.push({
              position: parts[0].trim(),
              company: parts[1].trim(),
              location: '',
              startDate: '2020-01-01',
              endDate: undefined,
              description: [`Arbetade som ${parts[0].toLowerCase().trim()}`],
              achievements: []
            });
          }
        }
      }
      break;
    }
  }
  
  if (experiences.length === 0) {
    // Fallback - leta efter företagsnamn och titlar
    const potentialJobs = lines.filter(line => 
      line.length > 10 && 
      line.length < 100 &&
      !line.includes('@') &&
      (line.includes('AB') || line.includes('Ltd') || line.includes('Inc') ||
       line.toLowerCase().includes('utvecklare') || line.toLowerCase().includes('manager') ||
       line.toLowerCase().includes('konsult') || line.toLowerCase().includes('specialist'))
    ).slice(0, 3);
    
    potentialJobs.forEach((job, index) => {
      experiences.push({
        position: job.includes('utvecklare') ? 'Utvecklare' : job.includes('manager') ? 'Manager' : 'Specialist',
        company: job,
        location: '',
        startDate: `${2022 - index}-01-01`,
        endDate: index === 0 ? undefined : `${2023 - index}-01-01`,
        description: ['Relevant arbetslivserfarenhet'],
        achievements: []
      });
    });
  }
  
  return experiences.length > 0 ? experiences : [{
    position: '',
    company: '',
    location: '',
    startDate: '2020-01-01',
    endDate: undefined,
    description: [],
    achievements: []
  }];
}

/**
 * Extrahera grundläggande utbildning
 */
export function extractBasicEducation(rawText: string) {
  const lines = rawText.split('\n').filter(line => line.trim());
  const educationKeywords = ['utbildning', 'education', 'examen', 'universitet', 'högskola', 'degree'];
  const education = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      // Leta efter utbildningar efter nyckelordet
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const eduLine = lines[j];
        if (eduLine.length > 10 && (eduLine.includes(' - ') || eduLine.includes(' | ') || 
            eduLine.toLowerCase().includes('universitet') || eduLine.toLowerCase().includes('högskola'))) {
          const separator = eduLine.includes(' - ') ? ' - ' : eduLine.includes(' | ') ? ' | ' : '';
          if (separator) {
            const parts = eduLine.split(separator);
            education.push({
              degree: parts[0].trim(),
              institution: parts[1]?.trim() || 'Utbildningsinstitution',
              location: '',
              graduationYear: '2020',
              field: '',
              honors: undefined
            });
          } else {
            education.push({
              degree: eduLine.trim(),
              institution: 'Se bifogad information',
              location: '',
              graduationYear: '2020',
              field: '',
              honors: undefined
            });
          }
        }
      }
      break;
    }
  }
  
  return education; // Return only actual education found, no fallback
}

/**
 * Extrahera grundläggande färdigheter
 */
export function extractBasicSkills(rawText: string) {
  const skillsKeywords = ['kompetenser', 'skills', 'färdigheter', 'kunskaper', 'teknisk', 'technical'];
  const commonTechSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'git', 'docker', 'aws', 'azure'];
  const commonSoftSkills = ['kommunikation', 'ledarskap', 'problemlösning', 'teamwork', 'projektledning'];
  
  const foundTechSkills: string[] = [];
  const foundSoftSkills: string[] = [];
  const foundLanguages: string[] = [];
  
  const lowerText = rawText.toLowerCase();
  
  // Hitta tekniska färdigheter
  commonTechSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      foundTechSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  // Hitta mjuka färdigheter
  commonSoftSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      foundSoftSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  // Hitta språk
  const languages = ['svenska', 'engelska', 'tyska', 'franska', 'spanska', 'finska', 'norska'];
  languages.forEach(lang => {
    if (lowerText.includes(lang)) {
      foundLanguages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  });
  
  const skills = [];
  
  if (foundTechSkills.length > 0) {
    skills.push({ category: 'Tekniska färdigheter', skills: foundTechSkills });
  }
  
  if (foundSoftSkills.length > 0) {
    skills.push({ category: 'Mjuka färdigheter', skills: foundSoftSkills });
  }
  
  if (foundLanguages.length > 0) {
    skills.push({ category: 'Språk', skills: foundLanguages });
  }
  
  // No fallback - return only actual skills found to avoid placeholder text
  
  return skills;
}

/**
 * Extrahera grundläggande språkkunskaper
 */
export function extractBasicLanguages(rawText: string) {
  const languages: { language: string; proficiency: 'Nybörjare' | 'Konversation' | 'Flyt' | 'Modersmål' | 'Tvåspråkig' }[] = [];
  const lowerText = rawText.toLowerCase();
  
  const languagePatterns = {
    'Svenska': ['svenska', 'swedish', 'modersmål'],
    'Engelska': ['engelska', 'english', 'fluent', 'flyt'],
    'Tyska': ['tyska', 'german'],
    'Franska': ['franska', 'french'],
    'Spanska': ['spanska', 'spanish']
  };
  
  Object.entries(languagePatterns).forEach(([lang, patterns]) => {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      let level: 'Nybörjare' | 'Konversation' | 'Flyt' | 'Modersmål' | 'Tvåspråkig' = 'Nybörjare';
      if (lowerText.includes('modersmål') || lowerText.includes('native')) {
        level = 'Modersmål';
      } else if (lowerText.includes('flyt') || lowerText.includes('fluent')) {
        level = 'Flyt';
      } else if (lowerText.includes('konversation')) {
        level = 'Konversation';
      }
      
      languages.push({ language: lang, proficiency: level });
    }
  });
  
  return languages;
}