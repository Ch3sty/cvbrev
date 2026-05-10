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
        'Centrerad serif-header med Playfair Display ger gravitas',
        'Subtil gold-accent och dubbel-linje signalerar tradition',
        'Justerad text för formell presentation',
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
  // === Andra omgangen nya (maj 2026 vol. 2) ===
  {
    id: 'pedagog',
    name: 'Pedagog',
    description: 'Premium-mall för lärare och pedagoger med behörigheter och kompetensområden',
    imagePath: '/mallar/pedagog.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Lärare', 'Förskollärare', 'Gymnasielärare', 'Pedagogiska ledare', 'Skola'],
      strengths: [
        'Salviegrön sidopanel — varm och pedagogisk färg',
        '"Pedagogisk erfarenhet" istället för arbetslivserfarenhet',
        'Behörigheter och legitimation överst i sidopanelen',
        'Auto-genererad lista över skolor och lärosäten',
      ],
    },
  },
  {
    id: 'aspekt',
    name: 'Aspekt',
    description: 'Bred premium-mall för tjänstemän, ingenjörer, ekonomer och HR med foto',
    imagePath: '/mallar/aspekt.svg',
    category: 'modern',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Ekonomer', 'Controllers', 'HR', 'Ingenjörer', 'Projektledare', 'Alla branscher'],
      strengths: [
        'Bred professional-mall — passar alla yrken som vill ha foto',
        '"Fokusområden"-pills lyfter dina kärnkompetenser',
        'Slate-blå accent signalerar trygghet och kompetens',
        'Source Serif Pro rubriker + Inter body ger balans',
      ],
    },
  },
  {
    id: 'klinik',
    name: 'Klinik',
    description: 'Premium-mall för läkare med specialistbevis, kompetensområden och publikationer',
    imagePath: '/mallar/klinik.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: false,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Specialistläkare', 'ST-läkare', 'AT-läkare', 'Överläkare', 'Klinikchefer'],
      strengths: [
        'Centrerad serif-header signalerar akademisk prestige',
        'Höger panel för legitimation, kompetensområden och publikationer',
        '"Klinisk tjänstgöring" istället för arbetslivserfarenhet',
        'Burgundy-accent — vetenskaplig utan att vara kall',
      ],
    },
  },
  {
    id: 'skymning',
    name: 'Skymning',
    description: 'Premium-mall med mörk header — för personliga varumärken och founders',
    imagePath: '/mallar/skymning.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Founders', 'Tech-leaders', 'Personliga varumärken', 'Senior managers', 'Entreprenörer'],
      strengths: [
        'Mörk navy-header sticker ut visuellt mot ljusa CV:n',
        'Orange gradient-linje binder ihop header och body',
        'Fraunces serif på namn ger statement-känsla',
        'ATS-säker — mörk header är bara CSS-bakgrund',
      ],
    },
  },
  // === Femte omgangen nya (maj 2026 vol. 5) - yrkesgruppmallar ===
  {
    id: 'disk',
    name: 'Disk',
    description: 'Gratis CV-mall för butik, kassa och kundnära service',
    imagePath: '/mallar/disk.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Butiksbiträde', 'Butikssäljare', 'Kassörska', 'Kundtjänst', 'Hotellvärd', 'Receptionist'],
      strengths: [
        '"Försäljningsresultat"-banner överst lyfter dina kvantifierade siffror',
        'Energisk emerald-accent matchar handelns DNA',
        'Kompakt en-kolumn för flexibilitet (deltid och säsong vanligt)',
        'ATS-säker med tydliga rubriker för rekryteringssystem',
      ],
    },
  },
  {
    id: 'logistik',
    name: 'Logistik',
    description: 'Gratis CV-mall för lager, logistik och transport',
    imagePath: '/mallar/logistik.svg',
    category: 'traditional',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Lagerarbetare', 'Truckförare', 'Logistiker', 'Lagerchef', 'Terminalarbetare'],
      strengths: [
        '"Behörigheter & körkort"-block direkt efter header — det rekryterare först söker efter',
        'Industriell typografi (Roboto) signalerar branschen',
        'Cyan-accent och kondenserad layout för robust läsbarhet',
        'WMS-system och certifikat lyfts som egen sektion',
      ],
    },
  },
  {
    id: 'verkstad',
    name: 'Verkstad',
    description: 'Gratis CV-mall för industri, maskin och produktion',
    imagePath: '/mallar/verkstad.svg',
    category: 'traditional',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Ingenjör', 'Automationsingenjör', 'Konstruktör', 'Produktionsledare'],
      strengths: [
        'Mörk grafit-accent (#374151) signalerar industri och precision',
        '"Tekniska system & CAD"-sektion lyfter PLC, SCADA, SolidWorks',
        '"Standarder & certifikat"-block med ISO, CE, ATEX',
        'Mono-font på datum för precisions-känsla',
      ],
    },
  },
  {
    id: 'myndighet',
    name: 'Myndighet',
    description: 'Gratis CV-mall för offentlig sektor och myndighetsutövning',
    imagePath: '/mallar/myndighet.svg',
    category: 'traditional',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Handläggare', 'LSS-handläggare', 'Socialsekreterare', 'Administratör', 'Kontorsassistent'],
      strengths: [
        'Konservativ navy + svartvit signalerar saklighet',
        '"Lagstiftning & metoder"-sektion (LSS, SoL, OSL, BBIC, IBIC)',
        '§-symboler i bullets påminner om förvaltningsrätt',
        'Sober Source Sans utan extra-grafik',
      ],
    },
  },
  {
    id: 'konto',
    name: 'Konto',
    description: 'Gratis CV-mall för ekonomi, redovisning och finans',
    imagePath: '/mallar/konto.svg',
    category: 'modern',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Ekonomiassistent', 'Redovisningsekonom', 'Controller', 'Ekonom', 'HR-specialist'],
      strengths: [
        'Strukturerad tabell-layout med tabular-nums för siffror',
        'Mörkblå (#1e3a8a) signalerar bank och finans',
        '"Redovisningssystem"-sektion (Visma, Fortnox, SAP, Hogia)',
        'Dubbel-divider under header — bokslut-känsla',
      ],
    },
  },
  // === Sjatte omgangen nya (maj 2026 vol. 6) - premium plus-mallar ===
  {
    id: 'disk-plus',
    name: 'Disk Plus',
    description: 'Premium-mall för butik och frontline med foto, magazine-känsla och customer voice-block',
    imagePath: '/mallar/disk-plus.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: false, columns: 2, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Butikschef', 'Senior butikssäljare', 'Hotellvärd', 'Storesales manager'],
      strengths: [
        'Foto-banner överst med diagonal emerald-magenta accent',
        'Två-kolumn body med "Customer voice"-blockquote i sidopanel',
        'Fraunces serif på rubriker ger magazine-känsla',
        'LinkedIn-rad integrerad i header',
      ],
    },
  },
  {
    id: 'logistik-plus',
    name: 'Logistik Plus',
    description: 'Premium-mall för lager och logistik med dark header och cyan-accent',
    imagePath: '/mallar/logistik-plus.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: false, columns: 1, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Lagerchef', 'Logistikchef', 'Senior truckförare', 'Terminalansvarig'],
      strengths: [
        'Mörkt grafit-band (#0f172a) över hela headern signalerar industri-DNA',
        'Cyan-ringat foto i hörnet och tabellär arbetslivshistorik',
        '"Behörigheter & körkort"-block i body för WMS, truck, körkort',
        'LinkedIn-stöd för chefroller',
      ],
    },
  },
  {
    id: 'verkstad-plus',
    name: 'Verkstad Plus',
    description: 'Premium-mall för ingenjörer med blueprint-grid och två-kolumn-layout',
    imagePath: '/mallar/verkstad-plus.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: false, columns: 2, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Senior ingenjör', 'Konstruktionschef', 'Automationsingenjör', 'Produktionschef'],
      strengths: [
        'Blueprint-grid CSS-bakgrund i header signalerar konstruktion',
        'Rektangulärt foto med offset-skugga ger teknisk ram',
        'Två-kolumn body med "Verktygs-stack" som sidopanel',
        'Strukturerad steel-blue + grafit accent-mix',
      ],
    },
  },
  {
    id: 'myndighet-plus',
    name: 'Myndighet Plus',
    description: 'Premium-mall för offentlig sektor med centrerad serif-header och guld-accent',
    imagePath: '/mallar/myndighet-plus.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: false, columns: 2, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Senior handläggare', 'Enhetschef offentlig sektor', 'Förvaltningschef', 'Utredare'],
      strengths: [
        'Centrerad Source Serif Pro-header signalerar prestige',
        'Tunt guld-accent-band (#a88b5c) komplement till navy',
        'Två-kolumn body med "Volymsstatistik"-blockquote',
        'Justerad text och formell läsbarhet',
      ],
    },
  },
  {
    id: 'konto-plus',
    name: 'Konto Plus',
    description: 'Premium-mall för ekonomi och finans med tre-kolumns header och nyckeltal',
    imagePath: '/mallar/konto-plus.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: false, columns: 1, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Controller', 'CFO', 'Senior redovisningsekonom', 'Auktoriserad revisor', 'HR-chef'],
      strengths: [
        'Tre-kolumns header med foto i centrum och snabbfakta höger',
        'Linear-gradient-bar (navy → emerald) under header',
        'Snabbfakta-rad med 3 kvantifierade nyckeltal (extraheras automatiskt)',
        'Tabellär kolumn-layout för siffror, mono-font på datum',
      ],
    },
  },
  {
    id: 'norrsken-plus',
    name: 'Norrsken Plus',
    description: 'Premium-uppgradering av Norrsken med foto-ring, gradient-namn och profil-block',
    imagePath: '/mallar/norrsken-plus.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: false, columns: 2, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Senior generalist', 'Mellannivå-chef', 'Konsult', 'Erfaren projektledare'],
      strengths: [
        'Foto med orange-magenta gradient-ring som ramar in',
        'Namn med gradient-text-clip från grafit till magenta',
        '"Personlig profil"-block i orange tint matchar GSC-keyword',
        'Två-kolumn body med "Snabbfakta" i sidopanel',
      ],
    },
  },
  {
    id: 'tidlos-plus',
    name: 'Tidlös Plus',
    description: 'Premium-uppgradering av Tidlös med Garamond serif, ornament och burgundy-accent',
    imagePath: '/mallar/tidlos-plus.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: false, columns: 1, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Advokat', 'Domare', 'Senior chef', 'Akademiker', 'Auktoriserad revisor'],
      strengths: [
        'Garamond serif body ger formell akademisk-känsla',
        'Foto med tunn burgundy-ram (#7c2d12) som komplement till svart',
        '"— § —"-ornament mellan header och sammanfattning',
        'Box-shadow trick för dubbel-linje under header',
      ],
    },
  },
  {
    id: 'stack-plus',
    name: 'Stack Plus',
    description: 'Premium-uppgradering av Stack med teknik-pill-banner och två-kolumn-layout',
    imagePath: '/mallar/stack-plus.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: false, columns: 2, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Senior utvecklare', 'Tech lead', 'DevOps engineer', 'Software architect'],
      strengths: [
        'Fyrkantigt foto med cyan-ram signalerar tech-DNA',
        '"Stack //"-pill-banner med teknologi-tags i monospace',
        'Två-kolumn body med "Verktyg & övrigt" i sidopanel',
        'Tightare typografi för senior-utvecklarroller',
      ],
    },
  },
  {
    id: 'hantverkare-plus',
    name: 'Hantverkare Plus',
    description: 'Premium-uppgradering av Hantverkare med foto, projektportfölj och dubbel-accent',
    imagePath: '/mallar/hantverkare-plus.svg',
    category: 'traditional',
    tier: 'premium',
    features: { atsSafe: false, columns: 1, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Arbetsledare bygg', 'Snickeri-egenföretagare', 'Byggchef', 'Senior elektriker'],
      strengths: [
        'Foto med orange-ram för kund-frontline-roller',
        'Dubbel-accent: 4px orange + 4px grafit under header',
        '"Projekt & arbetsplatser"-pill-rad ger portfolio-känsla',
        'Större typografisk skala för chefroller',
      ],
    },
  },
  {
    id: 'student-plus',
    name: 'Student Plus',
    description: 'Premium-uppgradering av Student med foto, drömjobb-eyebrow och utbildning först',
    imagePath: '/mallar/student-plus.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: false, columns: 1, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Student', 'Examen-student', 'Junior med portfolio', 'Trainee'],
      strengths: [
        'Foto med cyan-ram och Fraunces-serif på namn ger statement',
        '"Söker · {drömjobb}"-eyebrow visar målroll direkt',
        'Utbildning först — placerar din meriter där rekryteraren tittar',
        'LinkedIn integrerad i header',
      ],
    },
  },
  {
    id: 'sidopanel-plus',
    name: 'Sidopanel Plus',
    description: 'Premium-uppgradering av Sidopanel med foto, profilblock och orange-magenta accent',
    imagePath: '/mallar/sidopanel-plus.svg',
    category: 'modern',
    tier: 'premium',
    features: { atsSafe: false, columns: 2, supportsPhoto: true, supportsLinkedIn: true },
    metadata: {
      suitableFor: ['Generalist med profil', 'Erfaren konsult', 'Mellannivå-roll', 'Servicechef'],
      strengths: [
        'Cirkulärt foto i sidopanel med gradient-ring (orange → magenta)',
        'Fraunces serif på rubriker ger magazine-känsla',
        '"Personlig profil"-blockquote i body matchar GSC-keyword',
        'Orange + magenta accent-mix istället för bara orange',
      ],
    },
  },
  // === Tredje omgangen nya (maj 2026 vol. 3) ===
  {
    id: 'bygg',
    name: 'Hantverkare',
    description: 'Gratis CV-mall för hantverkare och bygg med behörigheter och certifikat',
    imagePath: '/mallar/bygg.svg',
    category: 'traditional',
    tier: 'free',
    features: { atsSafe: true, columns: 1 },
    metadata: {
      suitableFor: ['Snickare', 'Elektriker', 'VVS', 'Målare', 'Plåtslagare', 'Byggarbetare'],
      strengths: [
        'Behörigheter & körkort i framträdande block direkt efter sammanfattning',
        'Auto-genererad pill-rad över arbetsplatser och projekt',
        '"Yrkeserfarenhet" istället för arbetslivserfarenhet — mer naturligt',
        'Tjock orange-accent under header signalerar yrkes-DNA',
      ],
    },
  },
  {
    id: 'forskare',
    name: 'Forskare',
    description: 'Premium-mall för forskare och doktorander med publikationer och stipendier',
    imagePath: '/mallar/forskare.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: false,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Doktorander', 'Postdocs', 'Forskningsledare', 'Professorer', 'Lektorer'],
      strengths: [
        'Centrerad serif-header följer akademisk konvention',
        '"Forskningserfarenhet" och 65/35 layout för publikationer i sidopanel',
        'Auto-genererad sektion "Senaste publikationer" från projekt-data',
        'Subtil indigo-accent — akademisk auktoritet utan att vara stiff',
      ],
    },
  },
  {
    id: 'servering',
    name: 'Servering',
    description: 'Premium-mall för restaurang, hotell och service med språk och diplom i fokus',
    imagePath: '/mallar/servering.svg',
    category: 'modern',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Kockar', 'Servitörer', 'Baristas', 'Hovmästare', 'Hotell', 'Restaurangchefer'],
      strengths: [
        'Champagne-färgad sidopanel ger gastronomi-vibe utan klyschor',
        'Språk högst upp i sidopanelen — kritiskt för service-yrken',
        '"Branscherfarenhet" istället för arbetslivserfarenhet',
        'Auto-genererad lista över unika restauranger och hotell',
      ],
    },
  },
  {
    id: 'linje',
    name: 'Linje',
    description: 'Minimalistisk Swiss-design — helt monokrom, ingen accentfärg',
    imagePath: '/mallar/linje.svg',
    category: 'modern',
    tier: 'premium',
    features: {
      supportsPhoto: false,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Arkitekter', 'Design leads', 'Redaktörer', 'Intellektuella roller'],
      strengths: [
        'Helt monokrom — bara svart, vit och två gråtoner',
        'Asymmetrisk header med vertikal divider mellan namn och kontakt',
        'Helvetica Neue + hairline-linjer i klassisk Swiss-stil',
        'Sticker ut genom att INTE sticka ut — innehållet talar',
      ],
    },
  },
  // === Fjarde omgangen nya (maj 2026 vol. 4) - djarva visuella val ===
  {
    id: 'spektrum',
    name: 'Spektrum',
    description: 'Premium-mall med levande gradient-sidopanel — för marknadsförare och kreativa',
    imagePath: '/mallar/spektrum.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Marknadsförare', 'Content creators', 'Sociala medier-strateger', 'Kreativa entreprenörer'],
      strengths: [
        'Levande gradient (orange → magenta → lila) fyller hela sidopanelen',
        'Sektion-rubriker har gradient-text för extra punch',
        'Sticker ut visuellt utan att tappa professionalism',
        'Foto + LinkedIn integrerade i färgexplosionen',
      ],
    },
  },
  {
    id: 'kvist',
    name: 'Kvist',
    description: 'Premium-mall med skogsgrön header — för hållbarhet, klimat och cleantech',
    imagePath: '/mallar/kvist.svg',
    category: 'traditional',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Hållbarhetschefer', 'Klimatanalytiker', 'Miljökonsulter', 'ESG-roller', 'Cleantech'],
      strengths: [
        'Mörk skogsgrön header-band signalerar natur och tillväxt',
        'Egen sektion för "Hållbarhetsprojekt" lyfter ditt impact-arbete',
        'Subtil grön gradient och organiska bullets ger naturkänsla',
        'Foto + LinkedIn integrerade i den gröna headern',
      ],
    },
  },
  {
    id: 'magasin',
    name: 'Magasin',
    description: 'Premium tidnings-cover-mall med stort foto och dramatisk serif-typografi',
    imagePath: '/mallar/magasin.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 2,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Mediepersoner', 'Journalister', 'Författare', 'Redaktörer', 'Personliga varumärken'],
      strengths: [
        'Stort foto 220×280 ger tidnings-cover-känsla',
        'Playfair Display 48px namn — dramatisk serif-statement',
        'Mörkröd accent och mono-font på meta för editorial-DNA',
        'Sammanfattning som blockquote — tidnings-prosa',
      ],
    },
  },
  {
    id: 'karta',
    name: 'Karta',
    description: 'Premium-mall med timeline och kompetensstaplar — för data, BI och konsulter',
    imagePath: '/mallar/karta.svg',
    category: 'modern',
    tier: 'premium',
    features: {
      supportsPhoto: true,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Data analysts', 'Konsulter', 'Projektledare', 'Business intelligence', 'Tech leads'],
      strengths: [
        'Erfarenhet renderad som timeline med datum-prickar',
        'Kompetenser visualiserade som 5-pricks-staplar',
        'Cyan-accent och mono-font signalerar datavisualisering',
        'Geometriska header-block och triangel-bullets för struktur',
      ],
    },
  },
  {
    id: 'avtryck',
    name: 'Avtryck',
    description: 'Premium retro-mall med cream-bakgrund, ramning och vintage-typografi',
    imagePath: '/mallar/avtryck.svg',
    category: 'creative',
    tier: 'premium',
    features: {
      supportsPhoto: false,
      supportsLinkedIn: true,
      columns: 1,
      atsSafe: true,
    },
    metadata: {
      suitableFor: ['Författare', 'Akademiker', 'Gallerister', 'Kulturarbetare', 'Formgivare'],
      strengths: [
        'Cream/elfenben bakgrund — ingen rent vit yta',
        'Decorative dubbel-ramning runt hela CV:t',
        'Fraunces serif + ornament (◆, ✦, —) ger retro-känsla',
        'Centrerad layout med italic-prosa som vintage-magasin',
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
