// FÃ¶rfattardatabas fÃ¶r jobbcoach.ai artiklar
// Alla fÃ¶rfattare Ã¤r fiktiva personer skapade fÃ¶r E-E-A-T SEO-optimering

export interface Author {
  id: string;
  name: string;
  image: string;
  title: string;
  bio: string;
  expertise: string[];
  articleCount?: number;
}

export const AUTHORS: Author[] = [
  {
    id: 'helena',
    name: 'Helena Andersson',
    image: '/images/jobbcoach/Helena.webp',
    title: 'Senior KarriÃ¤rcoach',
    bio: 'Certifierad karriÃ¤rcoach med mÃ¥ngÃ¥rig erfarenhet frÃ¥n ledande rekryteringsfÃ¶retag. Specialiserar sig pÃ¥ att vÃ¤gleda kandidater genom komplexa karriÃ¤rÃ¶vergÃ¥ngar och strategisk positionering pÃ¥ arbetsmarknaden.',
    expertise: ['KarriÃ¤rstrategi', 'Meritdokumentation', 'Intervjumetodik', 'Professionell utveckling'],
    articleCount: 0
  },
  {
    id: 'johan',
    name: 'Johan Lindberg',
    image: '/images/jobbcoach/Johan.webp',
    title: 'AI & HR-teknikspecialist',
    bio: 'Teknologiexpert inom HR-automation med djup fÃ¶rstÃ¥else fÃ¶r ATS-system och digitala rekryteringsprocesser. Utvecklar strategier fÃ¶r hur kandidater navigerar dagens teknikdrivna rekryteringslandskap.',
    expertise: ['HR-teknologi', 'Digitala ansÃ¶kningsprocesser', 'ATS-optimering', 'LinkedIn-strategier'],
    articleCount: 0
  },
  {
    id: 'linda',
    name: 'Linda Eriksson',
    image: '/images/jobbcoach/Linda.webp',
    title: 'Chefsrekryterare & Employer Branding Expert',
    bio: 'Senior rekryteringskonsult med omfattande erfarenhet frÃ¥n executive search och talangfÃ¶rvÃ¤rv. Inriktad pÃ¥ kompetensbaserad rekrytering och strategisk employer branding inom den svenska marknaden.',
    expertise: ['Executive Search', 'Kompetensbaserad rekrytering', 'FÃ¶rhandlingsstrategier', 'Employer Branding'],
    articleCount: 0
  }
];

// Vikter fÃ¶r Ã¤mnesomrÃ¥den per fÃ¶rfattare
const AUTHOR_TOPIC_WEIGHTS: Record<string, Record<string, number>> = {
  helena: {
    'cv': 0.9,
    'curriculum': 0.9,
    'meritfÃ¶rteckning': 0.9,
    'intervju': 0.8,
    'arbetsintervju': 0.8,
    'anstÃ¤llningsintervju': 0.8,
    'karriÃ¤r': 0.8,
    'karriÃ¤rstrategi': 0.9,
    'karriÃ¤rvÃ¤xling': 0.8,
    'karriÃ¤rÃ¶vergÃ¥ng': 0.8,
    'ansÃ¶kan': 0.7
  },
  johan: {
    'ai': 0.9,
    'artificiell intelligens': 0.9,
    'ats': 0.9,
    'ats-system': 0.9,
    'personligt brev': 0.8,
    'fÃ¶ljebrev': 0.8,
    'automation': 0.8,
    'digital': 0.8,
    'linkedin': 0.9,
    'profil': 0.7,
    'online': 0.7,
    'hr-tech': 0.9,
    'hr-teknologi': 0.9
  },
  linda: {
    'lÃ¶n': 0.9,
    'lÃ¶nefÃ¶rhandling': 0.9,
    'fÃ¶rhandling': 0.9,
    'employer branding': 0.9,
    'fÃ¶retagskultur': 0.8,
    'executive': 0.9,
    'chef': 0.8,
    'ledare': 0.8,
    'rekrytering': 0.9,
    'talang': 0.8,
    'kompetens': 0.8,
    'search': 0.8
  }
};

/**
 * Genererar en deterministisk hash frÃ¥n en strÃ¤ng
 * AnvÃ¤nds fÃ¶r konsistent fÃ¶rfattartilldelning
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * BerÃ¤knar matchningspoÃ¤ng fÃ¶r en fÃ¶rfattare baserat pÃ¥ artikelns Ã¤mne
 */
function calculateAuthorScore(authorId: string, tags: string[], title: string): number {
  const weights = AUTHOR_TOPIC_WEIGHTS[authorId] || {};
  const searchText = `${title} ${tags.join(' ')}`.toLowerCase();

  let score = 0;
  let matchCount = 0;

  for (const [keyword, weight] of Object.entries(weights)) {
    if (searchText.includes(keyword)) {
      score += weight;
      matchCount++;
    }
  }

  // Normalisera poÃ¤ngen baserat pÃ¥ antal matchningar
  return matchCount > 0 ? score / matchCount : 0;
}

/**
 * Intelligent fÃ¶rfattartilldelning med fallback fÃ¶r nya Ã¤mnen
 * Garanterar jÃ¤mn fÃ¶rdelning Ã¤ven fÃ¶r artiklar utan tydlig Ã¤mnesmatchning
 */
export function getAuthorForArticle(
  slug: string,
  tags: string[] = [],
  title: string = ''
): Author {
  // Steg 1: FÃ¶rsÃ¶k hitta bÃ¤sta matchning baserat pÃ¥ Ã¤mne
  const scores = AUTHORS.map(author => ({
    author,
    score: calculateAuthorScore(author.id, tags, title)
  }));

  // Sortera efter poÃ¤ng
  scores.sort((a, b) => b.score - a.score);

  // Om vi har en tydlig vinnare (score > 0.5), anvÃ¤nd den
  if (scores[0].score > 0.5) {
    return scores[0].author;
  }

  // Steg 2: Om vi har en svag matchning (score > 0.2), anvÃ¤nd viktat urval
  // Detta ger fortfarande viss preferens men med slumpmÃ¤ssighet
  if (scores[0].score > 0.2) {
    const weightedScores = scores.filter(s => s.score > 0.1);
    const totalWeight = weightedScores.reduce((sum, s) => sum + s.score, 0);

    // AnvÃ¤nd slug-hash fÃ¶r att vÃ¤lja bland de viktade alternativen
    const hashValue = hashString(slug) / 2147483647; // Normalisera till 0-1
    let accumWeight = 0;

    for (const item of weightedScores) {
      accumWeight += item.score / totalWeight;
      if (hashValue <= accumWeight) {
        return item.author;
      }
    }
  }

  // Steg 3: Fallback - Deterministisk tilldelning baserat pÃ¥ slug
  // Detta garanterar:
  // 1. Samma fÃ¶rfattare fÃ¶r samma artikel varje gÃ¥ng
  // 2. JÃ¤mn fÃ¶rdelning Ã¶ver alla fÃ¶rfattare
  const index = hashString(slug) % AUTHORS.length;
  return AUTHORS[index];
}

/**
 * HÃ¤mtar en fÃ¶rfattare baserat pÃ¥ ID
 */
export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find(author => author.id === id);
}

/**
 * Genererar Schema.org Person markup fÃ¶r en fÃ¶rfattare
 */
export function generateAuthorSchema(author: Author, articleUrl?: string) {
  return {
    "@type": "Person",
    "@id": `https://www.jobbcoach.ai/authors/${author.id}`,
    "name": author.name,
    "jobTitle": author.title,
    "image": {
      "@type": "ImageObject",
      "url": `https://www.jobbcoach.ai${author.image}`,
      "width": 200,
      "height": 200
    },
    "description": author.bio,
    "knowsAbout": author.expertise,
    "worksFor": {
      "@type": "Organization",
      "name": "jobbcoach.ai",
      "url": "https://www.jobbcoach.ai",
      "sameAs": [
        "https://www.linkedin.com/company/jobbcoach-ai",
        "https://twitter.com/jobbcoach_ai"
      ]
    },
    ...(articleUrl && {
      "url": articleUrl
    })
  };
}

/**
 * Uppdaterar artikelrÃ¤knare fÃ¶r en fÃ¶rfattare (fÃ¶r framtida anvÃ¤ndning)
 */
export function incrementAuthorArticleCount(authorId: string): void {
  const author = AUTHORS.find(a => a.id === authorId);
  if (author && author.articleCount !== undefined) {
    author.articleCount++;
  }
}