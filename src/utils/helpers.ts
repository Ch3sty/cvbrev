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


/**
 * Rensar ett filnamn för att skapa en säker nyckel för molnlagring (t.ex. Supabase Storage).
 * Ersätter svenska tecken, mellanslag och andra osäkra tecken med bindestreck,
 * konverterar till gemener och tar bort multipla/ledande/avslutande bindestreck.
 * Behåller filändelsen.
 * @param filename - Det ursprungliga filnamnet.
 * @returns En rensad version av filnamnet som är säker att använda som lagringsnyckel.
 */
export function sanitizeStorageKey(filename: string): string {
    // Separera filnamn och filändelse
    const lastDotIndex = filename.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
    const extension = lastDotIndex === -1 ? '' : filename.substring(lastDotIndex); // Behåll punkten

    const sanitized = nameWithoutExt
      .toLowerCase()
      // Ersätt svenska tecken
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      // Ersätt allt som inte är bokstav (a-z), siffra (0-9), _, . eller - med ett bindestreck
      .replace(/[^a-z0-9_.\-]/g, '-')
      // Ersätt multipla bindestreck med ett enda
      .replace(/-+/g, '-')
      // Ta bort bindestreck i början eller slutet av namnet
      .replace(/^-+|-+$/g, '');

    // Säkerställ att namnet inte är tomt efter rensning, ge fallback "fil"
    const finalName = sanitized || 'fil';

    // Lägg tillbaka filändelsen
    return `${finalName}${extension}`;
  }


// Du kan lägga till fler hjälpfunktioner här i framtiden om det behövs.