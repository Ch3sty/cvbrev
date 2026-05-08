import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import type { CVTemplateGenerator } from './base/template-base';

// Import all template generators
import { modernMinimalTemplate } from './modern-minimal/generator';
import { classicProfessionalTemplate } from './classic-professional/generator';
import { cleanCorporateTemplate } from './clean-corporate/generator';
import { creativeEdgeTemplate } from './creative-edge/generator';
import { executivePremiumTemplate } from './executive-premium/generator';
import { nordicProfessionalTemplate } from './nordic-professional/generator';
import { platinumExecutiveTemplate } from './platinum-executive/generator';
import { creativeMinimalTemplate } from './creative-minimal/generator';
import { sidebarIconsTemplate } from './sidebar-icons/generator';
import { editorialMagazineTemplate } from './editorial-magazine/generator';

// Export shared utilities
export { formatSwedishAddress } from './base/address-formatter';
export type { CVTemplateGenerator } from './base/template-base';

// Create a default fallback template generator
const createDefaultTemplate = (templateId: CVTemplateType): CVTemplateGenerator => ({
  templateId,
  generate: (cvData) => {
    // Fallback to a simple default template
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
          <meta charset="UTF-8">
          <title>CV - ${cvData.personalInfo.fullName}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              h1 { color: #2c3e50; }
              .section { margin: 20px 0; }
              .section h2 { color: #34495e; border-bottom: 1px solid #bdc3c7; }
          </style>
      </head>
      <body>
          <h1>${cvData.personalInfo.fullName}</h1>
          <p>Email: ${cvData.personalInfo.email || ''}</p>
          <p>Telefon: ${cvData.personalInfo.phone || ''}</p>
          ${cvData.summary ? `<div class="section"><h2>Professionell sammanfattning</h2><p>${cvData.summary}</p></div>` : ''}
          <div class="section"><p><em>Detta är en standard-mall. Template "${templateId}" är inte implementerad ännu.</em></p></div>
      </body>
      </html>
    `;
  },
  metadata: {
    name: 'Standard Mall',
    description: 'Grundläggande CV-mall',
    category: 'modern',
    tier: 'free'
  }
});

/**
 * Registry of all available template generators
 */
export const TEMPLATE_GENERATORS: Record<CVTemplateType, CVTemplateGenerator> = {
  'modern-minimal': modernMinimalTemplate,
  'classic-professional': classicProfessionalTemplate,
  'clean-corporate': cleanCorporateTemplate,
  'creative-edge': creativeEdgeTemplate,
  'executive-premium': executivePremiumTemplate,
  'nordic-professional': nordicProfessionalTemplate,
  'platinum-executive': platinumExecutiveTemplate,
  'creative-minimal': creativeMinimalTemplate,
  'sidebar-icons': sidebarIconsTemplate,
  'editorial-magazine': editorialMagazineTemplate
} as const;

/**
 * Get a specific template generator by ID
 */
export function getTemplateGenerator(templateId: CVTemplateType): CVTemplateGenerator | undefined {
  return TEMPLATE_GENERATORS[templateId];
}

/**
 * Get all available template generators
 */
export function getAllTemplateGenerators(): CVTemplateGenerator[] {
  return Object.values(TEMPLATE_GENERATORS);
}

/**
 * Check if a template ID is valid
 */
export function isValidTemplateId(templateId: string): templateId is CVTemplateType {
  return templateId in TEMPLATE_GENERATORS;
}