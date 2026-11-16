/**
 * Kompatibilitetslager: dagens komponenter läser mallarna som SimpleTemplate.
 * Sedan mallsystemet 2026-11-16 kommer allt ur katalogen
 * (src/lib/cv/mallar/katalog.ts); byggagent C byter komponenterna mot
 * MallKort och då kan den här filen tas bort.
 *
 * Gamla mall-id löses med alias i getTemplateById och isTemplateFree, så att
 * ett sparat val eller en gammal länk aldrig ger "mallen finns inte".
 */
import { MALL_KATALOG, GRATIS_MALL_IDS, getMallKort } from './mallar/katalog'
import { losMallId } from './mallar/alias'
import type { MallKort } from './mallar/kontrakt'

export interface SimpleTemplate {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  category: 'modern' | 'traditional' | 'creative';
  tier: 'free' | 'premium';
  features?: {
    supportsPhoto?: boolean;
    supportsLinkedIn?: boolean;
    columns?: 1 | 2;
    /** Alla mallar i katalogen klarar ATS-testet (npm run test:ats). */
    atsSafe?: boolean;
  };
  metadata?: {
    suitableFor?: string[];
    strengths?: string[];
  };
}

function somSimple(k: MallKort): SimpleTemplate {
  return {
    id: k.id,
    name: k.namn,
    description: k.stil,
    imagePath: k.bild.stor,
    category: k.familj === 'konstnarlig' ? 'creative' : k.familj === 'en-spalt' ? 'traditional' : 'modern',
    tier: k.niva === 'gratis' ? 'free' : 'premium',
    features: {
      supportsPhoto: k.foto,
      supportsLinkedIn: true,
      columns: k.familj === 'sidospalt' ? 2 : 1,
      atsSafe: true,
    },
    metadata: { suitableFor: ['Alla yrken'], strengths: [k.stil, k.kort] },
  }
}

export const SIMPLE_TEMPLATES: SimpleTemplate[] = MALL_KATALOG.map(somSimple)

export function getTemplatesByCategory(category?: SimpleTemplate['category']): SimpleTemplate[] {
  if (!category) return SIMPLE_TEMPLATES;
  return SIMPLE_TEMPLATES.filter(template => template.category === category);
}

/** Mallen för ett id; gamla id ger sin efterföljare. */
export function getTemplateById(id: string): SimpleTemplate | undefined {
  const los = losMallId(id);
  return los ? SIMPLE_TEMPLATES.find(template => template.id === los) : undefined;
}

export { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT } from './template-antal';

/** Gratismallarna, ur katalogen. */
export const FREE_TEMPLATE_IDS: readonly string[] = GRATIS_MALL_IDS;

/** Ingår mallen i gratisnivån? Enda frågan vyer och rutter ska ställa. */
export function isTemplateFree(id: string): boolean {
  return getMallKort(losMallId(id))?.niva === 'gratis';
}
