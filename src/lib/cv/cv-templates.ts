// CV Templates Index - Optimerad med lazy loading för bättre prestanda
import { CVTemplate, CVTemplateType } from './cv-metadata';
import { loadTemplate, loadTemplates, getAllTemplateMetadata, preloadPopularTemplates, templateMetadata } from './template-loader';

// Legacy support - Async versioner av gamla funktioner
export async function getCVTemplate(templateType: CVTemplateType): Promise<CVTemplate> {
  return loadTemplate(templateType);
}

// Ny synkron version som returnerar metadata + lazy loading
export function getCVTemplateMetadata(templateType: CVTemplateType): Omit<CVTemplate, 'generateHTML'> {
  const template = templateMetadata[templateType];
  if (!template) {
    throw new Error(`CV template "${templateType}" not found`);
  }
  return template;
}

// Få alla tillgängliga mallar (endast metadata för initial rendering)
export function getAllCVTemplates(): Array<Omit<CVTemplate, 'generateHTML'>> {
  return getAllTemplateMetadata();
}

// Async version för att ladda fullständiga mallar
export async function getAllCVTemplatesAsync(): Promise<CVTemplate[]> {
  const templateIds = Object.keys(templateMetadata) as CVTemplateType[];
  return loadTemplates(templateIds);
}

// Batch loading för specifika mallar
export async function loadSpecificTemplates(templateIds: CVTemplateType[]): Promise<CVTemplate[]> {
  return loadTemplates(templateIds);
}

// Hjälpfunktion för att validera mall-typ
export function isValidTemplateType(type: string): type is CVTemplateType {
  return type in templateMetadata;
}

// Preload populära mallar för bättre UX
export { preloadPopularTemplates };

// Export loader functions för direktanvändning
export { loadTemplate, loadTemplates } from './template-loader';

// Export alla template typer för TypeScript
export type { CVTemplateType } from './cv-metadata';

// Export hjälpfunktioner från cv-helpers för att behålla backward compatibility
export { optimizeContentForTemplate, generateHTMLSafely } from './cv-helpers';