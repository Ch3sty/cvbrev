// CV Helpers - Extrakt från gamla cv-templates.ts för att återställa saknad funktionalitet
import type { CVTemplate, CVMetadata, CVGenerationOptions } from './cv-metadata';

/**
 * Säker HTML-generering som hanterar både synkrona och asynkrona template funktioner
 * This ensures type safety and consistent handling across all template usages
 */
export async function generateHTMLSafely(
  template: CVTemplate, 
  cvData: CVMetadata, 
  options: CVGenerationOptions
): Promise<string> {
  const htmlResult = template.generateHTML(cvData, options);
  return typeof htmlResult === 'string' ? htmlResult : await htmlResult;
}

/**
 * Mallspecifik innehållsoptimering - Anpassar CV-data för varje specifik mall
 * Detta säkerställer att innehållet placeras optimalt baserat på mallens design och fokus
 */
export function optimizeContentForTemplate(cvData: CVMetadata, templateId: string): CVMetadata {
  // Skapa en kopia för att undvika att modifiera original
  const optimizedData = JSON.parse(JSON.stringify(cvData)) as CVMetadata;
  
  switch (templateId) {
    case 'modern':
      return optimizeForTechTemplate(optimizedData);
    
    case 'kreativ':
      return optimizeForCreativeTemplate(optimizedData);
    
    case 'ats-optimerad':
      return optimizeForATSTemplate(optimizedData);
    
    case 'akademisk':
      return optimizeForAcademicTemplate(optimizedData);
    
    case 'klassisk':
      return optimizeForClassicTemplate(optimizedData);
    
    case 'modern-tech':
      return optimizeForTechTemplate(optimizedData); // Samma som modern
    
    default:
      return optimizedData;
  }
}

/**
 * Tech/Modern mall-optimering - Fokus på tekniska färdigheter och projektresultat
 */
function optimizeForTechTemplate(cvData: CVMetadata): CVMetadata {
  // Prioritera tekniska färdigheter
  if (cvData.skills) {
    const techCategories = ['Programming Languages', 'Frameworks', 'Tools', 'Databases', 'Cloud', 'DevOps', 'Programmering', 'Teknisk', 'Development'];
    const techSkills = cvData.skills.filter(skill => 
      techCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    const otherSkills = cvData.skills.filter(skill => 
      !techCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    
    // Placera tekniska färdigheter först
    cvData.skills = [...techSkills, ...otherSkills];
  }
  
  // Förstärk tekniska projekt
  if (cvData.projects) {
    cvData.projects = (cvData.projects || []).map(project => ({
      ...project,
      // Säkerställ att tekniska projekt har tydliga tech stacks
      technologies: project.technologies || extractTechFromDescription(project.description)
    }));
  }
  
  // Optimera erfarenheter för tech-fokus
  cvData.experience = (cvData.experience || []).map(exp => ({
    ...exp,
    // Framhäv tekniska prestationer i beskrivningar
    description: (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => enhanceTechDescription(desc)),
    achievements: (exp.achievements || []).map(ach => enhanceTechAchievement(ach))
  }));
  
  return cvData;
}

/**
 * Kreativ mall-optimering - Fokus på portfolio, visuella projekt och kreativa prestationer
 */
function optimizeForCreativeTemplate(cvData: CVMetadata): CVMetadata {
  // Prioritera kreativa färdigheter och verktyg
  if (cvData.skills) {
    const creativeCategories = ['Design', 'Creative', 'Visual', 'Art', 'Media', 'Graphics', 'Kreativ', 'Grafisk'];
    const creativeSkills = cvData.skills.filter(skill => 
      creativeCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    const technicalSkills = cvData.skills.filter(skill => 
      !creativeCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    
    cvData.skills = [...creativeSkills, ...technicalSkills];
  }
  
  // Framhäv visuella och kreativa projekt
  if (cvData.projects) {
    cvData.projects = (cvData.projects || []).map(project => ({
      ...project,
      // Lägg till kreativa nyckelord om de saknas
      description: enhanceCreativeDescription(project.description)
    }));
  }
  
  // Optimera erfarenheter för kreativt fokus
  cvData.experience = (cvData.experience || []).map(exp => ({
    ...exp,
    description: (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => enhanceCreativeExperience(desc)),
    achievements: (exp.achievements || []).map(ach => enhanceCreativeAchievement(ach))
  }));
  
  return cvData;
}

/**
 * ATS-optimering - Fokus på nyckelord och enkel struktur
 */
function optimizeForATSTemplate(cvData: CVMetadata): CVMetadata {
  // Säkerställ att summary innehåller branschspecifika nyckelord
  cvData.summary = enhanceForKeywords(cvData.summary || '');
  
  // Optimera färdigheter för ATS-läsning
  if (cvData.skills) {
    cvData.skills = (cvData.skills || []).map(skillCategory => ({
      ...skillCategory,
      skills: (skillCategory.skills || []).map(skill => expandSkillForATS(skill))
    }));
  }
  
  // Förtydliga jobbtitlar och företagsnamn
  cvData.experience = (cvData.experience || []).map(exp => ({
    ...exp,
    position: clarifyJobTitle(exp.position),
    description: (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => optimizeForATS(desc))
  }));
  
  return cvData;
}

/**
 * Akademisk mall-optimering - Fokus på utbildning, forskning och publikationer
 */
function optimizeForAcademicTemplate(cvData: CVMetadata): CVMetadata {
  // Prioritera akademiska meriter i education
  cvData.education = (cvData.education || []).map(edu => ({
    ...edu,
    // Framhäv akademiska utmärkelser
    honors: edu.honors || extractAcademicHonors(edu.degree).join(', ')
  }));
  
  // Omstrukturera erfarenhet för akademisk miljö
  cvData.experience = (cvData.experience || []).map(exp => ({
    ...exp,
    description: (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => enhanceAcademicDescription(desc)),
    achievements: (exp.achievements || []).map(ach => enhanceAcademicAchievement(ach))
  }));
  
  return cvData;
}

/**
 * Klassisk mall-optimering - Balanserad approach med traditionell struktur
 */
function optimizeForClassicTemplate(cvData: CVMetadata): CVMetadata {
  // Säkerställ traditionell ordning av sektioner
  // Klassisk mall behöver minimal optimering - behåller struktur som den är
  
  // Förbättra språk i beskrivningar för mer formell ton
  cvData.experience = (cvData.experience || []).map(exp => ({
    ...exp,
    description: (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => enhanceForFormalTone(desc))
  }));
  
  return cvData;
}

// Hjälpfunktioner för innehållsoptimering

function extractTechFromDescription(description: string): string[] {
  const techKeywords = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'PHP',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Git', 'Jenkins', 'CI/CD', 'Linux', 'REST', 'GraphQL', 'API', 'Next.js', 'Vue'
  ];
  
  const found = techKeywords.filter(tech => 
    description.toLowerCase().includes(tech.toLowerCase())
  );
  
  return [...new Set(found)];
}

function enhanceTechDescription(description: string): string {
  // Framhäv tekniska termer och metriker
  return description
    .replace(/utvecklade|byggde|skapade/gi, 'utvecklade och implementerade')
    .replace(/system/gi, 'tekniska system')
    .replace(/applikation/gi, 'applikationsarkitektur');
}

function enhanceTechAchievement(achievement: string): string {
  // Förstärk tekniska prestationer med kvantifiering
  if (achievement.includes('%')) {
    return achievement + ' genom teknisk optimering';
  }
  return achievement;
}

function enhanceCreativeDescription(description: string): string {
  // Lägg till kreativa nyckelord
  return description
    .replace(/design/gi, 'kreativ design och visuell kommunikation')
    .replace(/skapade|utvecklade/gi, 'konceptualiserade och realiserade');
}

function enhanceCreativeExperience(description: string): string {
  // Framhäv kreativa aspekter
  return description
    .replace(/projekt/gi, 'kreativa projekt')
    .replace(/lösning/gi, 'innovativ lösning');
}

function enhanceCreativeAchievement(achievement: string): string {
  // Förstärk kreativa prestationer
  if (achievement.includes('ökade') || achievement.includes('förbättrade')) {
    return achievement + ' genom kreativ problemlösning';
  }
  return achievement;
}

function enhanceForKeywords(summary: string): string {
  // Förstärk med branschspecifika nyckelord för ATS
  if (!summary.includes('erfaren') && !summary.includes('kompetent')) {
    summary = 'Erfaren ' + summary;
  }
  return summary;
}

function expandSkillForATS(skill: string): string {
  // Expandera färdigheter för bättre ATS-matchning
  const expansions: { [key: string]: string } = {
    'JS': 'JavaScript (JS)',
    'TS': 'TypeScript (TS)',
    'CSS': 'CSS/CSS3',
    'HTML': 'HTML/HTML5'
  };
  
  return expansions[skill] || skill;
}

function clarifyJobTitle(title: string): string {
  // Förtydliga jobbtitlar för ATS
  return title
    .replace(/Dev/gi, 'Developer')
    .replace(/Eng/gi, 'Engineer');
}

function optimizeForATS(description: string): string {
  // Optimera beskrivningar för ATS-läsning
  return description
    .replace(/&/g, 'och')
    .replace(/%/g, ' procent');
}

function extractAcademicHonors(degree: string): string[] {
  const honors = ['cum laude', 'magna cum laude', 'summa cum laude', 'med utmärkelse'];
  return honors.filter(honor => degree.toLowerCase().includes(honor));
}

function enhanceAcademicDescription(description: string): string {
  // Framhäv akademiska aspekter
  return description
    .replace(/forskning/gi, 'vetenskaplig forskning')
    .replace(/analys/gi, 'akademisk analys');
}

function enhanceAcademicAchievement(achievement: string): string {
  // Förstärk akademiska prestationer
  if (achievement.includes('publikation') || achievement.includes('forskning')) {
    return achievement + ' inom akademisk miljö';
  }
  return achievement;
}

function enhanceForFormalTone(description: string): string {
  // Förbättra för formell ton i klassisk mall
  return description
    .replace(/jobbade/gi, 'arbetade')
    .replace(/fixade/gi, 'åtgärdade')
    .replace(/hjälpte/gi, 'assisterade');
}