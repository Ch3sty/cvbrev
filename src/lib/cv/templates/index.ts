import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import type { CVTemplateGenerator } from './base/template-base';

// Import all template generators
import { modernMinimalTemplate } from './modern-minimal/generator';
import { classicProfessionalTemplate } from './classic-professional/generator';
import { cleanCorporateTemplate } from './clean-corporate/generator';
import { creativeEdgeTemplate } from './creative-edge/generator';
import { executivePremiumTemplate } from './executive-premium/generator';

// Export shared utilities
export { formatSwedishAddress } from './base/address-formatter';
export type { CVTemplateGenerator } from './base/template-base';

/**
 * Registry of all available template generators
 */
export const TEMPLATE_GENERATORS: Record<CVTemplateType, CVTemplateGenerator> = {
  'modern-minimal': modernMinimalTemplate,
  'classic-professional': classicProfessionalTemplate,
  'clean-corporate': cleanCorporateTemplate,
  'creative-edge': creativeEdgeTemplate,
  'executive-premium': executivePremiumTemplate
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