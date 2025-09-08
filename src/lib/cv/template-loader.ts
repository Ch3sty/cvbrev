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
    name: 'Klassisk Svensk',
    description: 'Traditionell kronologisk layout som följer svenska CV-standarder. Perfekt för konservativa branscher och erfarna yrkespersoner.',
    designStyle: 'Tidlös professionalitet med högre trovärdighet',
    visualFeatures: ['Enspaltig layout med klassisk hierarki', 'Diskret pink-accent för elegant touch', 'Standardiserade svenska rubriker', 'Optimal läsbarhet med Helvetica', 'ATS-kompatibel struktur'],
    features: ['Följer Arbetsförmedlingens riktlinjer', '1-2 sidor enligt svenska normer', 'Kronologisk erfarenhetsstruktur', 'Professionell sammanfattning', 'Svenska datumformat', 'Referenser på begäran', 'GDPR-kompatibel'],
    colorSchemes: ['blue', 'navy', 'purple'],
    previewImage: '/images/cv-templates/klassisk-preview.jpg'
  },
  'modern': {
    id: 'modern',
    name: 'Modern Tvåkolumns',
    description: '70/30 split layout med sidokolumn för kontaktuppgifter och kompetenser. Perfekt balans mellan innovation och professionalitet.',
    designStyle: 'Dynamisk professionalism med visuell effektivitet',
    visualFeatures: ['70/30 split med huvudinnehåll och accent-kolumn', 'Gradient header för modern känsla', 'Progress bars för kompetensvisualisering', 'Diskret navy-50 bakgrund i sidokolumn', 'Ikoner för snabb visuell igenkänning'],
    features: ['Optimerad för moderna branscher', 'Visuell hierarki med färgkodning', 'Kompakt informationspresentation', 'Skalbar för olika innehållsmängder', 'Mobile-responsive struktur', 'ATS-kompatibel trots avancerad design'],
    colorSchemes: ['blue', 'navy', 'purple'],
    previewImage: '/images/cv-templates/modern-preview.jpg'
  },
  'minimalistisk': {
    id: 'minimalistisk',
    name: 'Minimalistisk Premium',
    description: 'Sofistikerad enkelhet med maximal visuell impact. Perfect för senior roller och konservativa branscher som kräver elegans.',
    designStyle: 'Less-is-more luxury med maximal läsbarhet',
    visualFeatures: ['Generösa 20mm marginaler för luftighet', 'Endast Navy-900, Navy-600 och Pink-500', 'Helvetica Neue Light/Regular mix', 'Större punktstorlekar för premium-känsla', 'Strategiska indrag utan störande element'],
    features: ['Maximal läsbarhet och professionalism', 'Snabbare att uppdatera och anpassa', 'Fungerar perfekt i alla branscher', 'Aldrig går ur stil - tidlös design', 'Fokuserar på innehåll över form', 'Premium utan att verka överdrivet', 'ATS-vänlig genom enkelhet'],
    colorSchemes: ['minimalist'],
    previewImage: '/images/cv-templates/minimalist-preview.jpg'
  },
  'ats-optimerad': {
    id: 'ats-optimerad',
    name: 'ATS-Optimerad',
    description: 'Maximerad kompatibilitet med svenska ATS-system och rekryteringsverktyg',
    designStyle: 'ATS-Optimerad Premium',
    visualFeatures: ['100% ATS-Kompatibel', 'Strukturerad Layout', 'HR-Vänlig Design', 'Premium Finish'],
    features: ['100% ATS-kompatibel', 'Parseable structure', 'Keyword optimization', 'System compatibility', 'Sweden optimized'],
    colorSchemes: ['professional', 'corporate', 'neutral'],
    previewImage: '/images/cv-templates/ats-preview.png'
  },
  'kreativ': {
    id: 'kreativ',
    name: 'Kreativ Professional',
    description: 'Balanserad kreativitet för designbranschen med professionell trovärdighet',
    designStyle: 'Kreativ Premium',
    visualFeatures: ['Visuell Impact', 'Premium Kreativitet', 'Balanserad Elegans', 'Svensk Design'],
    features: ['Creative balance', 'Portfolio integration', 'Visual storytelling', 'Brand personality', 'Design showcase'],
    colorSchemes: ['creative', 'brand', 'vibrant', 'artistic'],
    previewImage: '/images/cv-templates/kreativ-preview.png'
  },
  'akademisk': {
    id: 'akademisk',
    name: 'Akademisk Excellence',
    description: 'Strukturerad design för forskare, akademiker och utbildningsväsendet',
    designStyle: 'Akademisk Elegans',
    visualFeatures: ['Sofistikerad Layout', 'Expertis-Fokus', 'Klassisk Elegans', 'Professionell Trovärdighet'],
    features: ['Academic structure', 'Publication focus', 'Research emphasis', 'Scholarly presentation', 'Institution ready'],
    colorSchemes: ['academic', 'institution', 'scholarly', 'traditional'],
    previewImage: '/images/cv-templates/akademisk-preview.png'
  },
  'modern-tech': {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Professionell och ren design optimerad för tekniska roller. Balanserar modern estetik med svensk formell standard.',
    designStyle: 'Modern Professionalism',
    visualFeatures: ['Ren tvåkolumns layout', 'Diskret färgaccent', 'Professionell typografi', 'PDF-optimerad struktur'],
    features: ['Tech-optimerad', 'ATS-kompatibel', 'Svenska standarder', 'PDF-vänlig', 'Mobil-responsiv'],
    colorSchemes: ['tech-blue', 'professional-navy', 'modern-slate', 'innovation-purple'],
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
          templateModule = await import('./templates/klassisk-svenska');
          break;
        case 'modern':
          templateModule = await import('./templates/modern-svenska');
          break;
        case 'minimalistisk':
          templateModule = await import('./templates/minimalist-svenska');
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
        'modern': 'modernSvenskaTemplate',
        'klassisk': 'klassiskSvenskaTemplate',
        'minimalistisk': 'minimalistSvenskaTemplate',
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