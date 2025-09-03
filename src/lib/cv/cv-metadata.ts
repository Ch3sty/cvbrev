// src/lib/cv/cv-metadata.ts
// Strukturer och typer för CV-data och metadata

export interface CVPersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  linkedIn?: string;
  website?: string;
  github?: string;
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
  gpa?: string;
  honors?: string;
  relevantCourses?: string[];
}

export interface CVSkill {
  category: string;
  skills: string[];
  level?: 'Nybörjare' | 'Medel' | 'Avancerad' | 'Expert';
}

export interface CVProject {
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface CVCertification {
  name: string;
  issuer: string;
  issueDate?: string;
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

export type CVTemplateType = 'klassisk' | 'modern' | 'kreativ' | 'ats-optimerad' | 'akademisk';

export interface CVTemplate {
  id: CVTemplateType;
  name: string;
  description: string;
  category: string;
  bestFor: string[];
  features: string[];
  colorSchemes: string[];
  previewImage: string;
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => string;
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