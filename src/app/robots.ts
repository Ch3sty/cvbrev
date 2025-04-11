// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Din webbplats bas-URL
  const baseUrl = 'https://www.cvbrev.se'; // *** UPPDATERA VID BEHOV ***

  return {
    rules: [ // Du kan ha flera regler för olika user-agents, eller en generell
      {
        userAgent: '*', // Gäller för alla robotar
        allow: '/', // Tillåt genomsökning av allt som standard
        // disallow: '/admin/', // Exempel: Blockera en admin-sektion
        // disallow: '/my-letters/', // Exempel: Blockera sidor bakom inloggning
		// disallow: '/profile/', // Exempel: Blockera sidor bakom inloggning
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Peka på din sitemap
  };
}