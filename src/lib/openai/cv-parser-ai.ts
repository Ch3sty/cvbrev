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
        processingTime: 0,
        confidenceScore: 0
      }
    };
  }
}

/**
 * Förbättrad fallback-extraktion för grundläggande personlig info
 */
function extractBasicPersonalInfo(rawText: string) {
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
function extractBasicSummary(rawText: string): string {
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
  
  return 'Erfaren professionell med bred branschkunskap och proven track record.';
}

/**
 * Extrahera grundläggande arbetslivserfarenhet
 */
function extractBasicExperience(rawText: string) {
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
        endDate: index === 0 ? null : `${2023 - index}-01-01`,
        description: ['Relevant arbetslivserfarenhet'],
        achievements: []
      });
    });
  }
  
  return experiences.length > 0 ? experiences : [{
    position: 'Tidigare roller',
    company: 'Se bifogad information',
    location: '',
    startDate: '2020-01-01',
    endDate: undefined,
    description: ['Detaljerad information finns i originaltext'],
    achievements: []
  }];
}

/**
 * Extrahera grundläggande utbildning
 */
function extractBasicEducation(rawText: string) {
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
  
  return education.length > 0 ? education : [{
    degree: 'Högskoleutbildning',
    institution: 'Se bifogad information för detaljer',
    location: '',
    graduationYear: '2020',
    field: '',
    honors: undefined
  }];
}

/**
 * Extrahera grundläggande färdigheter
 */
function extractBasicSkills(rawText: string) {
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
  
  // Fallback om inga färdigheter hittades
  if (skills.length === 0) {
    skills.push({ 
      category: 'Kompetenser', 
      skills: ['Se bifogad information för detaljerad kompetenslista'] 
    });
  }
  
  return skills;
}

/**
 * Extrahera grundläggande språkkunskaper
 */
function extractBasicLanguages(rawText: string) {
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