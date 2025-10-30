// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/blog'; // Din befintliga funktion för att hämta post-metadata

export default function sitemap(): MetadataRoute.Sitemap {
  // Din webbplats bas-URL
  const baseUrl = 'https://www.jobbcoach.ai'; // *** UPPDATERA VID BEHOV ***

  // 1. Lägg till dina statiska sidor manuellt
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Startsidan uppdateras ofta
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

  // 2. Hämta alla artikel-slugs och datum dynamiskt
  const posts = getAllPostsMeta(); // Hämtar { slug: string, date: string, ... }[]

  const articlePages: MetadataRoute.Sitemap = posts.map((post) => {
    const postDate = new Date(post.date);
    const isNewArticle = postDate >= new Date('2025-10-30'); // Nya artiklar från 30 okt 2025

    return {
      url: `${baseUrl}/artiklar/${post.slug}`,
      lastModified: postDate,
      changeFrequency: isNewArticle ? 'weekly' : 'monthly',
      priority: isNewArticle ? 0.8 : 0.7,
    };
  });

  // 3. Kombinera statiska och dynamiska sidor
  return [...staticPages, ...articlePages];
}