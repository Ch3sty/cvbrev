/**
 * Exempeldatan i artiklarnas mallvisning (CV och personligt brev).
 *
 * Flyttad ur InteractiveCVShowcase och InteractiveLetterShowcase så att
 * exemplet kan renderas på servern (src/app/api/public/exempel/*) och
 * visningen i artikeln bara bär mallväljaren. Texten är befintlig
 * exempeldata ("Erik Lindberg", "Maria Johansson"). Perioderna står med
 * tankstreck (U+2013), som mallmotorn delar på: dokumentets datumformat,
 * inte löptext.
 */

export const SHOWCASE_CV = {
  namn: 'Erik Lindberg',
  titel: 'Projektledare inom IT',
  kontakt: {
    telefon: '073-456 78 90',
    epost: 'erik.lindberg@email.se',
    plats: 'Stockholm',
    linkedin: 'linkedin.com/in/eriklindberg',
  },
  profil:
    'Erfaren projektledare med 6+ års erfarenhet av att leda digitala transformationsprojekt inom bank och fintech. Certifierad i både agila metoder (Scrum, SAFe) och traditionell projektledning (PMP). Levererat 15+ projekt med en genomsnittlig budget på 8 MSEK. Stark kommunikatör som bygger högpresterande team och håller intressenterna samlade.',
  erfarenhet: [
    {
      titel: 'Senior Projektledare',
      arbetsgivare: 'Nordea Bank',
      period: '2021 – Pågående',
      beskrivning: [
        'Leder ett tvärfunktionellt team på 12 personer i införandet av en ny mobilbanksplattform',
        'Ansvarig för budget på 15 MSEK och rapportering till styrgrupp med IT-direktör',
        'Införde agilt arbetssätt som ökade leveranstakten med 35%',
        'Samordnar externa leverantörer och säkerställer efterlevnad av finansiella regelverk',
      ],
    },
    {
      titel: 'Projektledare',
      arbetsgivare: 'Klarna',
      period: '2018 – 2021',
      beskrivning: [
        'Ledde 8 produktutvecklingsprojekt inom checkout och betalningslösningar',
        'Införde Scrum och kortade tiden till lansering med 40%',
        'Handledde 3 juniora projektledare och byggde upp ett projektledarprogram',
        'Samordnade releaseplaneringen för 5 utvecklingsteam (50+ utvecklare)',
      ],
    },
  ],
  utbildning: [
    {
      titel: 'Civilingenjör Industriell Ekonomi',
      skola: 'Kungliga Tekniska Högskolan',
      period: '2013 – 2018',
      beskrivning: 'Inriktning mot projektledning och verksamhetsstyrning',
    },
  ],
  kompetenser: {
    tekniska: [
      'Projektledningsmetodik: Scrum, Kanban, SAFe, vattenfall',
      'Verktyg: Jira, Confluence, MS Project, Miro',
      'Budget- och resursplanering',
      'Riskhantering och kvalitetssäkring',
      'Intressenthantering',
      'Agil förändring',
    ],
    personliga: [
      'Ledarskap och teamutveckling',
      'Kommunikation och presentation',
      'Problemlösning och beslutsfattande',
      'Förhandling och konflikthantering',
      'Strategiskt tänkande',
    ],
  },
  certifieringar: [
    'PMP, Project Management Professional (2022)',
    'SAFe 5.0 Agilist (2021)',
    'Professional Scrum Master I (2019)',
    'PRINCE2 Foundation (2018)',
  ],
  sprak: [
    { sprak: 'Svenska', niva: 'Modersmål' },
    { sprak: 'Engelska', niva: 'Flytande' },
  ],
}

export const SHOWCASE_BREV = {
  namn: 'Maria Johansson',
  adress: 'Stockholm',
  telefon: '070-987 65 43',
  epost: 'maria.johansson@email.se',
  arbetsgivare: 'Företaget AB',
  roll: 'Ekonomiassistent',
  datum: '7 januari 2026',
  brevText: `Hej,

Jag söker tjänsten som ekonomiassistent hos Företaget AB eftersom jag vill arbeta i en organisation där jag kan kombinera min analytiska förmåga med mitt intresse för ekonomi och administration.

Under mina tre år som ekonomiassistent på Konsultbolaget har jag utvecklat djup kompetens inom löpande bokföring, leverantörs- och kundreskontran samt månadsavstämningar. Jag arbetar dagligen i Fortnox och Excel och har även erfarenhet av att ta fram rapporter till ledningsgruppen.

Det som utmärker mig som kollega är min noggrannhet och mitt strukturerade arbetssätt. Jag trivs med att arbeta självständigt men uppskattar också samarbete i team. På min nuvarande arbetsplats har jag fått förtroendet att introducera nya medarbetare i våra ekonomirutiner.

Jag ser fram emot att berätta mer om hur jag kan bidra till ert team.

Med vänlig hälsning,
Maria Johansson`,
}

/** Brevmallarna i visningen. Samma sex som förut. */
export const BREV_MALLAR = [
  { id: 'classic', name: 'Klassisk', tier: 'free' },
  { id: 'sidebar', name: 'Sidofält', tier: 'free' },
  { id: 'minimal', name: 'Minimal', tier: 'free' },
  { id: 'compact', name: 'Kompakt', tier: 'free' },
  { id: 'centered', name: 'Centrerad', tier: 'premium' },
  { id: 'twocolumn', name: 'Två spalter', tier: 'premium' },
] as const

export type BrevMallId = (typeof BREV_MALLAR)[number]['id']

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Brevet som ett eget HTML-dokument i en mall. Samma sex layouter som
 * InteractiveLetterShowcase ritade i JSX, nu som ren HTML så att de kan
 * serveras till en iframe utan klientkod.
 */
export function brevHtml(mall: BrevMallId, fontFamily: string): string {
  const b = SHOWCASE_BREV
  const stycken = b.brevText
    .split('\n\n')
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('')
  const kontakt = (sep = '<br>') => [b.telefon, b.epost, b.adress].map(esc).join(sep)
  let kropp = ''
  switch (mall) {
    case 'sidebar':
      kropp = `<div style="display:flex;gap:32px"><div style="width:23%;border-right:2px solid #9ca3af;padding-right:24px;font-size:12px"><p><b>${esc(b.namn)}</b></p><p>${kontakt()}</p></div><div style="flex:1;font-size:13px"><p>${esc(b.datum)}</p><p><b>${esc(b.arbetsgivare)}<br>Ansökan: ${esc(b.roll)}</b></p>${stycken}</div></div>`
      break
    case 'minimal':
      kropp = `<div style="display:flex;gap:32px;margin-bottom:24px;font-size:12px"><div style="flex:1"><p style="color:#6b7280"><b>Från</b></p><p>${esc(b.namn)}<br>${kontakt()}</p></div><div style="flex:1"><p style="color:#6b7280"><b>Till</b></p><p>${esc(b.arbetsgivare)}<br>${esc(b.roll)}</p></div></div><p>${esc(b.datum)}</p>${stycken}`
      break
    case 'compact':
      kropp = `<p style="border-bottom:1px solid #d1d5db;padding-bottom:8px;font-size:12px">${esc(b.namn)} | ${kontakt(' | ')}</p><p style="text-align:right;font-size:12px;color:#4b5563">${esc(b.datum)}</p><p><b>${esc(b.arbetsgivare)}</b><br>Ansökan: ${esc(b.roll)}</p>${stycken}`
      break
    case 'centered':
      kropp = `<div style="text-align:center"><p><b style="font-size:17px">${esc(b.namn)}</b><br>${kontakt()}</p></div><hr style="border:0;border-top:1px solid #000;margin:24px 0"><p style="font-size:12px"><b>Till</b><br>${esc(b.arbetsgivare)}</p><p>${esc(b.datum)}</p>${stycken}`
      break
    case 'twocolumn':
      kropp = `<div style="display:flex;gap:32px"><div style="width:70%"><p><b style="font-size:19px">${esc(b.namn)}</b><br><span style="color:#4b5563">${esc(b.arbetsgivare)}</span></p><p>${esc(b.adress)}, ${esc(b.datum)}</p>${stycken}</div><div style="width:30%;font-size:12px"><p><b>Till</b><br>${esc(b.arbetsgivare)}<br>${esc(b.roll)}</p><p><b>Från</b><br>${esc(b.namn)}<br>${kontakt()}</p></div></div>`
      break
    default:
      kropp = `<p><b>${esc(b.namn)}</b><br>${kontakt()}</p><p>${esc(b.datum)}</p><p><b>${esc(b.arbetsgivare)}<br>Ansökan: ${esc(b.roll)}</b></p>${stycken}`
  }
  return `<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><title>Personligt brev, exempel</title><style>
  html,body{margin:0;background:#fff;color:#1f2937}
  body{font-family:${fontFamily};font-size:14px;line-height:1.6;padding:56px 64px;box-sizing:border-box;width:794px}
  p{margin:0 0 16px}
</style></head><body>${kropp}</body></html>`
}

/**
 * Skalar dokumentet till iframens bredd. Mallarna är ritade för A4 (794 px),
 * och visningen i artikeln är smalare, särskilt på mobil.
 */
export const SKALA_SKRIPT = `<script>(function(){function s(){var z=window.innerWidth/794;document.documentElement.style.zoom=String(z)}s();window.addEventListener('resize',s)})()</script>`
