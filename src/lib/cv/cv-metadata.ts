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
  profilePhotoUrl?: string; // Profile photo for CV templates
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
  format: 'pdf' | 'docx' | 'both' | 'png';
  industry?: string;
  colorScheme?: 'blue' | 'black' | 'green' | 'purple' | 'red' | 'navy' | 'minimalist' | 'tech-blue' | 'professional-navy' | 'modern-slate' | 'innovation-purple' | 'academic-blue' | 'scholarly-navy' | 'research-burgundy' | 'classic-black' | 'professional' | 'corporate' | 'trust' | 'stability' | 'success' | 'premium' | 'creative' | 'brand' | 'vibrant' | 'artistic' | 'modern' | 'elegant' | 'charcoal' | 'forest' | 'burgundy' | 'royal' | 'classic' | 'slate' | 'teal' | 'indigo' | 'emerald' | 'amber' | 'academic' | 'institution' | 'scholarly' | 'traditional';
  includePhoto?: boolean;
  photoUrl?: string;
}

export type CVTemplateType = 'modern-minimal' | 'classic-professional' | 'clean-corporate' | 'creative-edge' | 'executive-premium' | 'nordic-professional' | 'platinum-executive' | 'creative-minimal';

export interface CVTemplate {
  id: CVTemplateType;
  name: string;
  description: string;
  designStyle: string; // Visual style instead of profession category
  visualFeatures: string[]; // Design features instead of profession restrictions
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
  
  (experiences || []).forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
};

// Extract professional title from experience if not provided in personalInfo
export const extractProfessionalTitle = (cvData: CVMetadata): string => {
  // Return existing title if provided
  if (cvData.personalInfo.title && cvData.personalInfo.title.trim()) {
    return cvData.personalInfo.title.trim();
  }
  
  // Try to extract from most recent experience
  const mostRecentExp = (cvData.experience || [])
    .filter(exp => exp.position && exp.position.trim())
    .sort((a, b) => {
      const dateA = a.endDate ? new Date(a.endDate) : new Date();
      const dateB = b.endDate ? new Date(b.endDate) : new Date();
      return dateB.getTime() - dateA.getTime();
    })[0];
  
  if (mostRecentExp) {
    return mostRecentExp.position;
  }
  
  // No title found - return empty string to avoid placeholder text
  return '';
};

export const extractKeywords = (cvData: CVMetadata): string[] => {
  const keywords = new Set<string>();
  
  // Extract from skills
  (cvData.skills || []).forEach(skillCategory => {
    (skillCategory.skills || []).forEach(skill => keywords.add(skill.toLowerCase()));
  });
  
  // Extract from experience descriptions
  (cvData.experience || []).forEach(exp => {
    const descriptions = Array.isArray(exp.description) ? exp.description : [exp.description];
    descriptions.filter(Boolean).forEach(desc => {
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
  const positions = (cvData.experience || []).map(exp => exp.position.toLowerCase()).join(' ');
  const skillText = (cvData.skills || []).map(s => (s.skills || []).join(' ')).join(' ').toLowerCase();
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

// Smart section visibility - hide sections with no relevant data
export const shouldShowSection = (sectionType: string, cvData: CVMetadata): boolean => {
  switch (sectionType) {
    case 'languages':
      return (cvData.languages?.length || 0) > 0 && Boolean(cvData.languages?.some(lang => 
        lang.language && lang.language.trim() !== '' && lang.proficiency && lang.proficiency.trim() !== ''
      ));
    case 'certifications':
      return (cvData.certifications?.length || 0) > 0 && Boolean(cvData.certifications?.some(cert => 
        cert.name && cert.name.trim() !== ''
      ));
    case 'projects':
      return (cvData.projects?.length || 0) > 0 && Boolean(cvData.projects?.some(proj => 
        (proj.name || proj.title) && (proj.name || proj.title)?.trim() !== ''
      ));
    case 'skills':
      // Enhanced skills validation - check if skills data has actual content
      const hasSkills = (cvData.skills?.length || 0) > 0;
      if (!hasSkills) return false;
      
      return Boolean(cvData.skills?.some(skillCategory => {
        // Check if category has name and skills
        if (!skillCategory) return false;
        
        // Handle different skill data structures
        if (skillCategory.skills && Array.isArray(skillCategory.skills)) {
          return skillCategory.skills.some(skill => 
            skill && skill.trim() !== '' && 
            !skill.toLowerCase().includes('se bifogad') &&
            !skill.toLowerCase().includes('finns specificerade')
          );
        }
        
        // Handle individual skill items
        if (skillCategory.name && skillCategory.name.trim() !== '' && 
            !skillCategory.name.toLowerCase().includes('se bifogad')) {
          return true;
        }
        
        return false;
      }));
    case 'experience':
      return (cvData.experience?.length || 0) > 0 && Boolean(cvData.experience?.some(exp => 
        exp.position && exp.position.trim() !== '' && exp.company && exp.company.trim() !== ''
      ));
    case 'education':
      return (cvData.education?.length || 0) > 0 && Boolean(cvData.education?.some(edu => 
        edu.degree && edu.degree.trim() !== '' && edu.institution && edu.institution.trim() !== ''
      ));
    case 'publications':
      // Show if academic background or research experience detected
      const industry = detectIndustry(cvData);
      const hasAcademicContent = industry === 'education' || 
        Boolean((cvData.experience || []).some(exp => 
          exp.position.toLowerCase().includes('research') ||
          exp.position.toLowerCase().includes('professor') ||
          exp.company.toLowerCase().includes('university')
        ));
      return hasAcademicContent && (cvData.projects?.length || 0) > 0;
    case 'awards':
      return (cvData.certifications?.length || 0) > 0; // Use certifications as awards proxy
    case 'interests':
      return Boolean(cvData.interests && cvData.interests.length > 0 && 
        Boolean(cvData.interests.some(interest => interest && interest.trim() !== '')));
    case 'references':
      return Boolean(cvData.references && cvData.references.trim().length > 0);
    default:
      return true; // Core sections always shown if they have basic data
  }
};

// Enhanced industry detection with profession-specific terminology adaptation
export const detectProfessionContext = (cvData: CVMetadata): {
  industry: string;
  professionLevel: 'entry' | 'mid' | 'senior' | 'executive';
  terminology: Record<string, string>;
} => {
  const industry = detectIndustry(cvData);
  const experience = cvData.experience || [];
  
  // Detect profession level
  const totalYears = calculateExperienceYears(experience);
  const hasLeadershipTerms = Boolean(experience.some(exp => 
    exp.position.toLowerCase().includes('lead') ||
    exp.position.toLowerCase().includes('manager') ||
    exp.position.toLowerCase().includes('director') ||
    exp.position.toLowerCase().includes('chef') ||
    exp.position.toLowerCase().includes('ansvarig')
  ));
  
  let professionLevel: 'entry' | 'mid' | 'senior' | 'executive';
  if (totalYears < 2) professionLevel = 'entry';
  else if (totalYears < 5) professionLevel = 'mid';
  else if (totalYears < 10 || hasLeadershipTerms) professionLevel = 'senior';
  else professionLevel = 'executive';

  // Profession-specific terminology that works for ALL professions
  const terminologyMaps = {
    tech: {
      skills: 'Tekniska Kompetenser',
      experience: 'Teknisk Erfarenhet',
      projects: 'Tekniska Projekt',
      achievements: 'Tekniska Prestationer'
    },
    creative: {
      skills: 'Kreativa Färdigheter',
      experience: 'Kreativ Erfarenhet',
      projects: 'Portfolio & Projekt',
      achievements: 'Kreativa Prestationer'
    },
    business: {
      skills: 'Affärscompetenser',
      experience: 'Affärserfarenhet',
      projects: 'Affärsprojekt',
      achievements: 'Affärsprestationer'
    },
    healthcare: {
      skills: 'Vårdkompetenser',
      experience: 'Vårderfarenhet',
      projects: 'Vårdprojekt',
      achievements: 'Vårdprestationer'
    },
    education: {
      skills: 'Pedagogiska Färdigheter',
      experience: 'Undervisningserfarenhet',
      projects: 'Utbildningsprojekt',
      achievements: 'Pedagogiska Prestationer'
    },
    general: {
      skills: 'Professionella Kompetenser',
      experience: 'Yrkeserfarenhet',
      projects: 'Projekt & Uppdrag',
      achievements: 'Professionella Prestationer'
    }
  };

  return {
    industry,
    professionLevel,
    terminology: terminologyMaps[industry as keyof typeof terminologyMaps] || terminologyMaps.general
  };
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
  
  // Template-specific adjustments for modern templates
  if (templateId === 'classic-professional') {
    return {
      ...baseHeadings,
      experience: 'Professionell Bakgrund',
      education: 'Utbildning & Kvalifikationer',
      skills: 'Kärnkompetenser'
    };
  }
  
  return baseHeadings;
};