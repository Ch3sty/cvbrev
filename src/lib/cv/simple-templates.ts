// Simple template system using static images
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
  };
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
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2
    }
  },
  {
    id: 'platinum-executive',
    name: 'Platinum Executive',
    description: 'Otroligt polerad design med LinkedIn-integration och flexibla layoutalternativ',
    imagePath: '/mallar/platinum-executive.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2
    }
  },
  {
    id: 'creative-minimal',
    name: 'Creative Minimal',
    description: 'Modern asymmetrisk design med horisontell header och clean estetik',
    imagePath: '/mallar/creative-minimal.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2
    }
  },
  {
    id: 'sidebar-icons',
    name: 'Sidopanel',
    description: 'Tydlig sidopanel med kontakt och kompetenser, modernt utseende',
    imagePath: '/mallar/sidebar-icons.svg',
    category: 'modern',
    tier: 'free',
    features: {
      columns: 2
    }
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial',
    description: 'Asymmetrisk magazine-layout med foto, LinkedIn och tidslinje',
    imagePath: '/mallar/editorial-magazine.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2
    }
  },
  {
    id: 'tidlos-formell',
    name: 'Tidlös',
    description: 'Klassisk formell mall för juridik, bank och offentlig sektor',
    imagePath: '/mallar/tidlos-formell.svg',
    category: 'traditional',
    tier: 'free',
    features: {
      columns: 1
    }
  },
  {
    id: 'konsult-kompakt',
    name: 'Konsulten',
    description: 'Kompakt premium-mall för seniora kandidater med foto och LinkedIn',
    imagePath: '/mallar/konsult-kompakt.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2
    }
  },
  {
    id: 'stack-developer',
    name: 'Stack',
    description: 'Modern utvecklarmall med kompetens-stack ovanför erfarenhet',
    imagePath: '/mallar/stack-developer.svg',
    category: 'modern',
    tier: 'free',
    features: {
      columns: 1
    }
  },
  {
    id: 'bold-modern',
    name: 'Bold',
    description: 'Stark typografisk hierarki med foto och LinkedIn för marknadsföring',
    imagePath: '/mallar/bold-modern.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 1
    }
  }
];

export function getTemplatesByCategory(category?: SimpleTemplate['category']): SimpleTemplate[] {
  if (!category) return SIMPLE_TEMPLATES;
  return SIMPLE_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): SimpleTemplate | undefined {
  return SIMPLE_TEMPLATES.find(template => template.id === id);
}