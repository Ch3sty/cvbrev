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
    /**
     * Markerar mallen som ATS-saker. ATS-sakra mallar har:
     *  - Inga clip-paths
     *  - Inga absolute positions for textinnehall
     *  - Standardrubriker (Arbetslivserfarenhet, Utbildning)
     *  - Vanliga typsnitt
     *  - Vanlig HTML-struktur som ATS-systemet kan lasa
     */
    atsSafe?: boolean;
  };
  /**
   * Rik metadata for den nya live-preview-vyn pa /dashboard/cv-mallar.
   * Anvands i MallInfoCard-komponenten for att hjalpa anvandaren valja ratt mall.
   */
  metadata?: {
    /** Yrken eller branscher mallen passar bast for. */
    suitableFor?: string[];
    /** 3-4 punkter "varfOr mallen ar bra". */
    strengths?: string[];
  };
}

export const SIMPLE_TEMPLATES: SimpleTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Ren, professionell design för alla branscher',
    imagePath: '/mallar/modern-minimal.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Alla yrken', 'Tjänstemän', 'Generell ansökan'],
      strengths: [
        'Ren layout som passar i alla branscher',
        'Lätt rubrik-struktur som ATS läser perfekt',
        'Fokus på innehållet, inte designen',
        'Snabb att skanna för rekryterare',
      ],
    },
  },
  {
    id: 'classic-professional',
    name: 'Klassisk Professionell',
    description: 'Traditionell svensk CV-mall med tydlig struktur',
    imagePath: '/mallar/classic-professional.svg',
    category: 'traditional',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Traditionella branscher', 'Tjänstemän', 'Administration'],
      strengths: [
        'Konventionell struktur som rekryterare känner igen',
        'ATS-säker layout utan grafiska element',
        'Passar bra för formella ansökningar',
      ],
    },
  },
  {
    id: 'clean-corporate',
    name: 'Ren Företagsstil',
    description: 'Perfekt för företag och affärsroller',
    imagePath: '/mallar/clean-corporate.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: true, columns: 2 },
    metadata: {
      suitableFor: ['Företagsroller', 'Säljare', 'Affärsutvecklare', 'Mid-level'],
      strengths: [
        'Mörkblå sidopanel signalerar trygghet',
        'Gold-accent ger premiumkänsla',
        'Strukturerad layout för fokus på resultat',
        'Tydlig typografisk hierarki',
      ],
    },
  },
  {
    id: 'creative-edge',
    name: 'Kreativ Profil',
    description: 'För kreativa yrken med subtil design-touch',
    imagePath: '/mallar/creative-edge.svg',
    category: 'creative',
    tier: 'premium',
    features: { atsSafe: false, columns: 1 },
    metadata: {
      suitableFor: ['Designers', 'Konstnärer', 'Kreativa yrken', 'Reklam'],
      strengths: [
        'Lila gradient-header signalerar kreativitet',
        'Diagonal clip-path ger visuell distinkt',
        'Färgaccenter på sektionsrubriker',
        'OBS: Mindre lämplig för aggressiva ATS-system',
      ],
    },
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Exklusiv design för ledande positioner',
    imagePath: '/mallar/executive-premium.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['VD', 'C-suite', 'Seniora ledare', 'Styrelseroller'],
      strengths: [
        'Navy-header med gold-accent ger gravitas',
        'Georgia serif signalerar tradition och vikt',
        'Ren layout med fokus på prestige',
        'Lämplig för executive search',
      ],
    },
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
      columns: 2,
      atsSafe: false,
    },
    metadata: {
      suitableFor: ['Nordic-branscher', 'Hållbarhet', 'Klimat', 'Konsulter'],
      strengths: [
        'Skandinavisk minimalism med karaktär',
        'Mörk grön sidopanel signalerar pålitlighet',
        'Hexagon-pattern ger unikt visuellt djup',
        'OBS: Clip-path-element kan förvirra vissa ATS',
      ],
    },
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
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Executive', 'Seniora roller', 'Konsulter', 'Ledning'],
      strengths: [
        'Navy-header med gold-accent och foto',
        'LinkedIn-badge integrerad i header',
        'Premium-känsla utan att tappa läsbarhet',
        'Foto + kontakt sida vid sida',
      ],
    },
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
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Designers', 'UX/UI', 'Kreativa konsulter', 'Marknadsföring'],
      strengths: [
        'Asymmetrisk layout sticker ut visuellt',
        'Horisontell header med foto + namn',
        'Subtil lila-accent matchar moderna profiler',
        'Bra balans mellan kreativ och professionell',
      ],
    },
  },
  {
    id: 'sidebar-icons',
    name: 'Sidopanel',
    description: 'Tydlig sidopanel med kontakt och kompetenser, modernt utseende',
    imagePath: '/mallar/sidebar-icons.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 2 },
    metadata: {
      suitableFor: ['Tjänstemän', 'Mid-career', 'Administration', 'Kommunikation'],
      strengths: [
        'Tydlig sidopanel separerar kontakt från innehåll',
        'Inline SVG-ikoner ger modernt intryck',
        'Orange-accenter matchar varumärkesfärgen',
        'Bra för användare med många kompetenser',
      ],
    },
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
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Marknadsförare', 'Brand managers', 'Content creators', 'PR'],
      strengths: [
        'Magazine-layout med stark typografisk hierarki',
        'Sammanfattning som blockquote i serif-stil',
        'Tidslinje på erfarenheter ger visuell rytm',
        'Foto + LinkedIn ger personlig touch',
      ],
    },
  },
  {
    id: 'tidlos-formell',
    name: 'Tidlös',
    description: 'Klassisk formell mall för juridik, bank och offentlig sektor',
    imagePath: '/mallar/tidlos-formell.svg',
    category: 'traditional',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Juridik', 'Bank', 'Försäkring', 'Offentlig sektor', 'Akademi'],
      strengths: [
        'Centrerad symmetri signalerar formalitet',
        'Garamond serif ger tradition och tyngd',
        'Sektionsrubriker omgivna av tunna linjer',
        'Tidlös design som inte daterar sig',
      ],
    },
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
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Konsulter', 'Seniora kandidater', 'Management', '8+ års erfarenhet'],
      strengths: [
        'Kompakt 12.5px body — får plats med 8+ jobb',
        'Mörkblå-grå sidopanel signalerar professionalism',
        'Foto + LinkedIn integrerade snyggt',
        'Tät rad-spacing utan att kännas crammad',
      ],
    },
  },
  {
    id: 'stack-developer',
    name: 'Stack',
    description: 'Modern utvecklarmall med kompetens-stack ovanför erfarenhet',
    imagePath: '/mallar/stack-developer.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Utvecklare', 'DevOps', 'Data engineers', 'Tech leads'],
      strengths: [
        'Kompetens-grid (3 kol) ovanför erfarenhet — skill-first',
        'Mono-font på datum och meta ger dev-känsla',
        'Cyan accent matchar tech-estetik',
        'Skriven för utvecklare av utvecklare',
      ],
    },
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
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Marknadsförare', 'Brand managers', 'Content', 'Copywriters'],
      strengths: [
        'Stort namn (44px) på två rader — visuell statement',
        'Tjock svart divider som typografisk ankare',
        'Magazine-stil dubbel-divider mellan sektioner',
        'Mycket whitespace, designad känsla',
      ],
    },
  },
  {
    id: 'student-startup',
    name: 'Student',
    description: 'För studenter och nyexaminerade — utbildning först, projekt och praktik',
    imagePath: '/mallar/student-startup.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Studenter', 'Nyexaminerade', '0-2 års erfarenhet', 'Sommarjobb'],
      strengths: [
        'Utbildning först — anpassad för få jobb i CV',
        'Egen sektion för projekt och praktik',
        '"Praktik & Arbetslivserfarenhet" istället för bara erfarenhet',
        'Cyan accent — utbildningsfärg, ej corporate',
      ],
    },
  },
  {
    id: 'varden-omsorg',
    name: 'Vården',
    description: 'Designad för vård och omsorg med legitimationer först och kompetensområden',
    imagePath: '/mallar/varden-omsorg.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Sjuksköterskor', 'Undersköterskor', 'Fysioterapeuter', 'Vården'],
      strengths: [
        'Legitimationer först i sidopanelen — det viktigaste syns',
        'Salviegrön sidopanel — vårdens färgspråk',
        '"Klinisk erfarenhet" istället för "Arbetslivserfarenhet"',
        'Auto-genererad lista över unika arbetsplatser',
      ],
    },
  },
];

export function getTemplatesByCategory(category?: SimpleTemplate['category']): SimpleTemplate[] {
  if (!category) return SIMPLE_TEMPLATES;
  return SIMPLE_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): SimpleTemplate | undefined {
  return SIMPLE_TEMPLATES.find(template => template.id === id);
}
