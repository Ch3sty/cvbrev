// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/blog'; // Din befintliga funktion för att hämta post-metadata

export default function sitemap(): MetadataRoute.Sitemap {
  // Din webbplats bas-URL
  const baseUrl = 'https://www.jobbcoach.ai';

  // 1. Lägg till dina statiska sidor manuellt
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/funktioner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/exempel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/priser`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artiklar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verktyg`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cv-mallar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cv-exempel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // Kategoriöversikt - högsta SEO-värde
    },
    {
      url: `${baseUrl}/personligt-brev-exempel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // Kategoriöversikt - högsta SEO-värde
    },
    {
      url: `${baseUrl}/skapa-brev`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/analysera-cv`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/om-oss`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integritetspolicy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/anvandarvillkor`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Verktyg-undersidor (konverteringstunga sidor)
  const verktygPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/verktyg/cv-analys`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verktyg/cv-mallar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verktyg/personligt-brev`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verktyg/linkedin-optimering`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/verktyg/jobbmatchning`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/verktyg/rekryteringstester`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/verktyg/jobbcoachen`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];

  // 3. Hämta alla artikel-slugs och datum dynamiskt
  const posts = getAllPostsMeta();

  // Dynamisk definition av nya artiklar (senaste 90 dagarna)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const articlePages: MetadataRoute.Sitemap = posts.map((post) => {
    const postDate = new Date(post.date);
    const isNewArticle = postDate >= ninetyDaysAgo;

    return {
      url: `${baseUrl}/artiklar/${post.slug}`,
      lastModified: postDate,
      changeFrequency: isNewArticle ? 'weekly' : 'monthly',
      priority: isNewArticle ? 0.8 : 0.7,
    };
  });

  // 4. Lägg till CV-exempel sidor
  const CV_EXEMPEL = [
    'underskoterska',
    'vardadministrator',
    'vardbitrade',
    'hemtjanst',
    'forskollarare',
    'ingenjor',
    'receptionist',
    'lagerarbetare',
    'administrator',
    'lokalvardare',
    'handlaggare',
    'lakare',
    'butiksbitrade',
    'it-konsult',
    'student',
    'larare',
    'sjukskoterska',
    'specialistsjukskoterska',
    'butikssaljare',
    'saljare',
    'sommarjobb',
    'ekonomiassistent',
    'barnmorska',
    'barnskotare',
    'personlig-assistent',
    'kurator',
    'servitris-restaurangbitrade',
    'chef',
    'produktchef',
    'projektledare',
    'elevassistent',
    'enhetschef',
    'kundradgivare',
    'kundtjanst',
    'kundtjanstmedarbetare',
    'kock',
    'fysioterapeut',
    'grundskollarare',
    'specialpedagog',
    'kontorsassistent',
    'automationsingenior',
    'konstruktor',
    'truckforare',
    'logistiker',
    'loneadministrator',
    'lagerchef',
    'fastighetsskotare',
    'hemtjanstpersonal',
    'servicemedarbetare',
    'socialsekreterare',
    'hr-specialist',
    'controller',
    'kassorska',
    'butikschef',
    'account-manager',
    'systemutvecklare',
    'devops-engineer',
    'projektledare-it',
    'fritidspedagog',
    'redovisningsekonom',
    'bartender',
    'konditor',
    'ekonom',
    'scrum-master',
    'teamledare',
    'fritidsledare',
    'psykolog',
    'lss-handlaggare',
    'hotellvard',
    // Lägg till fler CV-exempel här när de skapas
  ];

  const cvExempelPages: MetadataRoute.Sitemap = CV_EXEMPEL.map((yrke) => ({
    url: `${baseUrl}/cv-exempel/${yrke}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85, // Högt prio för SEO-viktiga sidor
  }));

  // 5. Lägg till personligt brev exempel-sidor
  const PERSONLIGT_BREV_EXEMPEL = [
    'underskoterska',
    'student',
    'larare',
    'sjukskoterska',
    'butikssaljare',
    'saljare',
    'sommarjobb',
    'ekonomiassistent',
    'barnskotare',
    'personlig-assistent',
    'administrator',
    'forskollarare',
    'handlaggare',
    'ingenjor',
    'it-konsult',
    'kurator',
    'lagerarbetare',
    'lakare',
    'receptionist',
    'lokalvardare',
    'butiksbitrade',
    'servitris-restaurangbitrade',
    'chef',
    'projektledare',
    'elevassistent',
    'kundtjanst',
    'stadare',
    'vardbitrade',
    'hemtjanst',
    'kock',
    'specialpedagog',
    'fritidspedagog',
    'redovisningsekonom',
    'hr-specialist',
    'systemutvecklare',
    'account-manager',
    'controller',
    'scrum-master',
    'truckforare',
    'lagerchef',
    'barnmorska',
    'specialistsjukskoterska',
    'loneadministrator',
    'teamledare',
    'enhetschef',
    'produktchef',
    'boendestod',
    'barista',
    'koksbitrade',
    'logistikassistent',
    'lss-handlaggare',
    'kundradgivare',
    'hotellvard',
    'vardadministrator',
    'kundtjanstmedarbetare',
    'terminalarbetare',
    'administrativ-assistent',
    // Lägg till fler personligt brev-exempel här när de skapas
  ];

  const brevExempelPages: MetadataRoute.Sitemap = PERSONLIGT_BREV_EXEMPEL.map((yrke) => ({
    url: `${baseUrl}/personligt-brev-exempel/${yrke}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85, // Högt prio för SEO-viktiga sidor
  }));

  // 6. Kombinera alla sidor
  return [...staticPages, ...verktygPages, ...articlePages, ...cvExempelPages, ...brevExempelPages];
}