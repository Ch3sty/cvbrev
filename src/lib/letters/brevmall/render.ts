/**
 * Brevmallen: ett personligt brev i en CV-malls utseende (brevrummet,
 * omgång 1, byggspecen avsnitt 5).
 *
 * En renderare för alla 40 mallar. Brevet läser CV-mallens definition
 * (MallDef) och ritar huvudet med CV-renderarens egna delar (mallCss och
 * mallHuvud i src/lib/cv/mallar/render/html.ts), så att namn, titel,
 * kontakt, typsnitt, färger och linjer blir CV:ts. Under huvudet står
 * brevets delar i mallens brödtext: datum, mottagare, ärenderad, hälsning,
 * stycken, avslut och namn.
 *
 * Det som bara hör till ett CV hoppas över: foto, tidsaxel, rutor, profil i
 * spalter och spaltens avsnitt. Sidospaltsmallar behåller spalten med
 * kontaktuppgifterna (i hela sidans höjd), Sockel behåller sockeln med
 * kontakten, Ramverk ramen och Kant färgkanten.
 *
 * Sidan: A4, 210 mm bred. Topp- och bottenmarginalen är tabellrader som
 * Chrome upprepar på varje sida, så att ett brev som ändå går över en sida
 * får marginaler på sida två. Innan dess krymper texten i två steg
 * (data-steg 1 och 2: grad och radavstånd); ett litet skript i dokumentet
 * väljer steget efter att typsnitten laddats, BrevArk gör samma mätning.
 *
 * Inga Node-moduler: renderaren kan laddas dynamiskt i klienten.
 */
import type { MallVal, TypsnittId } from '@/lib/cv/mallar/kontrakt'
import { allaTypsnitt, los, matt, palett, type Hex } from '@/lib/cv/mallar/farg'
import { fontFace, TYPSNITT_FILER } from '@/lib/cv/mallar/typsnitt-filer'
import { mallCss, mallHuvud, namnGradTvaRader, type MallCtx } from '@/lib/cv/mallar/render/html'
import type { Dokument, KontaktRad } from '@/lib/cv/mallar/innehall'
import type { Linje, MallDef } from '@/lib/cv/mallar/typer'
import { getMall, getMallMedAlias } from '@/lib/cv/mallar/register'
import { BREV_FORVALD_MALL } from './katalog'
import { arendeRad, avslutsRad, datumRad, halsningsRad, hittaMarkeringar, rensadeStycken, type Traff } from './text'
import type { BrevData, BrevRenderVal, BrevVal } from './typer'

/** Steget i krympningen: 0 ingen, 1 och 2 mindre grad och radavstånd. */
export type BrevSteg = 0 | 1 | 2

/** Internt tillägg till BrevRenderVal: tvinga ett krympsteg (kontaktark, tester). */
export type BrevRenderValUtokad = BrevRenderVal & { steg?: BrevSteg }

/* ------------------------------------------------------------ mallen */

/** Definitionen för ett id (alias löses), annars brevets förvalda mall. */
export function brevMallDef(mallId: string | null | undefined): MallDef {
  return getMallMedAlias(mallId) ?? getMall(BREV_FORVALD_MALL)!
}

/** Har mallen en sidospalt med kontakten? Då står brevets kontakt där. */
export function harKontaktspalt(def: MallDef): boolean {
  return def.layout.typ === 'sidospalt' && def.layout.spalt.kontakt
}

/**
 * Definitionen som brevet ritas med: utan foto och utan det som bara hör
 * till ett CV. Layouten blir en spalt, utom sidospalt med kontakten.
 */
export function brevDef(def: MallDef): MallDef {
  return {
    ...def,
    foto: undefined,
    tidsaxel: false,
    profilSpalter: false,
    rutor: undefined,
    layout: harKontaktspalt(def) ? def.layout : { typ: 'enspalt' },
  }
}

/** Brevets val som CV-mallens val: accentens plats bland mallens fyra och typsnittet. */
export function mallValFor(def: MallDef, val?: BrevVal): MallVal {
  const ut: MallVal = {}
  const a = val?.accent?.toLowerCase()
  if (a) {
    const i = def.accenter.findIndex((x) => x.toLowerCase() === a)
    if (i >= 0) ut.farg = i
  }
  const t = val?.typsnitt
  if (t && t in TYPSNITT_FILER) ut.typsnitt = t as TypsnittId
  return ut
}

/* ------------------------------------------------------------ hjälpare */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Relativ luminans (WCAG) för en hexfärg. */
function luminans(hex: string): number {
  const s = hex.replace('#', '')
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s.slice(0, 6)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Kontrasten mellan två färger, 1 till 21. */
export function kontrast(a: string, b: string): number {
  const [x, y] = [luminans(a), luminans(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** Avsändarens kontaktrader i CV:ts ordning: e-post, telefon, ort. */
function kontaktRader(data: BrevData): KontaktRad[] {
  const a = data.avsandare
  const ut: KontaktRad[] = []
  const epost = a.epost?.trim()
  if (epost) ut.push({ typ: 'epost', text: epost, href: `mailto:${epost}` })
  const tel = a.telefon?.trim()
  if (tel) ut.push({ typ: 'telefon', text: tel })
  const ort = a.ort?.trim()
  if (ort) ut.push({ typ: 'ort', text: ort })
  return ut
}

/** Ett Dokument med bara huvudets delar, för CV-renderarens huvud. */
function huvudDokument(data: BrevData): Dokument {
  const namn = data.avsandare.namn?.trim() ?? ''
  return {
    namn,
    titel: data.avsandare.titel?.trim() ?? '',
    kontakt: kontaktRader(data),
    initial: (namn.match(/\p{L}/u)?.[0] ?? '').toUpperCase(),
    fullBredd: [],
    huvudspalt: [],
    sidospalt: [],
    rubriker: {} as Dokument['rubriker'],
    tidsaxel: [],
  }
}

/** Kontakten som lista (samma markup som CV-renderarens kontaktAvsnitt, som inte exporteras). */
function kontaktAvsnitt(rader: KontaktRad[], rubrik: string): string {
  if (!rader.length) return ''
  const li = rader.map((r) => `<li data-falt="${r.typ}">${r.typ === 'epost' ? esc(r.text).replace('@', '@<wbr>') : esc(r.text)}</li>`).join('')
  return `<section class="avsnitt avsnitt-kontakt" data-avsnitt="kontakt"><div class="start"><h2 class="rubrik" data-sektion="kontakt">${esc(
    rubrik
  )}</h2><ul class="kontakt kontakt-lista" data-falt="kontakt">${li}</ul></div></section>`
}

/* ------------------------------------------------------------- måtten */

/** Brödtextens grad, radavstånd och styckeluft per steg. */
export function brevMatt(def: MallDef, steg: BrevSteg): { grad: number; rad: number; luft: number } {
  // Brevet läses som löptext: en punkt över CV:ts brödtext och luftigare rader.
  const grad = Math.min(12, Math.max(10.5, def.grad.brod + 1))
  const rad = Math.min(1.6, Math.max(1.45, def.radavstand + 0.22))
  if (steg === 1) return { grad: grad - 0.5, rad: rad - 0.1, luft: 3.2 }
  if (steg === 2) return { grad: Math.max(9, grad - 1), rad: Math.max(1.3, rad - 0.2), luft: 2.6 }
  return { grad, rad, luft: 3.8 }
}

/** Huvudspaltens bredd i mm (för uppskattningen). */
export function textbreddMm(def: MallDef): number {
  const s = def.sida
  const l = def.layout
  if (l.typ === 'sidospalt' && l.spalt.kontakt) {
    const motsatt = l.spalt.sida === 'vanster' ? s.hoger : s.vanster
    return 210 - l.spalt.bredd - l.spalt.mellanrum - motsatt
  }
  return 210 - s.vanster - s.hoger
}

/**
 * Uppskattad höjd på brevet i mm vid ett steg, utan att rita det: tecken per
 * rad ur textbredden och graden (ungefär 0,5 em per tecken), plus huvudet och
 * de fasta raderna. Word-filen väljer sitt steg med den; HTML:en mäter.
 */
export function uppskattadHojd(defIn: MallDef, data: BrevData, steg: BrevSteg): number {
  const def = brevDef(defIn)
  const m = brevMatt(def, steg)
  const PT = 0.3528
  const bredd = textbreddMm(def)
  const tecken = Math.max(20, Math.floor(bredd / (m.grad * PT * 0.5)))
  const radMm = m.grad * m.rad * PT
  const stycken = rensadeStycken(data)
  const rader = stycken.reduce((sum, s) => sum + Math.max(1, Math.ceil(s.length / tecken)), 0)
  const h = def.huvud
  const band = h.form === 'band' && h.band ? Math.max(h.band.minHojd ?? 0, h.band.luft.topp + h.band.luft.botten + def.grad.namn * 1.2 * PT + 10) : 0
  const huvud = (band || def.sida.topp + def.grad.namn * 1.2 * PT + def.grad.titel * 1.4 * PT + (harKontaktspalt(def) ? 0 : 6)) + 14
  const fasta = 4 * radMm + 6.5 + 7.5 + 5 + radMm * 3 + 7
  return huvud + fasta + rader * radMm + stycken.length * m.luft
}

/** Steget som uppskattningen säger räcker för en sida (Word). */
export function uppskattatSteg(def: MallDef, data: BrevData): BrevSteg {
  const grans = 297 - def.sida.botten
  for (const s of [0, 1, 2] as const) if (uppskattadHojd(def, data, s) <= grans) return s
  return 2
}

/* ------------------------------------------------------------ brevets CSS */

function brevCss(def: MallDef, c: MallCtx): string {
  const { p, f } = c
  const h = def.huvud
  const l = def.layout
  const sida = def.farger.sida ?? '#ffffff'
  const r = def.rubrik

  // Ärenderaden i rubrikernas typsnitt och färg, om färgen syns mot papperet (Skylt har vita rubriker på band).
  const rubrikFarg = f(r.farg, p.accent)
  const arendeFarg = kontrast(rubrikFarg, sida) >= 4.5 ? rubrikFarg : p.text

  // Papperets bakgrund: sidospaltens färg i hela sidans höjd, Kants färgkant, annars sidans färg.
  let bakgrund: string = sida
  if (l.typ === 'sidospalt' && l.spalt.kontakt) {
    const s = l.spalt
    const riktning = s.sida === 'vanster' ? 'to right' : 'to left'
    if (s.bakgrund) bakgrund = `linear-gradient(${riktning},${f(s.bakgrund, p.ton)} ${s.bredd}mm,${sida} ${s.bredd}mm)`
    else if (s.linje)
      bakgrund = `linear-gradient(${riktning},${sida} calc(${s.bredd}mm - ${s.linje.pt}pt),${f(s.linje.farg, p.accent)} calc(${s.bredd}mm - ${s.linje.pt}pt),${f(
        s.linje.farg,
        p.accent
      )} ${s.bredd}mm,${sida} ${s.bredd}mm)`
  } else if (def.sidoremsa) {
    bakgrund = `linear-gradient(to right,${f(def.sidoremsa.farg, p.accent)} ${def.sidoremsa.mm}mm,${sida} ${def.sidoremsa.mm}mm)`
  }

  const steg = ([0, 1, 2] as const).map((s) => {
    const bm = brevMatt(def, s)
    return `.cv.brev${s ? `[data-steg="${s}"]` : ''}{--brev-grad:${bm.grad}pt;--brev-rad:${bm.rad};--brev-luft:${bm.luft}mm}`
  })

  const ut: string[] = [
    ...steg,
    `html,body{margin:0;padding:0;background:${sida}}
.cv.brev{position:relative;width:210mm;min-height:297mm;margin:0 auto;padding:0;background:${bakgrund};overflow:hidden}
.brev-topp{position:relative;z-index:1;padding:0 var(--sida-hoger) 0 var(--sida-vanster);margin-bottom:calc(-1 * var(--sida-topp))}
.brev .huvud-band,.brev .huvud-remsa{margin-top:0}
.brev .brev-topp .huvud,.brev .brev-huvudspalt .huvud{margin-bottom:0}
.brev-sida{width:100%;border-collapse:collapse;table-layout:fixed}
.brev-sida>*>tr>td{padding:0;vertical-align:top}
.brev-marg>td{height:var(--sida-topp)}
.brev-marg.brev-fot>td{height:var(--sida-botten)}
.brev-huvudspalt{padding:0 var(--sida-hoger) 0 var(--sida-vanster)!important}
.brev-text{font-family:var(--typsnitt);font-size:var(--brev-grad);line-height:var(--brev-rad);color:var(--text)}
.brev-text p{orphans:2;widows:2}
.brev-skiljare{flex:none}
.brev-datum{color:var(--dampad);font-size:calc(var(--brev-grad) - 1pt)}
.brev-mottagare{margin-top:6.5mm}
.brev-foretag{font-weight:700}
.brev-arende{margin-top:7.5mm;font-family:var(--typsnitt-rubrik);font-weight:700;font-size:calc(var(--brev-grad) + 1pt);line-height:1.35;color:${arendeFarg};break-after:avoid}
.brev-halsning{margin-top:5mm}
.brev-stycke,.brev-avslut{margin-top:var(--brev-luft)}
.brev-namn{margin-top:6.5mm;font-weight:700}
.brev-slut{display:block;height:0}
mark[data-krav]{background:rgba(47,125,91,.2);color:inherit;border-radius:2px;padding:0 1px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
mark[data-krav]:nth-of-type(even){background:rgba(47,125,91,.32)}
.brev-stycke[data-aktivt]{border-radius:1.5mm;outline:1.5pt solid #E07A2F;outline-offset:1.6mm;background:rgba(224,122,47,.07)}
.brev-markor{display:inline-block;width:2px;height:1.1em;margin-left:2px;vertical-align:-0.18em;background:#E07A2F;animation:brev-blink 1s steps(1) infinite}
@keyframes brev-blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.brev-markor{animation:none}}
@page{size:A4;margin:0}
@page:first{margin:0}
@media print{.cv.brev{width:210mm;min-height:296mm;margin:0;padding:0}}`,
  ]

  // Linjen under huvudet när huvudet inte har en egen avgränsning: rubrikernas linje i full bredd, eller
  // rubrikernas korta linje (Terrakotta, Tusch, Betong), annars en hårlinje i mallens linjefärg.
  const egenGrans = Boolean(h.linjeUnder || h.ram || h.form === 'band' || h.form === 'tidningshuvud' || h.form === 'block-vanster')
  const huvudISpalt = l.typ === 'sidospalt' && l.spalt.huvudISpalten
  if (!egenGrans && !huvudISpalt) {
    const rl = r.linje
    let linje: Linje & { langd?: number }
    if (rl && rl.var !== 'vanster') linje = rl
    else linje = { pt: 0.75, farg: 'linje' }
    const farg = f(linje.farg, p.linje)
    const bredd = linje.langd ? `${linje.langd}mm` : '100%'
    const centrerad = h.form === 'centrerad' ? 'margin-left:auto;margin-right:auto;' : h.form === 'hoger' ? 'margin-left:auto;' : ''
    ut.push(`.brev-skiljare{width:${bredd};${centrerad}border-top:${Math.max(0.5, linje.pt)}pt solid ${farg};margin-top:5.5mm;margin-bottom:8mm}`)
  } else {
    // Bandet och ramen avgränsar själva; under en linje i huvudet räcker luften.
    ut.push(`.brev-skiljare{height:${h.form === 'band' ? 10.5 : huvudISpalt ? 0 : 8}mm}`)
  }

  // Sidospalt: spalten i hela sidans höjd (papperets bakgrund), kontakten överst.
  if (l.typ === 'sidospalt' && l.spalt.kontakt) {
    const s = l.spalt
    const yttre = s.sida === 'vanster' ? 'var(--sida-vanster)' : 'var(--sida-hoger)'
    ut.push(`.brev .brev-sido{width:${s.bredd}mm;background:none;padding:0 ${s.sida === 'vanster' ? `${s.luft.inre}mm 0 ${yttre}` : `${yttre} 0 ${s.luft.inre}mm`}!important}
.brev-huvudspalt.med-spalt{padding:0 ${s.sida === 'vanster' ? `var(--sida-hoger) 0 ${s.mellanrum}mm` : `${s.mellanrum}mm 0 var(--sida-vanster)`}!important}
.brev .brev-sido .huvud{margin-bottom:8mm}`)
  }

  // Bandet utan foto: Mörkrums 72 mm höga band är byggt för fotot och tar en
  // fjärdedel av brevet; i brevet räcker 52 mm. Panoramas band får sin luft
  // från fotot i kanten; utan foto får texten bandets egen luft.
  if (h.form === 'band' && h.band) {
    if ((h.band.minHojd ?? 0) > 52) ut.push(`.brev .huvud-band{min-height:52mm}`)
    if (h.band.fotoTillKant) ut.push(`.brev .huvud-band{padding-top:12mm;padding-bottom:10mm;min-height:0}`)
  }

  // Sockeln (Sockel), ramen (Ramverk): mot arkets kant, inte fönstrets.
  if (def.sockel) ut.push(`.brev .sockel{position:absolute!important;left:0;right:0;bottom:0}`)
  if (def.sidram) ut.push(`.brev .sidram{position:absolute!important}`)

  return ut.join('\n')
}

/* ------------------------------------------------------------ brevet */

/** Stycket som HTML med kravens markeringar. */
function styckeHtml(text: string, traffar: Traff[]): string {
  const egna = traffar.slice().sort((a, b) => a.fran - b.fran)
  let ut = ''
  let i = 0
  for (const t of egna) {
    ut += esc(text.slice(i, t.fran))
    ut += `<mark data-krav="${t.nr}">${esc(text.slice(t.fran, t.till))}</mark>`
    i = t.till
  }
  return ut + esc(text.slice(i))
}

function brevText(data: BrevData, opt: BrevRenderVal): string {
  const stycken = rensadeStycken(data)
  const traffar = hittaMarkeringar(stycken, opt.markeringar)
  const skriver = typeof opt.skriverTill === 'number'
  const antal = skriver ? Math.max(0, Math.min(stycken.length, opt.skriverTill!)) : stycken.length
  const datum = datumRad(data)
  const foretag = data.mottagare.foretag?.trim()
  const person = data.mottagare.person?.trim()
  const arende = arendeRad(data)
  const delar: string[] = []
  if (datum) delar.push(`<p class="brev-datum">${esc(datum)}</p>`)
  if (foretag || person)
    delar.push(
      `<div class="brev-mottagare"${datum ? '' : ' style="margin-top:0"'}>${foretag ? `<p class="brev-foretag">${esc(foretag)}</p>` : ''}${
        person ? `<p class="brev-person">${esc(person)}</p>` : ''
      }</div>`
    )
  if (arende) delar.push(`<p class="brev-arende">${esc(arende)}</p>`)
  delar.push(`<p class="brev-halsning">${esc(halsningsRad(data))}</p>`)
  for (let i = 0; i < antal; i++) {
    const aktiv = opt.aktivtStycke === i ? ' data-aktivt=""' : ''
    const markor = skriver && i === antal - 1 ? '<span class="brev-markor" aria-hidden="true"></span>' : ''
    delar.push(`<p class="brev-stycke" data-stycke="${i}"${aktiv}>${styckeHtml(stycken[i], traffar.filter((t) => t.stycke === i))}${markor}</p>`)
  }
  if (skriver && antal === 0) delar.push('<p class="brev-stycke"><span class="brev-markor" aria-hidden="true"></span></p>')
  if (!skriver || antal >= stycken.length)
    delar.push(`<div class="brev-avslut"><p>${esc(avslutsRad(data.sprak))}</p><p class="brev-namn">${esc(data.avsandare.namn ?? '')}</p></div>`)
  return `<div class="brev-text">${delar.join('')}<span class="brev-slut" aria-hidden="true"></span></div>`
}

/**
 * Skriptet som väljer krympsteget: mäter var brevet slutar och provar steg 1
 * och 2 tills det ryms ovanför bottenmarginalen. Körs igen när typsnitten
 * laddats. BrevArk gör samma mätning i klienten (passa.ts).
 */
function passaSkript(granMm: number): string {
  return `<script>(function(){var b=document.querySelector('.cv.brev');if(!b||b.hasAttribute('data-last'))return;function h(){var s=b.querySelector('.brev-slut');return(s.getBoundingClientRect().top-b.getBoundingClientRect().top)*25.4/96}function p(){for(var i=0;i<3;i++){b.setAttribute('data-steg',String(i));if(h()<=${granMm})return}}p();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(p)})()</script>`
}

/** Gränsen i mm från arkets överkant som brevets sista rad ska stå ovanför. */
export function brevGransMm(def: MallDef): number {
  return 297 - def.sida.botten
}

/**
 * Brevet i mallen som fristående HTML-dokument, A4 i 210 mm bredd.
 *  - Citaten i `opt.markeringar` blir `<mark data-krav="n">` (n 1-baserat).
 *  - Varje stycke är `<p data-stycke="i">`; `opt.aktivtStycke` får data-aktivt.
 *  - `opt.skriverTill` visar bara de n första styckena med en skrivmarkör.
 * Okänt mall-id ger Linne.
 */
export function renderBrevHtml(mallId: string, data: BrevData, val: BrevVal = {}, opt: BrevRenderValUtokad = {}): string {
  const original = brevMallDef(mallId)
  const def = brevDef(original)
  const mv = mallValFor(def, val)
  const p = palett(def, mv)
  const c: MallCtx = { def, val: mv, p, opt: {}, f: (x, reserv) => los(x, p, reserv as Hex) }
  if (def.huvud.namnRader) {
    const m = matt(def, mv)
    c.namnPt = namnGradTvaRader(data.avsandare.namn ?? '', m.grad(def.grad.namn), def.huvud.namnRader.minPt, 210 - m.sida.vanster - m.sida.hoger)
  }
  const dok = huvudDokument(data)
  const h = def.huvud
  const l = def.layout
  const sv = data.sprak !== 'en'
  const kontaktRubrik = sv ? 'Kontakt' : 'Contact'

  const iTopp = h.form === 'band' || h.form === 'remsa'
  const spalt = l.typ === 'sidospalt' && l.spalt.kontakt ? l.spalt : null
  const huvudISpalt = Boolean(spalt?.huvudISpalten)

  const huvudHtml = huvudISpalt ? '' : mallHuvud(dok, c)
  const topp = iTopp ? `<div class="brev-topp">${huvudHtml}</div>` : ''
  const skiljare = '<div class="brev-skiljare" aria-hidden="true"></div>'
  const huvudspalt = `<td class="brev-huvudspalt${spalt ? ' med-spalt' : ''}">${iTopp ? '' : huvudHtml}${skiljare}${brevText(data, opt)}</td>`
  let rad = huvudspalt
  let kolumner = 1
  if (spalt) {
    const sido = `<td class="spalt spalt-sido brev-sido">${huvudISpalt ? mallHuvud(dok, c, true) : ''}${kontaktAvsnitt(dok.kontakt, kontaktRubrik)}</td>`
    rad = spalt.sida === 'vanster' ? `${sido}${huvudspalt}` : `${huvudspalt}${sido}`
    kolumner = 2
  }
  const colgroup = spalt
    ? spalt.sida === 'vanster'
      ? `<colgroup><col style="width:${spalt.bredd}mm"><col></colgroup>`
      : `<colgroup><col><col style="width:${spalt.bredd}mm"></colgroup>`
    : ''
  const span = kolumner > 1 ? ` colspan="${kolumner}"` : ''
  const tabell = `<table class="brev-sida" role="presentation">${colgroup}<thead><tr class="brev-marg"><td${span}></td></tr></thead><tfoot><tr class="brev-marg brev-fot"><td${span}></td></tr></tfoot><tbody><tr>${rad}</tr></tbody></table>`
  const sockel = def.sockel ? `<footer class="sockel">${kontaktAvsnitt(dok.kontakt, kontaktRubrik)}</footer>` : ''
  const sidram = def.sidram ? '<div class="sidram" aria-hidden="true"></div>' : ''

  const steg = opt.steg ?? 0
  const last = opt.steg !== undefined ? ' data-last=""' : ''
  const typsnitt = fontFace(allaTypsnitt(def, mv))
  const titel = sv ? `Personligt brev ${data.avsandare.namn ?? ''}`.trim() : `Cover letter ${data.avsandare.namn ?? ''}`.trim()

  return `<!DOCTYPE html>
<html lang="${sv ? 'sv' : 'en'}" data-mall="${esc(def.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<style>${typsnitt}</style>
<style>${mallCss(c)}</style>
<style>${brevCss(def, c)}</style>
</head>
<body><div class="cv brev mall-${esc(def.id)} familj-${def.familj}" data-steg="${steg}"${last}>${topp}${tabell}${sockel}${sidram}</div>${passaSkript(brevGransMm(def))}</body>
</html>`
}
