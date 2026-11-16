/**
 * HTML-renderaren: CV:t i en mall som ett fristående HTML-dokument för
 * förhandsvisningen, exempel-iframen och PDF:en (samma HTML, plan avsnitt 3.4).
 *
 * ATS-säker och semantisk:
 *  - namnet är dokumentets h1 (data-falt="namn") och första texten i DOM:en,
 *    titeln har data-falt="titel" (exempel-iframens textbyte, planens villkor c),
 *  - varje avsnitt är <section data-avsnitt> med <h2 data-sektion>, varje post
 *    har data-post,
 *  - två spalter är en tabell utan kanter (Chrome delar den över sidor);
 *    huvudet ligger ovanför, och den korta spalten står först i DOM:en så att
 *    den läses hel före huvudspalten (direction: rtl lägger en högerspalt
 *    till höger),
 *  - inget absolut placerat utom tidsaxelns punkter, ingen gradienttext,
 *    spärrning högst 0,16 em, ingen avstavning.
 *
 * Sidbrytningen ligger här, inte i mallarna: poster bryts aldrig mitt i,
 * rubriken hålls ihop med första posten, ingen ensam rad sist eller först på
 * en sida (orphans och widows), och sidmarginalerna gäller på varje sida
 * (@page). Mallens tokens står som CSS-variabler på :root, så att en
 * konstnärlig mall kan bygga vidare i `extraCss`.
 */
import { getFontFamilyForHTML } from '@/lib/documents/typsnitt'
import type { CVMetadata } from '../../cv-metadata'
import type { MallVal } from '../kontrakt'
import { los, matt, palett, typsnittFor, type Hex, type Palett } from '../farg'
import { fontFace } from '../typsnitt-filer'
import {
  byggDokument,
  intygDetalj,
  kompetensForm,
  visaFoto,
  type Avsnitt,
  type Dokument,
  type KontaktRad,
  type Post,
} from '../innehall'
import type { Farg, Linje, MallDef, TextStil } from '../typer'
import { getMall, getMallMedAlias, losMallIdEllerForval } from '../register'

export interface RenderaHtmlVal {
  /** Förhandsvisning: en tom fotoplats visar initialen. Aldrig i PDF:en. */
  forhandsvisning?: boolean
}

/* ----------------------------------------------------------- hjälpare */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Ett riktigt mellanslag som Chrome skriver ut i PDF:ens text, också mellan flexceller. */
const MELLAN = '<span class="mellan"> </span>'
/** " · " mellan uppgifter på en rad; varje uppgift är ett eget element. */
const PRICK = '<span class="prick">&nbsp;·</span> '
// Punkten sitter fast vid föregående uppgift med ett fast mellanslag, så att
// en rad aldrig börjar med punkten (G3).

interface Ctx {
  def: MallDef
  val: MallVal
  p: Palett
  opt: RenderaHtmlVal
  f: (x: Farg | undefined, reserv: Hex) => Hex
}

/** Marginalkolumnens bredd när layouten har en. */
function marginalBredd(def: MallDef): number | null {
  const l = def.layout
  return l.typ === 'marginalrubrik' || l.typ === 'marginalperiod' ? l.bredd : null
}

/* -------------------------------------------------------------- huvudet */

function kontaktLista(rader: KontaktRad[], form: 'rad' | 'lista'): string {
  if (!rader.length) return ''
  // En lång e-postadress bryts efter @ i en smal spalt.
  // I raden sitter punkten kvar på föregående uppgift, så att en rad aldrig börjar med den.
  const li = rader.map(
    (r, i) =>
      `<li data-falt="${r.typ}">${r.typ === 'epost' ? esc(r.text).replace('@', '@<wbr>') : esc(r.text)}${
        form === 'rad' && i < rader.length - 1 ? '<span class="prick" aria-hidden="true">&nbsp;·&nbsp;</span>' : ''
      }</li>`
  )
  return `<ul class="kontakt kontakt-${form}" data-falt="kontakt">${li.join('')}</ul>`
}

function foto(dok: Dokument, c: Ctx): string {
  const { def, val, opt } = c
  if (!def.foto || !visaFoto(def, val)) return ''
  const klass = `foto foto-${def.foto.form}`
  if (dok.foto) return `<img class="${klass}" src="${esc(dok.foto)}" alt="" data-falt="foto">`
  if (opt.forhandsvisning) return `<div class="${klass} foto-tom" aria-hidden="true" data-falt="foto">${esc(dok.initial)}</div>`
  return ''
}

function namnOchTitel(dok: Dokument): string {
  return `<h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1><p class="titel" data-falt="titel">${esc(dok.titel)}</p>`
}

function huvud(dok: Dokument, c: Ctx, iSpalt = false): string {
  const { def } = c
  const h = def.huvud
  const kontaktIHuvud = !(def.layout.typ === 'sidospalt' && def.layout.spalt.kontakt)
  const kontakt = kontaktIHuvud ? kontaktLista(dok.kontakt, h.kontakt) : ''
  const bild = def.foto && def.foto.plats !== 'sidospalt' && !iSpalt ? foto(dok, c) : ''
  const form = iSpalt ? 'vanster' : h.form
  // Fotot står efter texten i DOM:en (namnet först i läsordningen) och flyttas med order.
  if (form === 'block-vanster') {
    return `<header class="huvud huvud-block"><div class="namnruta">${`<h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1>`}</div><div class="huvud-text"><p class="titel" data-falt="titel">${esc(dok.titel)}</p>${kontakt}</div></header>`
  }
  if (form === 'tidningshuvud') {
    return `<header class="huvud huvud-tidning"><h1 class="namn" data-falt="namn">${esc(dok.namn)}</h1><div class="daterad"><p class="titel" data-falt="titel">${esc(
      dok.titel
    )}</p>${MELLAN}${kontakt}</div></header>`
  }
  const fotoKlass = def.foto ? ` foto-${def.foto.plats}` : ''
  return `<header class="huvud huvud-${form}${fotoKlass}${bild ? ' med-foto' : ''}"><div class="huvud-text">${namnOchTitel(dok)}${kontakt}</div>${bild}</header>`
}

/* ---------------------------------------------------------------- poster */

function post(p: Post, c: Ctx, sektion: string): string {
  const { def } = c
  const l = def.layout
  const titel = `<h3 class="posttitel">${esc(p.titel)}</h3>`
  const under = p.under ? `<p class="under">${esc(p.under)}</p>` : ''
  const text = p.text.map((t) => `<p class="posttext">${esc(t)}</p>`).join('')
  const punkter = p.punkter.length ? `<ul class="punkter">${p.punkter.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
  if (l.typ === 'marginalperiod') {
    let marg: string
    if (l.stortAr && p.startAr) {
      const slut = p.slut === 'Pågående' ? 'Pågående' : p.slut && p.slut !== p.startAr ? `till ${p.slut}` : ''
      marg = `<p class="period-marginal stort-ar"><span class="ar">${esc(p.startAr)}</span>${slut ? `${MELLAN}<span class="slut">${esc(slut)}</span>` : ''}</p>`
    } else {
      marg = p.period ? `<p class="period-marginal"><span class="period">${esc(p.period)}</span></p>` : ''
    }
    return `<div class="post post-${sektion} post-marginal" data-post>${marg}<div class="post-innehall">${titel}${under}${text}${punkter}</div></div>`
  }
  const period = p.period ? `${MELLAN}<span class="period">${esc(p.period)}</span>` : ''
  // En post i en smal spalt får brytas mellan punkterna (UX U6): hel blir den
  // ofta så hög att den lämnar ett stort tomrum i botten av sidan. Titeln och
  // de två första punkterna hålls ihop. Sista punkten får stå ensam överst på
  // nästa sida bara när den är minst två rader (cirka 70 tecken i spalten),
  // annars följer den med punkten före.
  const smal = l.typ === 'sidospalt' || l.typ === 'tvaspalt'
  const sista = p.punkter[p.punkter.length - 1] ?? ''
  if (smal && (p.punkter.length >= 4 || (p.punkter.length === 3 && sista.length >= 70))) {
    const li = p.punkter.map((t) => `<li>${esc(t)}</li>`)
    return `<div class="post post-${sektion} post-lang" data-post data-lang><div class="hall"><div class="postrad">${titel}${period}</div>${under}${text}<ul class="punkter">${li
      .slice(0, 2)
      .join('')}</ul></div><ul class="punkter fortsatt${sista.length < 70 ? ' sista-kort' : ''}">${li.slice(2).join('')}</ul></div>`
  }
  return `<div class="post post-${sektion}" data-post><div class="postrad">${titel}${period}</div>${under}${text}${punkter}</div>`
}

/* -------------------------------------------------------------- avsnitt */

/** En rad med etiketten i marginalkolumnen. */
function marginalRad(etikett: string, innehall: string, klass = ''): string {
  return `<div class="mrad ${klass}"><p class="metikett">${etikett}</p><div class="minnehall">${innehall}</div></div>`
}

function kompetenser(a: Avsnitt & { innehall: { typ: 'kompetenser' } }, c: Ctx, iSpalt: boolean): string[] {
  const form = kompetensForm(c.def, iSpalt)
  const grupper = a.innehall.grupper
  const lista = (l: string[]) => `<ul class="lista">${l.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
  switch (form) {
    case 'grupp':
      return grupper.map((g) => `<p class="grupp">${g.namn ? `<strong>${esc(g.namn)}:</strong> ` : ''}${g.lista.map(esc).join(', ')}</p>`)
    case 'mittpunkt':
      return grupper.map(
        (g) =>
          `<div class="grupp-mitt">${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}<p class="mittpunkt">${g.lista
            .map((s) => `<span class="kompetens">${esc(s)}</span>`)
            .join(PRICK)}</p></div>`
      )
    case 'lista':
      return grupper.map((g) => `<div class="grupp-lista">${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}${lista(g.lista)}</div>`)
    case 'brickor':
      return grupper.map(
        (g) =>
          `<div class="grupp-brickor">${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}<p class="brickor">${g.lista
            .map((s) => `<span class="bricka">${esc(s)}</span>`)
            .join(' ')}</p></div>`
      )
    case 'marginal':
      return grupper.map((g) => marginalRad(esc(g.namn), `<p>${g.lista.map(esc).join(', ')}</p>`))
    case 'spalter': {
      const rader: string[] = []
      for (let i = 0; i < grupper.length; i += 2) {
        const par = grupper.slice(i, i + 2)
        rader.push(
          `<tr>${par
            .map((g) => `<td>${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}${lista(g.lista)}</td>`)
            .join('')}${par.length < 2 ? '<td></td>' : ''}</tr>`
        )
      }
      return [`<table class="kompetensspalter" role="presentation"><tbody>${rader.join('')}</tbody></table>`]
    }
  }
}

function block(a: Avsnitt, c: Ctx, iSpalt: boolean): string[] {
  const { def } = c
  const inn = a.innehall
  const formIntyg = iSpalt ? 'lista' : def.intyg
  const formSprak = iSpalt ? 'lista' : def.sprak
  switch (inn.typ) {
    case 'text':
      return inn.stycken.map((t) => `<p class="text">${esc(t)}</p>`)
    case 'poster':
      return inn.poster.map((p) => post(p, c, a.sektion))
    case 'lista':
      if (iSpalt) return [`<ul class="lista">${inn.rader.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`]
      return [`<p class="rad">${inn.rader.map((r) => `<span>${esc(r)}</span>`).join(PRICK)}</p>`]
    case 'intyg': {
      if (formIntyg === 'marginal')
        return inn.rader.map((r) => marginalRad(esc(r.ar), `<p><span class="intyg-namn">${esc(r.namn)}</span>${r.utgivare ? `, <span class="intyg-detalj">${esc(r.utgivare)}</span>` : ''}</p>`))
      if (formIntyg === 'lista') {
        const rader = inn.rader.map(
          (r) => `<li><span class="intyg-namn">${esc(r.namn)}</span>${intygDetalj(r) ? `<br><span class="intyg-detalj">${esc(intygDetalj(r, ', '))}</span>` : ''}</li>`
        )
        return [`<ul class="intyglista">${rader.join('')}</ul>`]
      }
      const rader = inn.rader.map(
        (r) => `<div class="intygrad"><span class="intyg-namn">${esc(r.namn)}</span>${intygDetalj(r) ? `${MELLAN}<span class="intyg-detalj">${esc(intygDetalj(r))}</span>` : ''}</div>`
      )
      // Högst sex rader hålls ihop; längre listor bryts aldrig före tredje raden (G2).
      if (rader.length <= 6) return [`<div class="hall">${rader.join('')}</div>`]
      return [`<div class="hall">${rader.slice(0, 2).join('')}</div>`, ...rader.slice(2)]
    }
    case 'sprak': {
      if (formSprak === 'marginal') return inn.rader.map((r) => marginalRad(esc(r.sprak), `<p>${esc(r.niva)}</p>`))
      if (formSprak === 'lista')
        return [`<ul class="spraklista">${inn.rader.map((r) => `<li><span class="sprak">${esc(r.sprak)}</span>${r.niva ? `${MELLAN}<span class="niva">${esc(r.niva)}</span>` : ''}</li>`).join('')}</ul>`]
      return [`<p class="rad sprakrad">${inn.rader.map((r) => `<span><strong>${esc(r.sprak)}</strong>${r.niva ? ` ${esc(r.niva)}` : ''}</span>`).join(PRICK)}</p>`]
    }
    case 'kompetenser':
      return kompetenser(a as Avsnitt & { innehall: { typ: 'kompetenser' } }, c, iSpalt)
  }
}

function avsnitt(a: Avsnitt, c: Ctx, iSpalt: boolean): string {
  let delar = block(a, c, iSpalt)
  // Certifieringarna i ett fält i spalten (Kalksten, Granit): rubriken och raderna i en ruta.
  const intygsfalt = iSpalt && a.sektion === 'intyg' && c.def.layout.typ === 'sidospalt' && c.def.layout.spalt.intygsfalt
  const rubrik = `<h2 class="rubrik" data-sektion="${a.sektion}">${esc(a.rubrik)}</h2>`
  // Profilen i två spalter (Tidning) bara när den är minst 280 tecken; en
  // kortare profil ger gluggar i marginaljusteringen och står i en spalt.
  if (c.def.profilSpalter && a.sektion === 'profil' && !iSpalt && a.innehall.typ === 'text') {
    const langd = a.innehall.stycken.join(' ').length
    delar = [`<div class="${langd >= 280 ? 'profilspalter' : 'profilanfang'}">${delar.join('')}</div>`]
  }
  // Kompetensblock med högst sex grupper hålls ihop i sin helhet (G2, R6):
  // alla grupper står i .start med rubriken. (Avoid på hela avsnittet fick
  // Chrome att flytta blocket fast det rymdes, R7.)
  const hall = a.innehall.typ === 'kompetenser' && a.innehall.grupper.length <= 6
  const iStart = hall ? delar.length : 1
  const forsta = `<div class="start">${rubrik}${delar.slice(0, iStart).join('')}</div>`
  const klass = `avsnitt avsnitt-${a.sektion} typ-${a.innehall.typ}${intygsfalt ? ' intygsfalt' : ''}`
  return `<section class="${klass}" data-avsnitt="${a.sektion}">${forsta}${delar.slice(iStart).join('')}</section>`
}

function kontaktAvsnitt(dok: Dokument): string {
  if (!dok.kontakt.length) return ''
  return `<section class="avsnitt avsnitt-kontakt" data-avsnitt="kontakt"><div class="start"><h2 class="rubrik" data-sektion="kontakt">Kontakt</h2>${kontaktLista(
    dok.kontakt,
    'lista'
  )}</div></section>`
}

/** Tidsaxeln under huvudet (Horisont, bara PDF). Utgår med färre än två poster. */
function tidsaxel(dok: Dokument): string {
  const punkter = dok.tidsaxel
  if (punkter.length < 2) return ''
  return tidsaxelHtml(punkter, AXEL_BREDD_MM).html
}

/** Textbredden tidsaxeln ritas i, mm (A4 minus Horisonts marginaler). */
const AXEL_BREDD_MM = 170

/**
 * Tidsaxelns layout (granskningen 3.20): varje etikett läggs på första raden
 * av tre (0, 11, 22 mm) där den inte överlappar föregående etikett på samma
 * rad med minst 2 mm. Bredden räknas som 0,55 x grad x antal tecken (mm vid
 * 7,5 pt). Fler än sex punkter: bara årtal. Arbetsgivaren kortas till 18
 * tecken. Exporteras för testet som mäter att inget överlappar.
 */
export function tidsaxelHtml(punkter: Dokument['tidsaxel'], breddMm: number): { html: string; rader: number; lagen: { rad: number; fran: number; till: number }[] } {
  const forsta = punkter[0].ar
  const sista = new Date().getFullYear() + 1
  const pos = (ar: number) => 5 + ((ar - forsta) / Math.max(1, sista - forsta)) * 90
  const baraAr = punkter.length > 6
  const PT = 7.5
  const teckenMm = 0.55 * PT * 0.3528
  const slutPaRad = [-Infinity, -Infinity, -Infinity]
  const lagen: { rad: number; fran: number; till: number }[] = []
  const delar = punkter.map((p) => {
    const etikett = baraAr ? '' : p.etikett.length > 18 ? `${p.etikett.slice(0, 17).trimEnd()}…` : p.etikett
    const text = baraAr ? String(p.ar) : `${p.ar} ${etikett}`
    const x = (pos(p.ar) / 100) * breddMm
    const bredd = text.length * teckenMm
    // Etiketten börjar vid punkten men får inte gå utanför axelns högra kant.
    const fran = Math.min(x - 1.4, breddMm - bredd)
    let rad = slutPaRad.findIndex((slut) => fran >= slut + 2)
    if (rad < 0) rad = slutPaRad.indexOf(Math.min(...slutPaRad))
    slutPaRad[rad] = fran + bredd
    lagen.push({ rad, fran, till: fran + bredd })
    const forskjutning = (fran - (x - 1.4)).toFixed(2)
    return `<div class="axelpunkt axel-${p.typ} axel-rad${rad}" style="left:${pos(p.ar).toFixed(2)}%"><span class="axelprick"></span><span class="axeletikett" style="margin-left:${forskjutning}mm"><strong>${p.ar}</strong>${
      etikett ? `${MELLAN}${esc(etikett)}` : ''
    }</span></div>`
  })
  const rader = Math.max(...lagen.map((l) => l.rad)) + 1
  return { html: `<div class="tidsaxel axel-rader${rader}" aria-hidden="true">${delar.join('')}</div>`, rader, lagen }
}

/* ---------------------------------------------------------------- CSS */

function textStil(t: TextStil | undefined, c: Ctx, reservFarg: Hex): string {
  if (!t) return ''
  return [
    t.vikt ? `font-weight:${t.vikt}` : '',
    t.versaler ? 'text-transform:uppercase' : '',
    t.kursiv ? 'font-style:italic' : '',
    t.sparrning !== undefined ? `letter-spacing:${Math.min(t.sparrning, 0.16)}em` : '',
    `color:${c.f(t.farg, reservFarg)}`,
  ]
    .filter(Boolean)
    .join(';')
}

const linjeCss = (l: Linje, c: Ctx, reserv: Hex) => `${l.pt}pt solid ${c.f(l.farg, reserv)}`

function css(c: Ctx): string {
  const { def, val, p, f } = c
  const m = matt(def, val)
  const g = (pt: number) => `${m.grad(pt)}pt`
  const typ = typsnittFor(def, val)
  const h = def.huvud
  const r = def.rubrik
  const l = def.layout
  const mb = marginalBredd(def)
  const band = h.form === 'band' ? h.band : undefined
  const fotoMm = m.fotoMm
  const sidfarg = def.farger.sida ?? '#ffffff'

  const ut: string[] = []
  ut.push(`:root{--accent:${p.accent};--ton:${p.ton};--text:${p.text};--dampad:${p.dampad};--linje:${p.linje};--sida:${sidfarg};
--typsnitt:${getFontFamilyForHTML(typ.brod)};--typsnitt-rubrik:${getFontFamilyForHTML(typ.rubrik)};
--grad:${g(def.grad.brod)};--grad-namn:${g(def.grad.namn)};--grad-titel:${g(def.grad.titel)};--grad-kontakt:${g(def.grad.kontakt)};
--grad-rubrik:${g(def.grad.rubrik)};--grad-post:${g(def.grad.posttitel)};--grad-period:${g(def.grad.period)};--grad-spalt:${g(def.grad.sidospalt ?? def.grad.brod)};
--sida-topp:${m.sida.topp}mm;--sida-botten:${m.sida.botten}mm;--sida-vanster:${m.sida.vanster}mm;--sida-hoger:${m.sida.hoger}mm;
--radavstand:${m.radavstand};--marginal:${((mb ?? 0) * (l.typ === 'marginalperiod' && l.stortAr ? m.marginalSkala : 1)).toFixed(2)}mm;--punkt-indrag:${def.punkt.indrag}mm}`)
  ut.push(`*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:var(--sida)}
body{background:var(--sida);color:var(--text);font-family:var(--typsnitt);font-size:var(--grad);line-height:var(--radavstand);font-kerning:normal;hyphens:none;-webkit-hyphens:none;overflow-wrap:normal}
.cv{background:var(--sida);width:210mm;min-height:297mm;margin:0 auto;padding:var(--sida-topp) var(--sida-hoger) var(--sida-botten) var(--sida-vanster)}
.mellan{white-space:pre}
.prick{white-space:pre;color:${f('dampad', p.dampad)}}
h1,h2,h3{font:inherit}
.namn,.rubrik{font-family:var(--typsnitt-rubrik)}
p,li{orphans:2;widows:2}
ul{list-style:none}
strong{font-weight:700}`)

  // Huvudet
  ut.push(`.huvud{display:flex;gap:7mm;align-items:center;margin-bottom:${m.luftUnderHuvud}mm;break-inside:avoid;break-after:avoid}
.huvud-text{flex:1;min-width:0}
.namn{font-size:var(--grad-namn);line-height:${h.namn.radavstand ?? 1.1};${textStil({ vikt: 700, ...h.namn }, c, p.text)}}
.titel{font-size:var(--grad-titel);margin-top:${h.luftTitel}mm;${textStil(h.titel, c, p.accent)}}
.titel:empty{display:none}
.kontakt{font-size:var(--grad-kontakt);color:${f('dampad', p.dampad)};margin-top:${h.luftKontakt}mm}
.kontakt-rad{display:flex;flex-wrap:wrap}
.kontakt-lista li{line-height:1.5;overflow-wrap:anywhere}
.huvud-centrerad{flex-direction:column;text-align:center;gap:4mm}
.huvud-centrerad .kontakt-rad{justify-content:center}
.huvud-centrerad .foto{order:-1}
.huvud-hoger{text-align:right}
.huvud-hoger .kontakt-rad{justify-content:flex-end}
.foto-huvud-vanster .foto{order:-1}
.foto-huvud-hoger{align-items:flex-start}`)
  if (h.linjeUnder) {
    const lu = h.linjeUnder
    ut.push(
      lu.dubbel
        ? `.huvud{border-bottom:${lu.pt * 3 + 2}pt double ${f(lu.farg, p.linje)};padding-bottom:${lu.luft}mm}`
        : `.huvud{border-bottom:${linjeCss(lu, c, p.linje)};padding-bottom:${lu.luft}mm}`
    )
  }
  if (h.stapel) ut.push(`.huvud-text{border-left:${linjeCss(h.stapel, c, p.accent)};padding-left:${h.stapel.indrag}mm}`)
  if (band) {
    ut.push(`.huvud-band{background:${f(band.bakgrund, p.accent)};margin:0 calc(-1 * var(--sida-hoger)) ${m.luftUnderHuvud}mm calc(-1 * var(--sida-vanster));
padding:${band.luft.topp}mm ${band.luft.sidor}mm ${band.luft.botten}mm;${band.minHojd ? `min-height:${m.bandHojd(band.minHojd)}mm;` : ''}align-items:center}
.huvud-band .namn,.huvud-band .titel,.huvud-band .kontakt,.huvud-band .prick{color:${f(band.text, p.vit)}}
.huvud-band.foto-huvud-hoger{align-items:center}
@media screen{.huvud-band{margin-top:calc(-1 * var(--sida-topp))}}`)
  }
  if (h.form === 'block-vanster' && h.block) {
    const b = h.block
    ut.push(`.huvud-block{align-items:flex-end;gap:8mm}
.namnruta{flex:none;width:${b.storlek}mm;height:${b.storlek}mm;background:${f(b.bakgrund, p.accent)};padding:${b.luft}mm;display:flex;align-items:flex-end}
.namnruta .namn{color:${f(b.text, p.vit)}}
.huvud-block .titel{margin-top:0}`)
  }
  if (h.form === 'tidningshuvud') {
    ut.push(`.huvud-tidning{display:block;border-top:2pt solid ${p.text};text-align:center}
.huvud-tidning .namn{padding:2mm 0 1.5mm;border-bottom:0.5pt solid ${p.text}}
.daterad{display:flex;justify-content:space-between;align-items:baseline;gap:4mm;padding:1.5mm 0;border-bottom:0.5pt solid ${p.text};text-align:left}
.daterad .titel{margin:0}
.daterad .kontakt{margin:0;justify-content:flex-end}`)
  }

  // Foto
  ut.push(`.foto{display:block;flex:none;width:${fotoMm}mm;height:${fotoMm}mm;object-fit:cover;background:var(--ton)}
.foto-rund{border-radius:50%}
.foto-tom{display:flex;align-items:center;justify-content:center;font-family:var(--typsnitt-rubrik);font-size:${Math.round(fotoMm * 1.1)}pt;color:var(--accent)}`)

  // Rubriker
  const rl = r.linje
  let rubrikLinje = ''
  if (rl && rl.var === 'vanster') rubrikLinje = `border-left:${linjeCss(rl, c, p.accent)};padding-left:${rl.luft}mm;`
  else if (rl && !rl.langd) rubrikLinje = `border-${rl.var === 'under' ? 'bottom' : 'top'}:${linjeCss(rl, c, p.linje)};padding-${rl.var === 'under' ? 'bottom' : 'top'}:${rl.luft}mm;`
  ut.push(`.avsnitt{margin-top:${m.luftOver}mm}
.cv-kropp>.avsnitt:first-child,.spalt>.avsnitt:first-child{margin-top:0}
.start,.hall,.avsnitt.hall{break-inside:avoid}
.grupp,.grupp-mitt,.grupp-lista,.grupp-brickor,.spraklista,.intyglista{break-inside:avoid}
.gruppnamn{break-after:avoid}
.rubrik{font-size:var(--grad-rubrik);line-height:1.25;margin-bottom:${m.luftUnderRubrik}mm;${textStil({ vikt: 700, ...r }, c, p.accent)};${rubrikLinje}${
    r.justering === 'centrerad' ? 'text-align:center;' : ''
  }${r.indrag ? `padding-left:${r.indrag}mm;` : ''}break-after:avoid}`)
  if (rl?.langd) ut.push(`.rubrik::after{content:"";display:block;width:${rl.langd}mm;margin-top:${rl.luft}mm;border-top:${linjeCss(rl, c, p.accent)}}`)
  if (r.band) ut.push(`.rubrik{background:${f(r.band.bakgrund, p.ton)};padding:${(r.band.lodratt * m.bandLuftSkala).toFixed(2)}mm ${r.band.sidor}mm}`)
  if (r.kvadrat) ut.push(`.rubrik::before{content:"";display:inline-block;width:${r.kvadrat.mm}mm;height:${r.kvadrat.mm}mm;background:${f(r.kvadrat.farg, p.accent)};margin-right:${r.kvadrat.luft}mm;vertical-align:0.05em}`)

  // Layouten
  if (l.typ === 'marginalrubrik') {
    ut.push(`.cv-kropp .avsnitt{padding-left:var(--marginal)}
.cv-kropp .avsnitt::after{content:"";display:block;clear:both}
.cv-kropp .rubrik{float:left;width:calc(var(--marginal) - 4mm);margin-left:calc(-1 * var(--marginal));margin-bottom:0}`)
    if (l.linjeOver) ut.push(`.cv-kropp .avsnitt+.avsnitt,.cv-kropp .avsnitt+.slutgrupp>.avsnitt:first-child{border-top:${linjeCss(l.linjeOver, c, p.linje)};padding-top:${l.linjeOver.luft}mm}`)
  }
  if (l.typ === 'marginalperiod') {
    ut.push(`.post-marginal{display:flex;break-inside:avoid}
.period-marginal{flex:none;width:var(--marginal);padding-right:3mm}
.post-innehall{flex:1;min-width:0;padding-bottom:${m.luftMellan}mm}
.start+.post-marginal,.post+.post-marginal{margin-top:0}
.post-marginal+.post-marginal,.start>.post-marginal{margin-top:0}
.mrad{display:flex;break-inside:avoid}
.metikett{flex:none;width:var(--marginal);padding-right:3mm;font-weight:700}
.minnehall{flex:1;min-width:0}`)
    if (l.lodrat) ut.push(`.post-innehall{border-left:${linjeCss(l.lodrat, c, p.accent)};padding-left:${l.lodrat.luft}mm}`)
    if (l.indragAvsnitt) ut.push(`.cv-kropp .typ-text .text,.cv-kropp .typ-kompetenser .grupp,.cv-kropp .typ-kompetenser .grupp-mitt,.cv-kropp .typ-lista .rad,.cv-kropp .typ-intyg .intygrad,.cv-kropp .typ-sprak .sprakrad{margin-left:var(--marginal)}`)
    if (l.stortAr) ut.push(`.stort-ar .ar{display:block;font-size:${l.stortAr.pt}pt;line-height:1;font-weight:${l.stortAr.vikt};color:${l.stortAr.farg}}
.stort-ar .slut{display:block;font-size:9pt;color:#888;margin-top:1mm}
.stort-ar .mellan{display:none}`)
  } else {
    ut.push(`.mrad{display:flex;break-inside:avoid}.metikett{flex:none;width:30mm;font-weight:700}.minnehall{flex:1}`)
  }

  // Poster
  ut.push(`.post{break-inside:avoid;margin-top:${m.luftMellan}mm}
.post.post-lang{break-inside:auto}
.punkter.fortsatt{margin-top:0}
.punkter.fortsatt.sista-kort li:nth-last-child(2){break-after:avoid}
.slutgrupp{break-inside:avoid}
.start>.post{margin-top:0}
.postrad{display:flex;align-items:baseline}
.posttitel{flex:1;min-width:0;font-size:var(--grad-post);font-weight:700;line-height:1.3;color:${f(def.farger.posttitel, p.text)}}
.period{flex:none;padding-left:3mm;font-size:var(--grad-period);color:${f(def.farger.period, p.dampad)};${def.post.periodKursiv ? 'font-style:italic;' : ''}${def.post.periodFet ? 'font-weight:700;' : ''}font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}
.period-marginal .period{padding-left:0;text-align:left;white-space:normal}
.under{${textStil(def.post.arbetsgivare, c, f(def.farger.arbetsgivare, p.dampad))};margin-top:0.3mm}
.posttext{margin-top:0.8mm;color:${f('dampad', p.dampad)}}
.punkter,.lista{margin-top:1mm;padding-left:var(--punkt-indrag);list-style:"${def.punkt.tecken.replace(/"/g, '')}  " outside}
.punkter li,.lista li{margin-top:0.6mm;break-inside:avoid}
.punkter li::marker,.lista li::marker{color:${f(def.punkt.farg, p.text)}}
.text+.text,.start+.text{margin-top:1.5mm}`)
  // I spalterna (sidospalt, tvåspalt) ligger luften mellan posterna under posten,
  // inom dess odelbara ruta, som avståndet efter postens sista stycke i Word.
  // Båda formaten behöver då samma plats för en post i botten av sidan.
  if (l.typ === 'sidospalt' || l.typ === 'tvaspalt')
    ut.push(`.post{margin-top:0}.post::after{content:"";display:block;height:${m.luftMellan}mm}.avsnitt>.post:last-child::after,.avsnitt>.start:last-child>.post::after{display:none}`)
  if (def.post.linjeMellan) ut.push(`.start+.post,.post+.post{border-top:${linjeCss(def.post.linjeMellan, c, p.linje)};padding-top:${m.luftMellan}mm}`)

  // Kompetenser, intyg, språk
  ut.push(`.grupp+.grupp,.grupp-mitt+.grupp-mitt,.grupp-lista+.grupp-lista,.grupp-brickor+.grupp-brickor,.start+.grupp,.start+.grupp-mitt,.start+.grupp-lista,.start+.grupp-brickor{margin-top:1.4mm}
.spalt-sido .mittpunkt{font-size:9pt}
.spalt-sido .prick{color:inherit;opacity:0.7}
.spalt-sido .gruppnamn{margin-top:0.6mm}
.grupp strong,.gruppnamn{font-weight:700}
.gruppnamn{margin-bottom:0.4mm}
.grupp-lista .lista{margin-top:0.4mm}
.kompetensspalter{width:100%;border-collapse:collapse;table-layout:fixed;break-inside:avoid}
.kompetensspalter td{vertical-align:top;padding:0 6mm 1.5mm 0;width:50%}
.kompetensspalter td+td{padding-right:0}
.brickor{line-height:2}
.bricka{display:inline-block;line-height:1.35;border:0.75pt solid var(--accent);border-radius:3mm;padding:0.4mm 2.6mm;font-size:9pt;color:var(--accent);margin:0 1.5mm 1.5mm 0}
.intygrad,.spraklista li{display:flex;justify-content:space-between;align-items:baseline;gap:3mm;break-inside:avoid}
.intygrad+.intygrad{margin-top:0.8mm}
.intyg-detalj,.niva{color:${f('dampad', p.dampad)};font-size:var(--grad-period);text-align:right}
.intyglista li{break-inside:avoid}
.intyglista li+li{margin-top:1.5mm}
.intyglista .intyg-detalj{text-align:left}
.spraklista .sprak{font-weight:400}
.spraklista .niva{font-weight:700;color:inherit;font-size:inherit}
.avsnitt-referenser,.cv-kropp>.avsnitt-sprak,.cv-kropp>.avsnitt-intressen{break-before:avoid}
.slutgrupp .avsnitt{break-before:auto}
.avsnitt-referenser .text{color:${f('dampad', p.dampad)}}`)

  // Spalter
  if (l.typ === 'sidospalt') {
    const s = l.spalt
    const yttre = s.sida === 'vanster' ? 'var(--sida-vanster)' : 'var(--sida-hoger)'
    ut.push(`.spalter{width:calc(100% + var(--sida-vanster) + var(--sida-hoger));margin:0 calc(-1 * var(--sida-hoger)) 0 calc(-1 * var(--sida-vanster));border-collapse:collapse;table-layout:fixed}
.spalter>tbody>tr>td{direction:ltr;vertical-align:top;text-align:left}
${s.helSida ? `.spalter{height:calc(297mm - 1.5mm)}
.marg td{height:var(--sida-topp);padding:0}
.marg.fot td{height:var(--sida-botten)}
.cv{padding-top:0;padding-bottom:0}
@page{margin:0}` : s.bakgrund ? `.spalter{height:calc(297mm - ${band ? '0mm' : 'var(--sida-topp)'} - var(--sida-botten) - 1.5mm)}` : ''}
.huvudrad{height:1px}
.huvudcell{padding:0 var(--sida-hoger) 0 var(--sida-vanster)}
.huvudcell .huvud-band{margin-left:calc(-1 * var(--sida-vanster));margin-right:calc(-1 * var(--sida-hoger))}
.spalt-sido{width:${s.bredd}mm;padding:${s.luft.topp}mm ${s.sida === 'vanster' ? `${s.luft.inre}mm 0 ${yttre}` : `${yttre} 0 ${s.luft.inre}mm`};${
      s.bakgrund ? `background:${f(s.bakgrund, p.ton)};` : ''
    }color:${f(s.text, p.text)};font-size:var(--grad-spalt)}
.spalt-huvud{padding:${s.luft.topp}mm ${s.sida === 'vanster' ? `var(--sida-hoger) 0 ${s.mellanrum}mm` : `${s.mellanrum}mm 0 var(--sida-vanster)`}}
.spalt-sido .rubrik{${textStil(s.rubrik, c, f(r.farg, p.accent))};${s.rubrik?.pt ? `font-size:${m.grad(s.rubrik.pt)}pt;` : ''}${
      s.rubrik?.linje ? `border:0;border-bottom:${linjeCss(s.rubrik.linje, c, p.linje)};padding:0 0 ${s.rubrik.linje.luft}mm 0;` : ''
    }background:none}
.spalt-sido .rubrik::before,.spalt-sido .rubrik::after{display:none}
.spalt-sido .foto{margin:0 0 6mm}
.spalt-sido .kontakt{margin-top:0;color:inherit}
.spalt-sido .huvud{display:block;margin-bottom:6mm}
.spalt-sido .huvud .namn,.spalt-sido .huvud .titel{color:inherit}
.spalt-sido .niva,.spalt-sido .intyg-detalj{color:inherit;opacity:0.85}
.spalt-sido .lista li::marker{color:inherit}`)
    if (s.intygsfalt) {
      const fl = s.intygsfalt
      ut.push(`.intygsfalt .start,.intygsfalt{break-inside:avoid}
.intygsfalt{border:${linjeCss(fl.kant, c, p.linje)};padding:${fl.luft}mm;${fl.bakgrund ? `background:${f(fl.bakgrund, p.vit)};` : ''}}
.spalt-sido .intygsfalt .rubrik{border:0;padding:0}`)
    }
  }
  if (l.typ === 'tvaspalt') {
    ut.push(`.spalter{width:100%;border-collapse:collapse;table-layout:fixed}
.spalter>tbody>tr>td{vertical-align:top;direction:ltr;text-align:left}
.spalt-huvud{width:${(l.vansterAndel * 100).toFixed(2)}%;padding-right:${l.mellanrum / 2}mm}
.spalt-sido{padding-left:${l.mellanrum / 2}mm;font-size:var(--grad-spalt)}
.full-bredd{margin-bottom:${m.luftOver}mm}`)
  }

  // Profil i spalter (Tidning) och tidsaxeln (Horisont)
  if (def.profilSpalter) {
    ut.push(`.profilspalter{column-count:2;column-gap:7mm;text-align:left}
.profilanfang .text:first-child::first-letter{float:left;font-family:var(--typsnitt-rubrik);font-size:28pt;line-height:0.85;color:var(--accent);padding:1mm 1.5mm 0 0}
.profilspalter .text:first-child::first-letter{float:left;font-family:var(--typsnitt-rubrik);font-size:28pt;line-height:0.85;color:var(--accent);padding:1mm 1.5mm 0 0}`)
  }
  if (def.tidsaxel) {
    // "Få plats på en sida" krymper axelns rader först (UX U5).
    const k = m.steg >= 1 ? 0.75 : 1
    const mmk = (v: number) => `${(v * k).toFixed(2)}mm`
    ut.push(`.tidsaxel{position:relative;height:18mm;margin:0 0 ${m.luftOver}mm;border-top:1pt solid #B9C2CC;top:4mm}
.axelpunkt{position:absolute;top:-1.9mm;transform:translateX(-1.4mm)}
.axelprick{display:block;width:2.8mm;height:2.8mm;border-radius:50%;background:var(--accent);border:1pt solid var(--accent)}
.axel-utbildning .axelprick{background:#fff}
.axeletikett{display:block;font-size:7.5pt;white-space:nowrap;margin-top:1mm;color:#555}
.axeletikett strong{color:#222}
.axel-rad1 .axeletikett{margin-top:${mmk(11)}}
.axel-rad2 .axeletikett{margin-top:${mmk(22)}}
.axel-rad1::after,.axel-rad2::after{content:"";position:absolute;left:1.4mm;top:2.8mm;border-left:0.5pt solid #B9C2CC}
.axel-rad1::after{height:${mmk(9)}}
.axel-rad2::after{height:${mmk(20)}}
.tidsaxel.axel-rader1{height:${mmk(9)}}
.tidsaxel.axel-rader2{height:${mmk(20)}}
.tidsaxel.axel-rader3{height:${mmk(31)}}`)
  }

  // Sidan
  // Hel sida: Ritnings spalt och Terrakottas sidfärg från kant till kant (R5).
  const helSida = (l.typ === 'sidospalt' && Boolean(l.spalt.helSida)) || (l.typ === 'enspalt' && Boolean(def.farger.sida))
  ut.push(`@page{size:A4;margin:${helSida ? '0' : 'var(--sida-topp) 0 var(--sida-botten) 0'}}
${band ? '@page:first{margin-top:0}' : ''}
@media print{
  .cv{width:auto;min-height:0;margin:0;padding:0 var(--sida-hoger) 0 var(--sida-vanster)}
}`)
  if (helSida) {
    ut.push(`.cv{padding-top:0;padding-bottom:0}
.helsida{width:100%;border-collapse:collapse}
.helsida>tbody>tr>td{padding:0;vertical-align:top}
.marg td{height:var(--sida-topp);padding:0}
.marg.fot td{height:var(--sida-botten)}`)
  }
  if (!def.word && def.extraCss) ut.push(def.extraCss)
  return ut.join('\n')
}

/* ------------------------------------------------------------- dokument */

/** HTML för ett Dokument (används av renderMallHtml och testerna). */
export function renderDokumentHtml(dok: Dokument, def: MallDef, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  const p = palett(def, val)
  const c: Ctx = { def, val, p, opt, f: (x, reserv) => los(x, p, reserv) }
  const l = def.layout
  // De korta avsnitten sist i huvudspalten (intyg, språk, intressen,
  // referenser, högst tre) hålls ihop, så att sista sidan aldrig bara får en
  // ensam rad eller två (granskningen G2).
  const delar = dok.huvudspalt.map((a) => avsnitt(a, c, false))
  let slut = 0
  while (slut < 3 && slut < delar.length - 1 && ['intyg', 'sprak', 'intressen', 'referenser'].includes(dok.huvudspalt[delar.length - 1 - slut].sektion)) slut++
  const huvudspalt = slut > 1 ? `${delar.slice(0, -slut).join('')}<div class="slutgrupp">${delar.slice(-slut).join('')}</div>` : delar.join('')
  const axel = def.tidsaxel ? tidsaxel(dok) : ''

  let kropp: string
  if (l.typ === 'sidospalt') {
    const s = l.spalt
    const fotoISpalt = def.foto?.plats === 'sidospalt' ? foto(dok, c) : ''
    const sido = [
      s.huvudISpalten ? huvud(dok, c, true) : '',
      fotoISpalt,
      s.kontakt ? kontaktAvsnitt(dok) : '',
      ...dok.sidospalt.map((a) => avsnitt(a, c, true)),
    ].join('')
    // Spalten först i DOM:en. Chrome skriver PDF:ens text sida för sida i
    // DOM-ordning; den korta spalten ryms nästan alltid på sida 1, och då
    // läses den hel före huvudspalten i stället för mitt emellan sida 1 och
    // 2 av erfarenheten. direction: rtl lägger en högerspalt till höger.
    const celler = `<td class="spalt spalt-sido">${sido}</td><td class="spalt spalt-huvud cv-kropp">${huvudspalt}</td>`
    // Huvudet är tabellens första rad och tabellen minst en sida hög, så att
    // panelen alltid når nederkanten på sida 1 (granskningen G1, som Word).
    // Bara en panel med bakgrund behöver det; utan bakgrund står huvudet ovanför
    // tabellen (Chrome delar en tabell med en rad bättre över sidor).
    const iTabell = !s.huvudISpalten && Boolean(s.bakgrund)
    const huvudrad = iTabell ? `<tr class="huvudrad"><td class="huvudcell" colspan="2">${huvud(dok, c)}${axel}</td></tr>` : ''
    const fore = !s.huvudISpalten && !iTabell ? `${huvud(dok, c)}${axel}` : ''
    // Kolumnbredderna ur colgroup: med fast tabellayout läses de ur första
    // raden, och huvudraden har colspan (granskningen R1).
    const kolumner = `<colgroup><col style="width:${s.bredd}mm"><col></colgroup>`
    // Hel sida (Ritning): topp- och bottenmarginalen som rader som upprepas på varje sida (R5).
    const marg = s.helSida ? `<thead><tr class="marg"><td></td><td></td></tr></thead><tfoot><tr class="marg fot"><td></td><td></td></tr></tfoot>` : ''
    kropp = `${fore}<table class="spalter" role="presentation" style="direction:${s.sida === 'vanster' ? 'ltr' : 'rtl'}">${kolumner}${marg}<tbody>${huvudrad}<tr class="spaltrad">${celler}</tr></tbody></table>`
  } else if (l.typ === 'tvaspalt') {
    const full = dok.fullBredd.map((a) => avsnitt(a, c, false)).join('')
    const hoger = dok.sidospalt.map((a) => avsnitt(a, c, true)).join('')
    kropp = `${huvud(dok, c)}${axel}<div class="full-bredd cv-kropp">${full}</div><table class="spalter" role="presentation" style="direction:rtl"><tbody><tr><td class="spalt spalt-sido">${hoger}</td><td class="spalt spalt-huvud cv-kropp">${huvudspalt}</td></tr></tbody></table>`
  } else if (def.farger.sida) {
    // Sidfärg från kant till kant (Terrakotta): sidmarginalen 0 och topp- och
    // bottenmarginalen som tabellrader som upprepas på varje sida.
    kropp = `<table class="helsida" role="presentation"><thead><tr class="marg"><td></td></tr></thead><tfoot><tr class="marg fot"><td></td></tr></tfoot><tbody><tr><td>${huvud(
      dok,
      c
    )}${axel}<main class="spalt cv-kropp">${huvudspalt}</main></td></tr></tbody></table>`
  } else {
    kropp = `${huvud(dok, c)}${axel}<main class="spalt cv-kropp">${huvudspalt}</main>`
  }

  // Typsnitten som egna filer under Word-namnen (typsnitt-filer.ts): samma
  // typsnitt lokalt, i förhandsvisningen och i lambdan. PDF-kedjan bäddar in dem.
  const typ = typsnittFor(def, val)
  const typsnitt = fontFace([typ.brod, typ.rubrik])

  return `<!DOCTYPE html>
<html lang="sv" data-mall="${esc(def.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(dok.namn ? `CV ${dok.namn}` : 'CV')}</title>
<style>${typsnitt}</style>
<style>${css(c)}</style>
</head>
<body><div class="cv mall-${esc(def.id)} familj-${def.familj}">${kropp}</div></body>
</html>`
}

/** CV:t i en definition som HTML-dokument. */
export function renderDefHtml(cv: CVMetadata, def: MallDef, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  return renderDokumentHtml(byggDokument(cv, def, val), def, val, opt)
}

/**
 * CV:t i mallen som HTML-dokument. `mallId` får vara ett gammalt id (alias
 * löses); ett okänt id ger förvalsmallen. `opt.forhandsvisning` visar
 * initialen i en tom fotoplats, aldrig i PDF:en.
 */
export function renderMallHtml(cv: CVMetadata, mallId: string, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  const def = getMallMedAlias(mallId) ?? getMall(losMallIdEllerForval(mallId))!
  return renderDefHtml(cv, def, val, opt)
}
