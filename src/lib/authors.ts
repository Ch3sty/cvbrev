// Författardatabas för jobbcoach.ai artiklar
// Alla författare är fiktiva personer skapade för E-E-A-T SEO-optimering

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
    title: 'Senior Karriärcoach',
    bio: 'Legitimerad karriärcoach med 12+ års erfarenhet från Sveriges ledande rekryteringsbolag. Specialiserad på att transformera jobbsökares chanser genom strategisk CV-optimering och intervjuteknik.',
    expertise: ['CV-optimering', 'Intervjuteknik', 'Karriärplanering', 'Arbetssökning'],
    articleCount: 0
  },
  {
    id: 'johan',
    name: 'Johan Lindberg',
    image: '/images/jobbcoach/Johan.webp',
    title: 'AI & HR-teknikspecialist',
    bio: 'Civilingenjör inom AI/ML med 8 års erfarenhet av HR-teknologi. Utvecklar cutting-edge verktyg som hjälper svenska jobbsökare att navigera den automatiserade rekryteringsprocessen.',
    expertise: ['AI-verktyg', 'Personliga brev', 'Digital jobbsökning', 'LinkedIn-optimering'],
    articleCount: 0
  },
  {
    id: 'linda',
    name: 'Linda Eriksson',
    image: '/images/jobbcoach/Linda.webp',
    title: 'Chefsrekryterare & Employer Branding Expert',
    bio: 'Chefsrekryterare på Stockholmsbörsen med 15+ års erfarenhet från techbolaget Klarna och Spotify. Expert på vad som verkligen avgör i svenska rekryteringsprocesser på C-nivå.',
    expertise: ['Löneförhandling', 'Employer Branding', 'Tech-rekrytering', 'Företagskultur'],
    articleCount: 0
  }
];

// Vikter för ämnesområden per författare
const AUTHOR_TOPIC_WEIGHTS: Record<string, Record<string, number>> = {
  helena: {
    'cv': 0.9,
    'curriculum': 0.9,
    'meritförteckning': 0.9,
    'intervju': 0.8,
    'arbetsintervju': 0.8,
    'jobbintervju': 0.8,
    'karriär': 0.7,
    'karriärplanering': 0.7,
    'arbetssök': 0.7,
    'jobbsök': 0.7,
    'ansökan': 0.6
  },
  johan: {
    'ai': 0.9,
    'artificiell intelligens': 0.9,
    'personligt brev': 0.9,
    'följebrev': 0.9,
    'motivationsbrev': 0.8,
    'digital': 0.7,
    'linkedin': 0.8,
    'profil': 0.6,
    'online': 0.6,
    'sociala medier': 0.7,
    'nätverk': 0.6
  },
  linda: {
    'lön': 0.9,
    'löneförhandling': 0.9,
    'förhandling': 0.8,
    'employer branding': 0.9,
    'företagskultur': 0.8,
    'tech': 0.7,
    'it': 0.7,
    'rekrytering': 0.8,
    'arbetsgivare': 0.7,
    'chef': 0.6,
    'ledare': 0.6
  }
};

/**
 * Genererar en deterministisk hash från en sträng
 * Används för konsistent författartilldelning
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
 * Beräknar matchningspoäng för en författare baserat på artikelns ämne
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

  // Normalisera poängen baserat på antal matchningar
  return matchCount > 0 ? score / matchCount : 0;
}

/**
 * Intelligent författartilldelning med fallback för nya ämnen
 * Garanterar jämn fördelning även för artiklar utan tydlig ämnesmatchning
 */
export function getAuthorForArticle(
  slug: string,
  tags: string[] = [],
  title: string = ''
): Author {
  // Steg 1: Försök hitta bästa matchning baserat på ämne
  const scores = AUTHORS.map(author => ({
    author,
    score: calculateAuthorScore(author.id, tags, title)
  }));

  // Sortera efter poäng
  scores.sort((a, b) => b.score - a.score);

  // Om vi har en tydlig vinnare (score > 0.5), använd den
  if (scores[0].score > 0.5) {
    return scores[0].author;
  }

  // Steg 2: Om vi har en svag matchning (score > 0.2), använd viktat urval
  // Detta ger fortfarande viss preferens men med slumpmässighet
  if (scores[0].score > 0.2) {
    const weightedScores = scores.filter(s => s.score > 0.1);
    const totalWeight = weightedScores.reduce((sum, s) => sum + s.score, 0);

    // Använd slug-hash för att välja bland de viktade alternativen
    const hashValue = hashString(slug) / 2147483647; // Normalisera till 0-1
    let accumWeight = 0;

    for (const item of weightedScores) {
      accumWeight += item.score / totalWeight;
      if (hashValue <= accumWeight) {
        return item.author;
      }
    }
  }

  // Steg 3: Fallback - Deterministisk tilldelning baserat på slug
  // Detta garanterar:
  // 1. Samma författare för samma artikel varje gång
  // 2. Jämn fördelning över alla författare
  const index = hashString(slug) % AUTHORS.length;
  return AUTHORS[index];
}

/**
 * Hämtar en författare baserat på ID
 */
export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find(author => author.id === id);
}

/**
 * Genererar Schema.org Person markup för en författare
 */
export function generateAuthorSchema(author: Author, articleUrl?: string) {
  return {
    "@type": "Person",
    "@id": `https://jobbcoach.ai/authors/${author.id}`,
    "name": author.name,
    "jobTitle": author.title,
    "image": {
      "@type": "ImageObject",
      "url": `https://jobbcoach.ai${author.image}`,
      "width": 200,
      "height": 200
    },
    "description": author.bio,
    "knowsAbout": author.expertise,
    "worksFor": {
      "@type": "Organization",
      "name": "jobbcoach.ai",
      "url": "https://jobbcoach.ai",
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
 * Uppdaterar artikelräknare för en författare (för framtida användning)
 */
export function incrementAuthorArticleCount(authorId: string): void {
  const author = AUTHORS.find(a => a.id === authorId);
  if (author && author.articleCount !== undefined) {
    author.articleCount++;
  }
}