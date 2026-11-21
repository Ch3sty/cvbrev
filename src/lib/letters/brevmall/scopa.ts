/**
 * Brevets HTML-dokument inlagt i en sida (BrevArk, BrevMiniatyr), utan
 * iframe. Klientsäker.
 *
 * Varje selektor i dokumentets CSS skrivs om till behållarens klass, också
 * inne i @media (dagens scopeLetterHtml tar bara reglerna på översta nivån).
 * html, body och :root blir behållaren själv, så att mallens CSS-variabler
 * ärvs. @page och utskriftsreglerna tas bort, @font-face och @keyframes
 * står kvar som de är. Skript tas bort: krympsteget väljs av passaBrevet.
 */

/** En regel på en nivå: selektor (eller @-regel) och innehållet mellan klamrarna. */
function regler(css: string): { huvud: string; kropp: string }[] {
  const ut: { huvud: string; kropp: string }[] = []
  let i = 0
  while (i < css.length) {
    const start = css.indexOf('{', i)
    if (start < 0) break
    let djup = 1
    let j = start + 1
    while (j < css.length && djup > 0) {
      if (css[j] === '{') djup++
      else if (css[j] === '}') djup--
      j++
    }
    ut.push({ huvud: css.slice(i, start).trim(), kropp: css.slice(start + 1, j - 1) })
    i = j
  }
  return ut
}

const ROT = new Set(['html', 'body', ':root', 'html body'])

function scopaSelektor(sel: string, scope: string): string {
  return sel
    .split(',')
    .map((d) => {
      const t = d.trim()
      if (!t) return t
      if (ROT.has(t)) return scope
      if (t.startsWith('html ') || t.startsWith('body ')) return `${scope} ${t.replace(/^(html|body)\s+/, '')}`
      return `${scope} ${t}`
    })
    .join(',')
}

/** CSS:en med alla selektorer under `scope` (t.ex. ".brevark-r1"). */
export function scopaCss(css: string, scope: string): string {
  const ut: string[] = []
  for (const { huvud, kropp } of regler(css.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    if (!huvud) continue
    if (huvud.startsWith('@page')) continue
    if (huvud.startsWith('@font-face') || huvud.startsWith('@keyframes')) {
      ut.push(`${huvud}{${kropp}}`)
      continue
    }
    if (huvud.startsWith('@media')) {
      if (/\bprint\b/.test(huvud) && !/\bscreen\b/.test(huvud)) continue
      ut.push(`${huvud}{${scopaCss(kropp, scope)}}`)
      continue
    }
    if (huvud.startsWith('@')) continue
    ut.push(`${scopaSelektor(huvud, scope)}{${kropp}}`)
  }
  return ut.join('\n')
}

/** Dokumentet uppdelat i scopad CSS och kroppens markup (utan skript). */
export function scopaBrevHtml(html: string, scope: string): { css: string; kropp: string } {
  const stilar = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n')
  const kroppMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)
  const kropp = (kroppMatch ? kroppMatch[1] : html).replace(/<script[\s\S]*?<\/script>/gi, '')
  return { css: scopaCss(stilar, `.${scope}`), kropp }
}

/**
 * Krympsteget i klienten, samma regel som skriptet i dokumentet: brevets
 * sista rad ska stå ovanför bottenmarginalen (data-grans, mm från arkets
 * överkant). Provar steg 0, 1 och 2. Fungerar i ett skalat ark.
 * Returnerar steget, eller null när arket saknas eller steget är låst.
 */
export function passaBrevet(rot: HTMLElement): number | null {
  const cv = rot.querySelector<HTMLElement>('.cv.brev')
  const slut = cv?.querySelector<HTMLElement>('.brev-slut')
  if (!cv || !slut || cv.hasAttribute('data-last')) return null
  const grans = Number(cv.getAttribute('data-grans')) || 279
  const skala = cv.offsetWidth ? cv.getBoundingClientRect().width / cv.offsetWidth : 1
  const hojdMm = () => ((slut.getBoundingClientRect().top - cv.getBoundingClientRect().top) / (skala || 1)) * (25.4 / 96)
  for (let s = 0; s < 3; s++) {
    cv.setAttribute('data-steg', String(s))
    if (hojdMm() <= grans) return s
  }
  return 2
}
