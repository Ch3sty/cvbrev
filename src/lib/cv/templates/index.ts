import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import type { CVTemplateGenerator } from './base/template-base';

// Import all template generators
import { sidebarIconsTemplate } from './sidebar-icons/generator';
import { editorialMagazineTemplate } from './editorial-magazine/generator';
import { tidlosFormellTemplate } from './tidlos-formell/generator';
import { konsultKompaktTemplate } from './konsult-kompakt/generator';
import { stackDeveloperTemplate } from './stack-developer/generator';
import { boldModernTemplate } from './bold-modern/generator';
import { studentStartupTemplate } from './student-startup/generator';
import { vardenOmsorgTemplate } from './varden-omsorg/generator';
import { norrskenTemplate } from './norrsken/generator';
import { auroraTemplate } from './aurora/generator';
import { atlasTemplate } from './atlas/generator';
import { galleriTemplate } from './galleri/generator';
import { pedagogTemplate } from './pedagog/generator';
import { aspektTemplate } from './aspekt/generator';
import { klinikTemplate } from './klinik/generator';
import { skymningTemplate } from './skymning/generator';
import { byggTemplate } from './bygg/generator';
import { forskareTemplate } from './forskare/generator';
import { serveringTemplate } from './servering/generator';
import { linjeTemplate } from './linje/generator';
import { spektrumTemplate } from './spektrum/generator';
import { kvistTemplate } from './kvist/generator';
import { magasinTemplate } from './magasin/generator';
import { kartaTemplate } from './karta/generator';
import { avtryckTemplate } from './avtryck/generator';
import { diskTemplate } from './disk/generator';
import { logistikTemplate } from './logistik/generator';
import { verkstadTemplate } from './verkstad/generator';
import { myndighetTemplate } from './myndighet/generator';
import { kontoTemplate } from './konto/generator';
import { diskPlusTemplate } from './disk-plus/generator';
import { logistikPlusTemplate } from './logistik-plus/generator';
import { verkstadPlusTemplate } from './verkstad-plus/generator';
import { myndighetPlusTemplate } from './myndighet-plus/generator';
import { kontoPlusTemplate } from './konto-plus/generator';
import { norrskenPlusTemplate } from './norrsken-plus/generator';
import { tidlosPlusTemplate } from './tidlos-plus/generator';
import { stackPlusTemplate } from './stack-plus/generator';
import { hantverkarePlusTemplate } from './hantverkare-plus/generator';
import { studentPlusTemplate } from './student-plus/generator';
import { sidopanelPlusTemplate } from './sidopanel-plus/generator';

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
  'sidebar-icons': sidebarIconsTemplate,
  'editorial-magazine': editorialMagazineTemplate,
  'tidlos-formell': tidlosFormellTemplate,
  'konsult-kompakt': konsultKompaktTemplate,
  'stack-developer': stackDeveloperTemplate,
  'bold-modern': boldModernTemplate,
  'student-startup': studentStartupTemplate,
  'varden-omsorg': vardenOmsorgTemplate,
  'norrsken': norrskenTemplate,
  'aurora': auroraTemplate,
  'atlas': atlasTemplate,
  'galleri': galleriTemplate,
  'pedagog': pedagogTemplate,
  'aspekt': aspektTemplate,
  'klinik': klinikTemplate,
  'skymning': skymningTemplate,
  'bygg': byggTemplate,
  'forskare': forskareTemplate,
  'servering': serveringTemplate,
  'linje': linjeTemplate,
  'spektrum': spektrumTemplate,
  'kvist': kvistTemplate,
  'magasin': magasinTemplate,
  'karta': kartaTemplate,
  'avtryck': avtryckTemplate,
  'disk': diskTemplate,
  'logistik': logistikTemplate,
  'verkstad': verkstadTemplate,
  'myndighet': myndighetTemplate,
  'konto': kontoTemplate,
  'disk-plus': diskPlusTemplate,
  'logistik-plus': logistikPlusTemplate,
  'verkstad-plus': verkstadPlusTemplate,
  'myndighet-plus': myndighetPlusTemplate,
  'konto-plus': kontoPlusTemplate,
  'norrsken-plus': norrskenPlusTemplate,
  'tidlos-plus': tidlosPlusTemplate,
  'stack-plus': stackPlusTemplate,
  'hantverkare-plus': hantverkarePlusTemplate,
  'student-plus': studentPlusTemplate,
  'sidopanel-plus': sidopanelPlusTemplate
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