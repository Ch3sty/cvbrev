// src/lib/cv/cv-metadata.ts
// Strukturer och typer för CV-data och metadata

export interface CVPersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  location?: string; // Alternative to address
  linkedIn?: string;
  linkedin?: string; // Alternative spelling
  website?: string;
  github?: string;
  title?: string; // Professional title
}

export interface CVExperience {
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string; // undefined means current job
  description: string[];
  achievements?: string[];
}

export interface CVEducation {
  degree: string;
  institution: string;
  location?: string;
  graduationYear?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string;
  relevantCourses?: string[];
  description?: string;
  thesis?: string; // For academic CVs
}

export interface CVSkill {
  category: string;
  skills: string[];
  name?: string; // For individual skill names
  level?: 'Nybörjare' | 'Medel' | 'Avancerad' | 'Expert' | number;
}

export interface CVProject {
  name: string; // Primary name property
  title?: string; // Alternative title property for backwards compatibility
  description: string;
  technologies?: string[];
  link?: string;
  url?: string; // Alternative URL property
  startDate?: string;
  endDate?: string;
  achievements?: string[]; // For project achievements
}

export interface CVCertification {
  name: string;
  issuer: string;
  issueDate?: string;
  date?: string; // Alternative date field
  expiryDate?: string;
  credentialId?: string;
}

export interface CVLanguage {
  language: string;
  proficiency: 'Nybörjare' | 'Konversation' | 'Flyt' | 'Modersmål' | 'Tvåspråkig';
}

export interface CVMetadata {
  personalInfo: CVPersonalInfo;
  summary?: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: CVSkill[];
  projects?: CVProject[];
  certifications?: CVCertification[];
  languages?: CVLanguage[];
  interests?: string[];
  references?: string;
  targetIndustry?: string;
  targetRole?: string;
}

export interface CVGenerationOptions {
  template: CVTemplateType;
  format: 'pdf' | 'docx' | 'both';
  industry?: string;
  colorScheme?: 'blue' | 'black' | 'green' | 'purple' | 'red';
  includePhoto?: boolean;
  photoUrl?: string;
}

export type CVTemplateType = 'klassisk' | 'modern' | 'kreativ' | 'ats-optimerad' | 'akademisk' | 'modern-tech';

export interface CVTemplate {
  id: CVTemplateType;
  name: string;
  description: string;
  category: string;
  bestFor: string[];
  features: string[];
  colorSchemes: string[];
  previewImage: string;
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => string | Promise<string>;
}

// Utility functions för CV-datahantering
export const formatDateRange = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' });
  const end = endDate ? new Date(endDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' }) : 'Pågående';
  return `${start} - ${end}`;
};

export const calculateExperienceYears = (experiences: CVExperience[]): number => {
  let totalMonths = 0;
  
  experiences.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
};

export const extractKeywords = (cvData: CVMetadata): string[] => {
  const keywords = new Set<string>();
  
  // Extract from skills
  cvData.skills.forEach(skillCategory => {
    skillCategory.skills.forEach(skill => keywords.add(skill.toLowerCase()));
  });
  
  // Extract from experience descriptions
  cvData.experience.forEach(exp => {
    exp.description.forEach(desc => {
      // Simple keyword extraction - could be enhanced with NLP
      const words = desc.toLowerCase().match(/\b\w{3,}\b/g) || [];
      words.forEach(word => keywords.add(word));
    });
  });
  
  return Array.from(keywords).slice(0, 50); // Limit to top 50 keywords
};

// Dynamic heading system for CV templates
export interface DynamicHeadings {
  experience: string;
  education: string;
  skills: string;
  languages: string;
  projects: string;
  certifications: string;
  summary: string;
}

// Detect industry/field based on CV content
export const detectIndustry = (cvData: CVMetadata): string => {
  const keywords = extractKeywords(cvData);
  const positions = cvData.experience.map(exp => exp.position.toLowerCase()).join(' ');
  const skillText = cvData.skills.map(s => s.skills.join(' ')).join(' ').toLowerCase();
  const combinedText = `${positions} ${skillText} ${keywords.join(' ')}`;
  
  // Technology keywords
  const techKeywords = ['javascript', 'python', 'react', 'node', 'developer', 'programming', 'software', 'frontend', 'backend', 'fullstack', 'devops', 'data', 'ai', 'machine', 'learning'];
  const techScore = techKeywords.filter(kw => combinedText.includes(kw)).length;
  
  // Business keywords
  const businessKeywords = ['management', 'manager', 'business', 'strategy', 'marketing', 'sales', 'finance', 'accounting', 'consultant'];
  const businessScore = businessKeywords.filter(kw => combinedText.includes(kw)).length;
  
  // Creative keywords
  const creativeKeywords = ['design', 'creative', 'art', 'graphics', 'ui', 'ux', 'brand', 'visual', 'photography'];
  const creativeScore = creativeKeywords.filter(kw => combinedText.includes(kw)).length;
  
  // Healthcare keywords
  const healthKeywords = ['health', 'medical', 'nurse', 'doctor', 'care', 'patient', 'clinical'];
  const healthScore = healthKeywords.filter(kw => combinedText.includes(kw)).length;
  
  // Education keywords
  const educationKeywords = ['teacher', 'education', 'training', 'instructor', 'professor', 'academic'];
  const educationScore = educationKeywords.filter(kw => combinedText.includes(kw)).length;
  
  if (techScore >= 2) return 'tech';
  if (creativeScore >= 2) return 'creative';
  if (businessScore >= 2) return 'business';
  if (healthScore >= 2) return 'healthcare';
  if (educationScore >= 2) return 'education';
  
  return 'general';
};

// Generate dynamic headings based on industry and content
export const generateDynamicHeadings = (cvData: CVMetadata, templateId: CVTemplateType): DynamicHeadings => {
  const industry = detectIndustry(cvData);
  const hasProjects = cvData.projects && cvData.projects.length > 0;
  const hasCertifications = cvData.certifications && cvData.certifications.length > 0;
  const hasLanguages = cvData.languages && cvData.languages.length > 0;
  
  // Base headings for different industries
  const headingMap: Record<string, DynamicHeadings> = {
    tech: {
      experience: 'Teknisk Erfarenhet',
      education: 'Teknisk Utbildning',
      skills: 'Teknisk Stack',
      languages: 'Programmeringsspråk & Naturliga Språk',
      projects: 'Tekniska Projekt',
      certifications: 'Certifieringar & Kurser',
      summary: 'Teknisk Profil'
    },
    creative: {
      experience: 'Kreativ Erfarenhet', 
      education: 'Kreativ Utbildning',
      skills: 'Kreativa Färdigheter',
      languages: 'Språkkunskaper',
      projects: 'Portfolio & Projekt',
      certifications: 'Utmärkelser & Certifieringar',
      summary: 'Kreativ Profil'
    },
    business: {
      experience: 'Affärserfarenhet',
      education: 'Affärsutbildning', 
      skills: 'Affärskompetenser',
      languages: 'Språkkunskaper',
      projects: 'Affärsprojekt',
      certifications: 'Professionella Certifieringar',
      summary: 'Professionell Profil'
    },
    healthcare: {
      experience: 'Klinisk Erfarenhet',
      education: 'Medicinska Studier',
      skills: 'Medicinska Kompetenser', 
      languages: 'Språkkunskaper',
      projects: 'Forskningsprojekt',
      certifications: 'Medicinska Certifieringar',
      summary: 'Professionell Bakgrund'
    },
    education: {
      experience: 'Undervisningserfarenhet',
      education: 'Pedagogisk Utbildning',
      skills: 'Pedagogiska Färdigheter',
      languages: 'Språkkunskaper', 
      projects: 'Undervisningsprojekt',
      certifications: 'Pedagogiska Certifieringar',
      summary: 'Pedagogisk Profil'
    },
    general: {
      experience: 'Yrkeserfarenhet',
      education: 'Utbildning',
      skills: 'Kompetenser',
      languages: 'Språkkunskaper',
      projects: 'Projekt', 
      certifications: 'Certifieringar',
      summary: 'Professionell Bakgrund'
    }
  };
  
  // Adjust headings based on template style
  const baseHeadings = headingMap[industry] || headingMap.general;
  
  // Template-specific adjustments
  if (templateId === 'klassisk') {
    return {
      ...baseHeadings,
      experience: 'Professionell Bakgrund',
      education: 'Utbildning & Kvalifikationer',
      skills: 'Kärnkompetenser'
    };
  }
  
  if (templateId === 'ats-optimerad') {
    return {
      ...baseHeadings,
      experience: 'Relevant Arbetslivserfarenhet', 
      skills: 'Tekniska & Professionella Färdigheter',
      education: 'Utbildningsbakgrund'
    };
  }
  
  return baseHeadings;
};