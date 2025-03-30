// src/utils/helpers.ts

/**
 * Skapar en absolut URL baserat på miljövariabler.
 * Prioriterar NEXT_PUBLIC_SITE_URL, sedan NEXT_PUBLIC_VERCEL_URL,
 * och faller tillbaka till localhost:3000 för utveckling.
 * Säkerställer att URL:en slutar med '/' innan sökvägen läggs till.
 * @param path - Valfri sökväg att lägga till efter bas-URL:en (t.ex. 'profile').
 * @returns Den konstruerade absoluta URL:en.
 */
export const getURL = (path: string = ''): string => {
  // 1. Bestäm bas-URL
  let url =
    process.env.NEXT_PUBLIC_SITE_URL || // Sätt denna till din domän i produktion (.env.production.local eller Vercel envs)
    process.env.NEXT_PUBLIC_VERCEL_URL || // Sätts automatiskt av Vercel
    'http://localhost:3000/'; // Fallback för lokal utveckling

  // 2. Säkerställ att den börjar med http:// eller https://
  // NEXT_PUBLIC_VERCEL_URL inkluderar inte alltid protokollet
  url = url.startsWith('http') ? url : `https://${url}`;

  // 3. Säkerställ att den slutar med ett '/'
  url = url.endsWith('/') ? url : `${url}/`;

  // 4. Ta bort eventuellt ledande '/' från path för att undvika dubbla //
  const formattedPath = path.startsWith('/') ? path.substring(1) : path;

  // 5. Lägg till sökvägen
  url = `${url}${formattedPath}`;

  return url;
};

// Du kan lägga till fler hjälpfunktioner här i framtiden om det behövs.