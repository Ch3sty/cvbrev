// CV Templates Index - Importerar alla separata mallar för bättre prestanda och hantering
import { CVTemplate, CVTemplateType } from './cv-metadata';

// Import alla separata mallar
import { klassiskCVTemplate } from './templates/klassisk';
import { modernCVTemplate } from './templates/modern';
import { atsOptimeradCVTemplate } from './templates/ats-optimerad';
import { kreativCVTemplate } from './templates/kreativ';
import { akademiskCVTemplate } from './templates/akademisk';
import { modernTechCVTemplate } from './templates/modern-tech';

// Export mallarna individuellt för tree-shaking
export {
  klassiskCVTemplate,
  modernCVTemplate,
  atsOptimeradCVTemplate,
  kreativCVTemplate,
  akademiskCVTemplate,
  modernTechCVTemplate
};

// Sammanställd mall-objekt för backward compatibility
export const cvTemplates = {
  'klassisk': klassiskCVTemplate,
  'modern': modernCVTemplate,
  'ats-optimerad': atsOptimeradCVTemplate,
  'kreativ': kreativCVTemplate,
  'akademisk': akademiskCVTemplate,
  'modern-tech': modernTechCVTemplate,
} as const;

// Funktion för att hämta en specifik mall
export function getCVTemplate(templateType: CVTemplateType): CVTemplate {
  const template = cvTemplates[templateType];
  if (!template) {
    throw new Error(`CV template "${templateType}" not found`);
  }
  return template;
}

// Funktion för att få alla tillgängliga mallar
export function getAllCVTemplates(): CVTemplate[] {
  return Object.values(cvTemplates);
}

// Hjälpfunktion för att validera mall-typ
export function isValidTemplateType(type: string): type is CVTemplateType {
  return type in cvTemplates;
}

// Export alla template typer för TypeScript
export type { CVTemplateType } from './cv-metadata';

// Export hjälpfunktioner från cv-helpers för att behålla backward compatibility
export { optimizeContentForTemplate, generateHTMLSafely } from './cv-helpers';