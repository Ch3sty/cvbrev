// Template Loader - Dynamic imports för bättre prestanda
import type { CVTemplate, CVTemplateType } from './cv-metadata';
import { TemplateError, TemplateErrorCode, errorHandler, withErrorHandling } from './error-handling';

// Template registry för caching
const templateCache = new Map<CVTemplateType, CVTemplate>();
const loadingPromises = new Map<CVTemplateType, Promise<CVTemplate>>();

// Template metadata för initial rendering (utan generateHTML funktion)
export const templateMetadata: Record<CVTemplateType, Omit<CVTemplate, 'generateHTML'>> = {
  'klassisk': {
    id: 'klassisk',
    name: 'Klassisk Premium',
    description: 'Elegant svensk företagstradition med moderna premium-detaljer för ledande positioner',
    category: 'Executive',
    bestFor: ['Finanssektorn', 'Juridik', 'Konsultverksamhet', 'Offentlig förvaltning', 'C-level positioner'],
    features: ['Swedish Executive Design', 'Premium Typography', 'Elegant Hierarchy', 'Trust Indicators'],
    colorSchemes: ['navy', 'charcoal', 'forest'],
    previewImage: '/images/cv-templates/klassisk-preview.png'
  },
  'modern': {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Elegant minimalistisk design för framgångsrika professionella inom alla branscher',
    category: 'Contemporary',
    bestFor: ['Konsultverksamhet', 'Marknadsföring', 'Projektledning', 'Affärsutveckling', 'Moderna företag', 'Startup'],
    features: ['Minimalistisk elegans', 'Visual hierarchy', 'Achievement focus', 'Clean typography', 'Professional impact'],
    colorSchemes: ['slate', 'teal', 'indigo', 'emerald'],
    previewImage: '/images/cv-templates/modern-preview.png'
  },
  'ats-optimerad': {
    id: 'ats-optimerad',
    name: 'ATS-Optimerad',
    description: 'Maximerad kompatibilitet med svenska ATS-system och rekryteringsverktyg',
    category: 'Technical',
    bestFor: ['Alla branscher', 'Stora företag', 'Multinationella bolag', 'ATS-system', 'Digital ansökan'],
    features: ['100% ATS-kompatibel', 'Parseable structure', 'Keyword optimization', 'System compatibility', 'Sweden optimized'],
    colorSchemes: ['professional', 'corporate', 'neutral'],
    previewImage: '/images/cv-templates/ats-preview.png'
  },
  'kreativ': {
    id: 'kreativ',
    name: 'Kreativ Professional',
    description: 'Balanserad kreativitet för designbranschen med professionell trovärdighet',
    category: 'Creative',
    bestFor: ['Grafisk design', 'Marknadsföring', 'Reklam', 'Webbdesign', 'UX/UI', 'Kreativa byråer'],
    features: ['Creative balance', 'Portfolio integration', 'Visual storytelling', 'Brand personality', 'Design showcase'],
    colorSchemes: ['creative', 'brand', 'vibrant', 'artistic'],
    previewImage: '/images/cv-templates/kreativ-preview.png'
  },
  'akademisk': {
    id: 'akademisk',
    name: 'Akademisk Excellence',
    description: 'Strukturerad design för forskare, akademiker och utbildningsväsendet',
    category: 'Academic',
    bestFor: ['Universitet', 'Forskning', 'Akademisk karriär', 'Utbildning', 'Vetenskapliga positioner'],
    features: ['Academic structure', 'Publication focus', 'Research emphasis', 'Scholarly presentation', 'Institution ready'],
    colorSchemes: ['academic', 'institution', 'scholarly', 'traditional'],
    previewImage: '/images/cv-templates/akademisk-preview.png'
  },
  'modern-tech': {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Teknisk excellens med modern design för utvecklare och IT-proffs',
    category: 'Technical',
    bestFor: ['Mjukvaruutveckling', 'IT', 'Tekniska roller', 'Startup', 'Tech-företag', 'Systemadministration'],
    features: ['Tech-focused', 'Skills visualization', 'Project showcase', 'Code-friendly', 'Innovation ready'],
    colorSchemes: ['tech', 'digital', 'innovation', 'modern'],
    previewImage: '/images/cv-templates/modern-tech-preview.png'
  }
};

// Dynamisk laddning av mallar
export async function loadTemplate(templateId: CVTemplateType): Promise<CVTemplate> {
  // Kolla cache först
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!;
  }

  // Kolla om redan laddas
  if (loadingPromises.has(templateId)) {
    return loadingPromises.get(templateId)!;
  }

  // Skapa loading promise
  const loadingPromise = async (): Promise<CVTemplate> => {
    try {
      let templateModule;
      
      switch (templateId) {
        case 'klassisk':
          templateModule = await import('./templates/klassisk');
          break;
        case 'modern':
          templateModule = await import('./templates/modern');
          break;
        case 'ats-optimerad':
          templateModule = await import('./templates/ats-optimerad');
          break;
        case 'kreativ':
          templateModule = await import('./templates/kreativ');
          break;
        case 'akademisk':
          templateModule = await import('./templates/akademisk');
          break;
        case 'modern-tech':
          templateModule = await import('./templates/modern-tech');
          break;
        default:
          throw new Error(`Unknown template: ${templateId}`);
      }

      // Hitta rätt export med förbättrad matchning
      let template: CVTemplate | undefined;
      
      // Specifika mappningar för template exports
      const exportMappings: Record<string, string> = {
        'modern': 'modernCVTemplate',
        'klassisk': 'klassiskCVTemplate', 
        'ats-optimerad': 'atsOptimeradCVTemplate',
        'kreativ': 'kreativCVTemplate',
        'akademisk': 'akademiskCVTemplate',
        'modern-tech': 'modernTechCVTemplate'
      };
      
      // Försök med specifik mappning först
      const expectedExportName = exportMappings[templateId];
      if (expectedExportName && (templateModule as any)[expectedExportName]) {
        template = (templateModule as any)[expectedExportName] as CVTemplate;
      } else {
        // Fallback: hitta första export som matchar
        const templateKey = Object.keys(templateModule).find(key => {
          const normalizedKey = key.toLowerCase().replace('cvtemplate', '');
          const normalizedId = templateId.replace('-', '').toLowerCase();
          return normalizedKey.includes(normalizedId) || normalizedId.includes(normalizedKey.replace(/template$/, ''));
        });
        
        if (templateKey) {
          template = (templateModule as any)[templateKey] as CVTemplate;
        }
      }
      
      if (!template) {
        throw new Error(`Template export not found for: ${templateId}. Available exports: ${Object.keys(templateModule).join(', ')}`);
      }
      
      // Cacha template
      templateCache.set(templateId, template);
      return template;
      
    } catch (error) {
      const templateError = new TemplateError(
        TemplateErrorCode.TEMPLATE_LOAD_FAILED,
        `Failed to load template ${templateId}`,
        { 
          templateId, 
          details: { originalError: (error as Error).message },
          retriable: true
        }
      );
      
      errorHandler.handleError(templateError);
      
      // Fallback till metadata-only template för graceful degradation
      const metadata = templateMetadata[templateId];
      if (!metadata) {
        throw new TemplateError(
          TemplateErrorCode.TEMPLATE_NOT_FOUND,
          `Template metadata not found for ${templateId}`,
          { templateId, retriable: false }
        );
      }
      
      const fallbackTemplate: CVTemplate = {
        ...metadata,
        generateHTML: () => {
          throw new TemplateError(
            TemplateErrorCode.GENERATION_FAILED,
            `Template ${templateId} är inte tillgänglig`,
            { templateId, retriable: true }
          );
        }
      };
      return fallbackTemplate;
    }
  };

  const promise = loadingPromise();
  loadingPromises.set(templateId, promise);

  try {
    const template = await promise;
    loadingPromises.delete(templateId);
    return template;
  } catch (error) {
    loadingPromises.delete(templateId);
    throw error;
  }
}

// Batch loading för flera mallar
export async function loadTemplates(templateIds: CVTemplateType[]): Promise<CVTemplate[]> {
  const promises = templateIds.map(id => loadTemplate(id));
  return Promise.all(promises);
}

// Preload funktion för kritiska mallar
export async function preloadPopularTemplates(): Promise<void> {
  const popularTemplates: CVTemplateType[] = ['modern', 'ats-optimerad', 'klassisk'];
  
  try {
    await loadTemplates(popularTemplates);
    console.log('Popular templates preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some templates:', error);
  }
}

// Få alla tillgängliga template metadata (utan att ladda full templates)
export function getAllTemplateMetadata(): Array<Omit<CVTemplate, 'generateHTML'>> {
  return Object.values(templateMetadata);
}

// Clear cache (för utveckling/debugging)
export function clearTemplateCache(): void {
  templateCache.clear();
  loadingPromises.clear();
}

// Cache statistik
export function getCacheStats() {
  return {
    cached: templateCache.size,
    loading: loadingPromises.size,
    available: Object.keys(templateMetadata).length
  };
}