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


/**
 * Konverterar HTML till ren text genom att ta bort alla taggar och HTML-entities.
 * Hanterar även whitespace på ett korrekt sätt.
 *
 * @param html - HTML-strängen att konvertera
 * @returns Ren text utan HTML-formatering
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return '';

  try {
    // Skapa en temporary DOM element för säker parsing
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Extrahera textinnehåll (hanterar automatiskt HTML-entities)
    const text = temp.textContent || temp.innerText || '';

    // Normalisera whitespace: ersätt multipla spaces/newlines med single space
    return text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Error converting HTML to plain text:', error);
    // Fallback till regex om DOM-parsing misslyckas
    return html
      .replace(/<[^>]*>/g, '') // Ta bort HTML-taggar
      .replace(/&nbsp;/g, ' ') // Ersätt &nbsp; med space
      .replace(/&lt;/g, '<')   // Konvertera vanliga entities
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')    // Normalisera whitespace
      .trim();
  }
}

/**
 * Skapa en förhandsvisning av text med maxlängd.
 *
 * @param text - Texten att förhandsgranska
 * @param maxLength - Max antal tecken (default: 150)
 * @returns Förkortad text med ellipsis om nödvändigt
 */
export function createPreview(text: string, maxLength: number = 150): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.substring(0, maxLength).trim() + '...';
}

// Du kan lägga till fler hjälpfunktioner här i framtiden om det behövs.