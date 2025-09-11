// Simple template system using static images
export interface SimpleTemplate {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  category: 'modern' | 'traditional' | 'creative';
  tier: 'free' | 'premium';
}

export const SIMPLE_TEMPLATES: SimpleTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Ren, professionell design för alla branscher',
    imagePath: '/mallar/modern-minimal.svg',
    category: 'modern',
    tier: 'free'
  },
  {
    id: 'classic-professional',
    name: 'Klassisk Professionell',
    description: 'Traditionell svensk CV-mall med tydlig struktur',
    imagePath: '/mallar/classic-professional.svg',
    category: 'traditional',
    tier: 'free'
  },
  {
    id: 'clean-corporate',
    name: 'Ren Företagsstil',
    description: 'Perfekt för företag och affärsroller',
    imagePath: '/mallar/clean-corporate.svg',
    category: 'modern',
    tier: 'premium'
  },
  {
    id: 'creative-edge',
    name: 'Kreativ Profil',
    description: 'För kreativa yrken med subtil design-touch',
    imagePath: '/mallar/creative-edge.svg',
    category: 'creative',
    tier: 'premium'
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Exklusiv design för ledande positioner',
    imagePath: '/mallar/executive-premium.svg',
    category: 'traditional',
    tier: 'premium'
  },
  {
    id: 'nordic-professional',
    name: 'Nordic Professional',
    description: 'Skandinavisk elegans med naturinspirerade accenter',
    imagePath: '/mallar/nordic-professional.svg',
    category: 'modern',
    tier: 'premium'
  },
  {
    id: 'platinum-executive',
    name: 'Platinum Executive',
    description: 'Otroligt polerad design med LinkedIn-integration och flexibla layoutalternativ',
    imagePath: '/mallar/platinum-executive.svg',
    category: 'traditional',
    tier: 'premium'
  },
  {
    id: 'creative-minimal',
    name: 'Creative Minimal',
    description: 'Modern asymmetrisk design med horisontell header och clean estetik',
    imagePath: '/mallar/creative-minimal.svg',
    category: 'creative',
    tier: 'premium'
  }
];

export function getTemplatesByCategory(category?: SimpleTemplate['category']): SimpleTemplate[] {
  if (!category) return SIMPLE_TEMPLATES;
  return SIMPLE_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): SimpleTemplate | undefined {
  return SIMPLE_TEMPLATES.find(template => template.id === id);
}