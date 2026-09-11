// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Din webbplats bas-URL
  const baseUrl = 'https://www.jobbcoach.ai'; // *** UPPDATERA VID BEHOV ***

  return {
    rules: [ // Du kan ha flera regler för olika user-agents, eller en generell
      {
        userAgent: '*', // Gäller för alla robotar
        allow: '/', // Tillåt genomsökning av allt som standard
        // Konverteringsflödena är ingångar till produkten, inte innehåll att
        // ranka på. De pekar canonical till exempel- respektive mallsidan.
        disallow: ['/skapa-brev/start', '/cv-mallar/start'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Peka på din sitemap
  };
}