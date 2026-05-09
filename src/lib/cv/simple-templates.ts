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
  // === Nya mallar (maj 2026) - ersatter de gamla 8 ===
  {
    id: 'norrsken',
    name: 'Norrsken',
    description: 'Ren minimal mall med subtila orange-detaljer för alla branscher',
    imagePath: '/mallar/norrsken.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Alla yrken', 'Tjänstemän', 'Generell ansökan'],
      strengths: [
        'Ren enspaltig layout som passar i alla branscher',
        'Subtil orange-accent på sektionsrubriker matchar varumärket',
        'Lätta divider-linjer mellan jobb ger luftig läsbarhet',
        'ATS-säker — inga clip-paths eller absolutpositioner',
      ],
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Resultat-första premium-mall för säljare, affärsutveckling och finans',
    imagePath: '/mallar/aurora.svg',
    category: 'modern',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Säljare', 'Affärsutvecklare', 'Account Managers', 'Finance', 'Controller'],
      strengths: [
        '"Nyckelresultat"-panel lyfter dina kvantifierade siffror',
        'Subtil emerald → orange gradient signalerar tillväxt',
        '65/35 layout med fokus på erfarenhet + KPI:er',
        'Foto + LinkedIn integrerade i header',
      ],
    },
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'Centrerad serif-mall för executive och styrelseroller',
    imagePath: '/mallar/atlas.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['VD', 'C-suite', 'Styrelseroller', 'Executive search'],
      strengths: [
        'Centrerad serif-header med "EXECUTIVE PROFILE"-eyebrow',
        'Playfair Display + gold-accent ger gravitas',
        'Justerad text och dubbel-linje signalerar tradition',
        'Inga foton — namn-driven CV som executive search vill ha',
      ],
    },
  },
  {
    id: 'galleri',
    name: 'Galleri',
    description: 'Designermall med rektangulärt foto, tools-grid och peach-accenter',
    imagePath: '/mallar/galleri.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Designers', 'UX/UI', 'Art directors', 'Kreativa konsulter'],
      strengths: [
        'Rektangulärt foto + Fraunces serif ger portfolio-känsla',
        'Tre-kolumns tools-grid visar verktygs-stack visuellt',
        'Peach-accent och italic-blockquote för designerstil',
        'Asymmetriskt men ATS-säkert (inga clip-paths)',
      ],
    },
  },
  // === Befintliga mallar ===
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
