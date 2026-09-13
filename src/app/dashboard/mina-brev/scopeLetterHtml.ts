/**
 * Brevmallarna är hela HTML-dokument. De bär ett eget <style>-block där
 * `body` får `padding: 1.5rem`. När vi visar brevet med
 * dangerouslySetInnerHTML hamnar det blocket i dokumentet och träffar
 * dashboardens riktiga <body>. Hela skalet knuffas då in 24 px i sidled och
 * 24 px nedåt, långt efter första målningen. Det mätte 0,0525 i CLS på både
 * /dashboard/mina-brev/[id] och .../edit.
 *
 * Lösningen är att låsa in reglerna. Vi skriver om `body` och `html` i
 * mallens CSS till behållarens klass, så förhandsvisningen ser likadan ut
 * men ingenting läcker ut i resten av sidan.
 */

/** Klassen som förhandsvisningen sätter på sin yttre div. */
export const BREV_SCOPE = 'brev-forhandsvisning';

/**
 * Byter ut selektorer som pekar på hela dokumentet mot behållarklassen.
 * Rör bara selektordelen, aldrig deklarationerna, så typsnitt, marginaler
 * och radavstånd blir kvar precis som mallen tänkt sig.
 */
function scopaSelektorer(css: string): string {
  return css.replace(/(^|\})([^{}]+)\{/g, (_hel, fore: string, selektor: string) => {
    // @media, @page och liknande har inga selektorer att skriva om.
    if (selektor.trim().startsWith('@')) return `${fore}${selektor}{`;

    const omskrivna = selektor
      .split(',')
      .map((del) => {
        const t = del.trim();
        if (!t) return del;
        // Bara dokumentets rot-selektorer behöver flyttas in i behållaren.
        if (t === 'body' || t === 'html' || t === 'html body' || t === ':root') {
          return `.${BREV_SCOPE}`;
        }
        return `.${BREV_SCOPE} ${t}`;
      })
      .join(', ');

    return `${fore}${omskrivna}{`;
  });
}

/**
 * Tar brevets lagrade HTML och returnerar markup som är trygg att lägga in i
 * sidan: style-blocken scopade, dokumenttaggarna bortplockade.
 *
 * Innehållet i brevet lämnas orört. Det här handlar om CSS-räckvidd, inte om
 * att ändra vad som står i brevet.
 */
export function scopeLetterHtml(html: string): string {
  if (!html) return '';

  let ut = html;

  // Scopa varje <style>-block.
  ut = ut.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_hel, attr: string, css: string) => `<style${attr}>${scopaSelektorer(css)}</style>`
  );

  // Ett helt dokument kan inte bo inuti en div. Skala av höljet och behåll
  // det som faktiskt ska synas.
  ut = ut
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<head[\s\S]*?>([\s\S]*?)<\/head>/gi, '$1')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '');

  return ut;
}
