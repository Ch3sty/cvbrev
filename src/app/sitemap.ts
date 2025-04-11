// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/blog'; // Din befintliga funktion för att hämta post-metadata

export default function sitemap(): MetadataRoute.Sitemap {
  // Din webbplats bas-URL
  const baseUrl = 'https://www.cvbrev.se'; // *** UPPDATERA VID BEHOV ***

  // 1. Lägg till dina statiska sidor manuellt
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(), // Kan sättas till ett specifikt datum eller build-datum
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/funktioner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/priser`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
        url: `${baseUrl}/artiklar`, // Artikellistan
        lastModified: new Date(), // Uppdateras ofta när nya artiklar läggs till
        changeFrequency: 'weekly',
        priority: 0.9,
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
        url: `${baseUrl}/register`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
	  {
        url: `${baseUrl}/integritetspolicy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
	  {
        url: `${baseUrl}/anvandarvillkor`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      // Lägg till fler statiska sidor här (t.ex. /om-oss, /kontakt etc.)
      // Kom ihåg att uppdatera lastModified om innehållet ändras sällan.
  ];

  // 2. Hämta alla artikel-slugs och datum dynamiskt
  const posts = getAllPostsMeta(); // Hämtar { slug: string, date: string, ... }[]

  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/artiklar/${post.slug}`,
    // Använd postens faktiska publiceringsdatum (eller uppdateringsdatum om du har det)
    lastModified: new Date(post.date),
    changeFrequency: 'monthly', // Eller 'never' om de sällan ändras
    priority: 0.7, // Lite lägre än huvudsektionerna
  }));

  // 3. Kombinera statiska och dynamiska sidor
  return [...staticPages, ...articlePages];
}