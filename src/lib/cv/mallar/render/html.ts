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
import { allaTypsnitt, los, matt, palett, typsnittFor, type Hex, type Palett } from '../farg'
import { fontFace } from '../typsnitt-filer'
import {
  byggDokument,
  intygDetalj,
  kompetensForm,
  slutgruppAntal,
  spaltAntal,
  visaFoto,
  type Avsnitt,
  type Dokument,
  type KontaktRad,
  type Post,
} from '../innehall'
import type { Farg, Linje, MallDef, TextStil } from '../typer'
import { getMall, getMallMedAlias, losMallIdEllerForval } from '../register'
import type { Spokmarkering } from '../../bygg/spok'

export interface RenderaHtmlVal {
  /** Förhandsvisning: en tom fotoplats visar initialen. Aldrig i PDF:en. */
  forhandsvisning?: boolean
  /**
   * CV-byggarens spöktext (src/lib/cv/bygg/spok.ts): avsnitt med bara
   * exempel står i grått, namn och titel likaså, och profilens rad med
   * pennan under exemplet. Bara i förhandsvisningen, aldrig i en fil.
   */
  spok?: Spokmarkering
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
  /** Namnets grad när namnet står på två rader och krymps (Affisch). */
  namnPt?: number
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

/**
 * Namnet på två rader (Affisch): brytning vid sista mellanslaget, varje del
 * ett block. textContent är fortfarande hela namnet med mellanslag.
 * Graden krymps så att den längsta raden ryms, aldrig under `minPt`.
 */
function namnRader(dok: Dokument, c: Ctx): string {
  const nr = c.def.huvud.namnRader
  const namn = dok.namn
  const i = namn.lastIndexOf(' ')
  if (!nr || i < 0) return esc(namn)
  return `<span class="namnrad">${esc(namn.slice(0, i))}</span> <span class="namnrad">${esc(namn.slice(i + 1))}</span>`
}

/** Namnets grad med namnRader: den längsta raden ska rymmas i textbredden. */
export function namnGradTvaRader(namn: string, pt: number, minPt: number, breddMm: number): number {
  const i = namn.lastIndexOf(' ')
  const rader = i < 0 ? [namn] : [namn.slice(0, i), namn.slice(i + 1)]
  const langst = Math.max(...rader.map((r) => r.length))
  // Montserrat 700 i versaler: ungefär 0,74 em per tecken.
  const ryms = breddMm / (langst * 0.74 * 0.3528)
  return Math.max(minPt, Math.min(pt, Math.floor(ryms * 2) / 2))
}

function namnOchTitel(dok: Dokument, c?: Ctx): string {
  const namn = c?.def.huvud.namnRader ? namnRader(dok, c) : esc(dok.namn)
  return `<h1 class="namn" data-falt="namn">${namn}</h1><p class="titel" data-falt="titel">${esc(dok.titel)}</p>`
}

/** Initialerna i monogrammet: första bokstaven i första och sista ordet. */
export function initialer(namn: string): string {
  const ord = namn.split(/\s+/).filter(Boolean)
  const b = (s: string) => (s.match(/\p{L}/u)?.[0] ?? '').toUpperCase()
  if (!ord.length) return ''
  return ord.length === 1 ? b(ord[0]) : `${b(ord[0])}${b(ord[ord.length - 1])}`
}

function huvud(dok: Dokument, c: Ctx, iSpalt = false): string {
  const { def } = c
  const h = def.huvud
  const kontaktIHuvud = !(def.layout.typ === 'sidospalt' && def.layout.spalt.kontakt) && !def.sockel
  const kontakt = kontaktIHuvud ? kontaktLista(dok.kontakt, h.form === 'delad' ? 'lista' : h.kontakt) : ''
  const bild = def.foto && def.foto.plats !== 'sidospalt-topp' && !iSpalt ? foto(dok, c) : ''
  const form = iSpalt ? 'vanster' : h.form
  if (form === 'delad' || form === 'remsa') {
    const fotoKlass = def.foto ? ` foto-${def.foto.plats}` : ''
    return `<header class="huvud huvud-${form}${fotoKlass}${bild ? ' med-foto' : ''}"><div class="huvud-text">${namnOchTitel(dok, c)}</div>${kontakt}${bild}</header>`
  }
  if (h.monogram && !iSpalt) {
    const ini = initialer(dok.namn)
    const mono = ini ? `<div class="monogram" aria-hidden="true" data-initialer="${esc(ini)}"></div>` : ''
    return `<header class="huvud huvud-${form} med-monogram"><div class="huvud-text">${namnOchTitel(dok, c)}${kontakt}</div>${mono}</header>`
  }
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
  return `<header class="huvud huvud-${form}${fotoKlass}${bild ? ' med-foto' : ''}"><div class="huvud-text">${namnOchTitel(dok, c)}${kontakt}</div>${bild}</header>`
}

/* ---------------------------------------------------------------- poster */

function post(p: Post, c: Ctx, sektion: string): string {
  const { def } = c
  const l = def.layout
  const titel = `<h3 class="posttitel">${esc(p.titel)}</h3>`
  // Perioden efter arbetsgivaren (Lind): "Arbetsgivare · 2018 – 2021" på raden under titeln.
  const efterAg = def.post.periodPlats === 'efter-arbetsgivare' && l.typ !== 'marginalperiod'
  if (efterAg) {
    const rad = [p.under ? `<span class="ag">${esc(p.under)}</span>` : '', p.period ? `<span class="period">${esc(p.period)}</span>` : '']
      .filter(Boolean)
      .join('<span class="prick">&nbsp;·</span> ')
    p = { ...p, under: '', period: '' }
    const text = p.text.map((t) => `<p class="posttext">${esc(t)}</p>`).join('')
    const punkter = p.punkter.length ? `<ul class="punkter">${p.punkter.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
    return `<div class="post post-${sektion}" data-post><div class="postrad">${titel}</div>${rad ? `<p class="under">${rad}</p>` : ''}${text}${punkter}</div>`
  }
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
    const innehall = `<div class="post-innehall">${titel}${under}${text}${punkter}</div>`
    // Perioden i en högerkolumn (Furu): titeln först i läsordningen.
    if (l.sida === 'hoger') return `<div class="post post-${sektion} post-marginal" data-post>${innehall}${marg}</div>`
    return `<div class="post post-${sektion} post-marginal" data-post>${marg}${innehall}</div>`
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

/** En rad med etiketten i marginalkolumnen (till höger efter innehållet när kolumnen står till höger). */
function marginalRad(etikett: string, innehall: string, klass = '', hoger = false): string {
  if (hoger) return `<div class="mrad ${klass}"><div class="minnehall">${innehall}</div><p class="metikett">${etikett}</p></div>`
  return `<div class="mrad ${klass}"><p class="metikett">${etikett}</p><div class="minnehall">${innehall}</div></div>`
}

const kolumnHoger = (def: MallDef) => def.layout.typ === 'marginalperiod' && def.layout.sida === 'hoger'

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
      // Två grupper fyller två spalter; med tre spalter fyller tre eller fler grupper tre och radas (Not).
      const n = spaltAntal(c.def, grupper.length)
      const rader: string[] = []
      for (let i = 0; i < grupper.length; i += n) {
        const par = grupper.slice(i, i + n)
        rader.push(
          `<tr>${par
            .map((g) => `<td>${g.namn ? `<p class="gruppnamn">${esc(g.namn)}</p>` : ''}${lista(g.lista)}</td>`)
            .join('')}${'<td></td>'.repeat(n - par.length)}</tr>`
        )
      }
      return [`<table class="kompetensspalter spalter-${n}" role="presentation"><tbody>${rader.join('')}</tbody></table>`]
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
        return inn.rader.map((r) =>
          marginalRad(esc(r.ar), `<p><span class="intyg-namn">${esc(r.namn)}</span>${r.utgivare ? `, <span class="intyg-detalj">${esc(r.utgivare)}</span>` : ''}</p>`, '', kolumnHoger(def))
        )
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
      if (formSprak === 'marginal') return inn.rader.map((r) => marginalRad(esc(r.sprak), `<p>${esc(r.niva)}</p>`, '', kolumnHoger(def)))
      if (formSprak === 'lista')
        return [`<ul class="spraklista">${inn.rader.map((r) => `<li><span class="sprak">${esc(r.sprak)}</span>${r.niva ? `${MELLAN}<span class="niva">${esc(r.niva)}</span>` : ''}</li>`).join('')}</ul>`]
      return [`<p class="rad sprakrad">${inn.rader.map((r) => `<span><strong>${esc(r.sprak)}</strong>${r.niva ? ` ${esc(r.niva)}` : ''}</span>`).join(PRICK)}</p>`]
    }
    case 'kompetenser':
      return kompetenser(a as Avsnitt & { innehall: { typ: 'kompetenser' } }, c, iSpalt)
  }
}

/**
 * Spärrade versala rubriker i en smal marginalkolumn (Affisch): ett långt ord
 * ("ARBETSLIVSERFARENHET") får mindre spärrning så att det ryms i kolumnen i
 * stället för att gå in i innehållet. Uppskattning: versaler ungefär 0,63 em
 * breda plus spärrningen.
 */
function rubrikSparrning(text: string, c: Ctx, iSpalt: boolean): string {
  const l = c.def.layout
  const r = c.def.rubrik
  if (iSpalt || l.typ !== 'marginalrubrik' || !r.versaler || !r.sparrning) return ''
  const kolumn = l.bredd - (l.mellanrum ?? 4) - 1
  const emMm = matt(c.def, c.val).grad(c.def.grad.rubrik) * 0.3528
  const langst = Math.max(...text.split(/\s+/).map((o) => o.length))
  if (langst * (0.63 + r.sparrning) * emMm <= kolumn) return ''
  const ls = Math.max(0, kolumn / (langst * emMm) - 0.63)
  return ` style="letter-spacing:${ls.toFixed(3)}em"`
}

function avsnitt(a: Avsnitt, c: Ctx, iSpalt: boolean): string {
  let delar = block(a, c, iSpalt)
  // Certifieringarna i ett fält i spalten (Kalksten, Granit): rubriken och raderna i en ruta.
  const intygsfalt = iSpalt && a.sektion === 'intyg' && c.def.layout.typ === 'sidospalt' && c.def.layout.spalt.intygsfalt
  const rubrik = `<h2 class="rubrik" data-sektion="${a.sektion}"${rubrikSparrning(a.rubrik, c, iSpalt)}>${esc(a.rubrik)}</h2>`
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
  const spok = Boolean(c.opt.spok?.sektioner.includes(a.sektion))
  const l = c.def.layout
  const prick = !iSpalt && l.typ === 'marginalprick' && l.sektioner.includes(a.sektion) && a.innehall.typ === 'poster'
  const ruta = !iSpalt && Boolean(c.def.rutor && [...c.def.rutor.ruta, ...c.def.rutor.rutnat.flat()].includes(a.sektion))
  const klass = `avsnitt avsnitt-${a.sektion} typ-${a.innehall.typ}${intygsfalt ? ' intygsfalt' : ''}${prick ? ' tidslinje' : ''}${ruta ? ' ruta' : ''}${spok ? ' spok' : ''}`
  const rad =
    spok && a.sektion === 'profil' && c.opt.spok?.profilRad
      ? `<p class="spok-rad">${PENNA_SVG}<span>${esc(c.opt.spok.profilRad)}</span></p>`
      : ''
  return `<section class="${klass}" data-avsnitt="${a.sektion}"${spok ? ' data-spok="1"' : ''}>${forsta}${delar.slice(iStart).join('')}${rad}</section>`
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
--typsnitt:${getFontFamilyForHTML(typ.brod)};--typsnitt-rubrik:${getFontFamilyForHTML(typ.rubrik)};--typsnitt-namn:${getFontFamilyForHTML(typ.namn)};
--typsnitt-titel:${getFontFamilyForHTML(typ.titel)};--typsnitt-kontakt:${getFontFamilyForHTML(typ.kontakt)};
--grad:${g(def.grad.brod)};--grad-namn:${c.namnPt ? `${c.namnPt}pt` : g(def.grad.namn)};--grad-titel:${g(def.grad.titel)};--grad-kontakt:${g(def.grad.kontakt)};
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
.rubrik{font-family:var(--typsnitt-rubrik)}
.namn{font-family:var(--typsnitt-namn)}
.titel{font-family:var(--typsnitt-titel)}
.huvud .kontakt{font-family:var(--typsnitt-kontakt)}
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
${band.text ? `.huvud-band .namn,.huvud-band .titel,.huvud-band .kontakt,.huvud-band .prick{color:${f(band.text, p.vit)}}` : ''}
.huvud-band.foto-huvud-hoger{align-items:center}
${
  band.fotoTillKant
    ? `.huvud-band{padding-top:0;padding-bottom:0;min-height:${band.utanFotoHojd ?? band.minHojd ?? 48}mm}
.huvud-band.med-foto{padding-left:0;height:${m.fotoHojdMm}mm;min-height:0}
.huvud-band.med-foto .foto{align-self:stretch;height:${m.fotoHojdMm}mm}`
    : ''
}
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

  // Utbud 2: linje ovanför namnet, kort linje under, ram, delat huvud, remsa, monogram, två namnrader.
  if (h.linjeOver) ut.push(`.huvud{border-top:${linjeCss(h.linjeOver, c, p.text)};padding-top:${h.linjeOver.luft}mm}`)
  if (h.linjeUnder?.langd) {
    const lu = h.linjeUnder
    // Gapet i ett centrerat huvud (4 mm) räknas av, så att luften blir specens.
    const gap = h.form === 'centrerad' ? 4 : 7
    ut.push(`.huvud{border-bottom:0;padding-bottom:0}
.huvud::after{content:"";display:block;flex:none;width:${lu.langd}mm;border-top:${linjeCss(lu, c, p.accent)};margin-top:${Math.max(0, lu.luft - gap)}mm}`)
  }
  if (h.ram) {
    const ram = h.ram
    ut.push(`.huvud{border:${ram.dubbel ? `${ram.pt * 2 + 2}pt double` : `${ram.pt}pt solid`} ${f(ram.farg, p.accent)};padding:${ram.luft.lodratt}mm ${ram.luft.sidor}mm}`)
  }
  if (h.form === 'delad') {
    const botten = h.kontaktLage === 'botten'
    ut.push(`.huvud-delad{align-items:${botten ? 'flex-end' : 'center'}}
.huvud-delad .kontakt{flex:none;margin-top:0;text-align:right;${botten ? '' : 'align-self:center;'}}
.huvud-delad .kontakt-lista li{line-height:1.45}
.huvud-delad .kontakt-lista li+li{margin-top:0.4mm}
.foto-huvud-vanster .foto{order:-1}`)
    if (h.kontaktKolumner === 2) ut.push(`.huvud-delad .kontakt-lista{display:grid;grid-template-columns:auto auto;column-gap:5mm;justify-items:end}
.huvud-delad .kontakt-lista li+li{margin-top:0}`)
  }
  if (h.form === 'remsa' && h.remsa) {
    const rm = h.remsa
    ut.push(`.huvud-remsa{display:flex;flex-direction:column;align-items:stretch;gap:0}
.huvud-remsa .kontakt{order:-1;margin:0 calc(-1 * var(--sida-hoger)) ${rm.luft}mm calc(-1 * var(--sida-vanster));height:${rm.hojd}mm;padding:0 ${rm.sidor}mm;background:${f(rm.bakgrund, p.accent)};color:${f(rm.text, p.vit)};align-items:center;align-content:center;overflow:hidden}
.huvud-remsa .kontakt .prick{color:${f(rm.text, p.vit)}}
@media screen{.huvud-remsa{margin-top:calc(-1 * var(--sida-topp))}}`)
  }
  if (h.monogram) {
    const mo = h.monogram
    ut.push(`.med-monogram{gap:${mo.luft}mm}
.monogram{order:-1;flex:none;width:${mo.mm}mm;height:${mo.mm}mm;border-radius:50%;border:${linjeCss(mo.linje, c, p.accent)};display:flex;align-items:center;justify-content:center}
.monogram::before{content:attr(data-initialer);font-family:var(--typsnitt-rubrik);font-size:${mo.pt}pt;font-weight:${mo.vikt};letter-spacing:${mo.sparrning}em;margin-right:-${mo.sparrning}em;color:${f(mo.linje.farg, p.accent)};line-height:1}`)
  }
  if (h.namnRader) ut.push(`.namnrad{display:block}`)

  // Foto
  const fotoPlats = def.foto?.plats
  ut.push(`.foto{display:block;flex:none;width:${fotoMm}mm;height:${m.fotoHojdMm}mm;object-fit:cover;background:var(--ton)}
.foto-rund{border-radius:50%}
.foto-rundad{border-radius:3mm}
.foto-band-vanster .foto,.foto-huvud-topp-vanster .foto{order:-1}
.huvud.foto-huvud-topp-vanster{flex-direction:column;align-items:flex-start;gap:${def.foto?.luft ?? 5}mm}
.foto-tom{display:flex;align-items:center;justify-content:center;font-family:var(--typsnitt-rubrik);font-size:${Math.round(fotoMm * 1.1)}pt;color:var(--accent)}`)
  if (def.foto?.luft !== undefined && fotoPlats !== 'huvud-topp-vanster' && fotoPlats !== 'sidospalt-topp') ut.push(`.huvud.med-foto{gap:${def.foto.luft}mm}`)
  if (def.foto?.hanger && fotoPlats === 'huvud-hoger') {
    // Fotot bidrar inte till huvudets höjd; texten är minst så hög att fotot slutar 2 mm ovanför första avsnittet.
    ut.push(`.foto-huvud-hoger.med-foto .foto{margin-bottom:-${m.fotoHojdMm}mm}
.foto-huvud-hoger.med-foto .huvud-text{min-height:${Math.max(0, m.fotoHojdMm - m.luftUnderHuvud + 2).toFixed(2)}mm}`)
  }
  if (fotoPlats === 'sidospalt-topp') {
    ut.push(`.spalt-sido>.foto.foto{margin:0 ${def.foto?.justering === 'centrerad' ? 'auto' : '0'} 5mm}`)
  }

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
    r.justering === 'centrerad' ? 'text-align:center;' : r.justering === 'hoger' ? 'text-align:right;' : ''
  }${r.indrag ? `padding-left:${r.indrag}mm;` : ''}break-after:avoid}`)
  if (rl?.langd && rl.var === 'over') ut.push(`.rubrik::before{content:"";display:block;width:${rl.langd}mm;margin-bottom:${rl.luft}mm;border-top:${linjeCss(rl, c, p.accent)}}`)
  else if (rl?.langd) ut.push(`.rubrik::after{content:"";display:block;width:${rl.langd}mm;margin-top:${rl.luft}mm;border-top:${linjeCss(rl, c, p.accent)}}`)
  if (r.understruken) {
    const u = r.understruken
    ut.push(`.cv-kropp .rubrik{text-decoration:underline;text-decoration-color:${f(u.farg, p.accent)};text-decoration-thickness:${u.pt}pt;text-underline-offset:${u.avstand}mm;text-decoration-skip-ink:none}`)
  }
  if (r.linjeEfter) {
    const le = r.linjeEfter
    ut.push(`.cv-kropp .rubrik{display:flex;align-items:baseline}
.cv-kropp .rubrik::after{content:"";flex:1;min-width:6mm;margin-left:${le.luft}mm;border-bottom:${linjeCss(le, c, p.linje)};position:relative;top:-${le.hojd}mm}`)
  }
  if (r.nummer) {
    const nu = r.nummer
    ut.push(`.cv-kropp{counter-reset:avsnitt}
.cv-kropp .rubrik::before{counter-increment:avsnitt;content:counter(avsnitt,decimal-leading-zero);font-family:${getFontFamilyForHTML(nu.typsnitt)};font-size:${m.grad(nu.pt)}pt;font-weight:400;line-height:1;letter-spacing:0;text-transform:none;color:${f(nu.farg, p.accent)};margin-right:${nu.luft}mm}`)
  }
  if (r.band) ut.push(`.rubrik{background:${f(r.band.bakgrund, p.ton)};padding:${(r.band.lodratt * m.bandLuftSkala).toFixed(2)}mm ${r.band.sidor}mm}`)
  if (r.kvadrat) ut.push(`.rubrik::before{content:"";display:inline-block;width:${r.kvadrat.mm}mm;height:${r.kvadrat.mm}mm;background:${f(r.kvadrat.farg, p.accent)};margin-right:${r.kvadrat.luft}mm;vertical-align:0.05em}`)

  // Layouten
  if (l.typ === 'marginalrubrik') {
    ut.push(`.cv-kropp .avsnitt{padding-left:var(--marginal)}
.cv-kropp .avsnitt::after{content:"";display:block;clear:both}
.cv-kropp .rubrik{float:left;width:calc(var(--marginal) - ${l.mellanrum ?? 4}mm);margin-left:calc(-1 * var(--marginal));margin-bottom:0}`)
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
    // Periodkolumnen till höger (Furu): perioden högerställd på titelns rad, året för intyg likadant.
    if (l.sida === 'hoger')
      ut.push(`.period-marginal,.metikett{padding-right:0;padding-left:4mm;text-align:right}
.period-marginal .period{text-align:right;white-space:nowrap}
.avsnitt>.post-marginal:last-child .post-innehall,.avsnitt>.start:last-child>.post-marginal .post-innehall{padding-bottom:0}
.mrad .metikett{font-weight:400;font-size:var(--grad-period);color:${f(def.farger.period, p.dampad)};line-height:calc(var(--grad) * var(--radavstand))}`)
  } else if (l.typ === 'marginalprick') {
    // Prickad tidslinje (Spår): avsnitten indragna, linjen och punkterna i marginalen.
    const ut2 = l.indrag - l.kolumn
    ut.push(`.cv-kropp .avsnitt{padding-left:${l.indrag}mm}
.avsnitt.tidslinje .rubrik{margin-bottom:0}
.avsnitt.tidslinje .post{margin-top:0;padding-top:${m.luftMellan}mm;border-left:${l.linje.pt}pt dotted ${f(l.linje.farg, p.accent)};margin-left:-${ut2}mm;padding-left:calc(${ut2}mm - ${l.linje.pt}pt)}
.avsnitt.tidslinje .start>.post{padding-top:${m.luftUnderRubrik}mm}
.avsnitt.tidslinje .post::before{content:"";float:left;width:${l.punkt}mm;height:${l.punkt}mm;border-radius:50%;background:${f(l.linje.farg, p.accent)};margin:1.6mm 0 0 calc(-${ut2}mm - ${l.punkt / 2}mm + ${l.linje.pt / 2}pt)}
.avsnitt.tidslinje .start>.post::before{margin-top:1.6mm}
.mrad{display:flex;break-inside:avoid}.metikett{flex:none;width:30mm;font-weight:700}.minnehall{flex:1}`)
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
.under .period{padding-left:0;white-space:normal}
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
.kompetensspalter.spalter-3 td{width:33.33%;padding-right:5mm}
.kompetensspalter.spalter-3 td:last-child{padding-right:0}
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
@page{margin:0}` : s.bakgrund || s.linje ? `.spalter{height:calc(297mm - ${band ? '0mm' : 'var(--sida-topp)'} - var(--sida-botten) - 1.5mm)}` : ''}
${s.linje ? `.spalt-sido{border-${s.sida === 'vanster' ? 'right' : 'left'}:${linjeCss(s.linje, c, p.accent)}}` : ''}
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
    if (!s.helSida) {
      // Spalten flyter (granskningsvarv 2 av utbud 2): bakgrund och kant slutar där
      // spaltens innehåll slutar, och huvudspalten tar full textbredd på sidorna under
      // spalten. Spaltens minsta höjd når bottenmarginalen på sida 1 (sätts av skriptet
      // efter huvudet, som Word-panelen). Huvudspaltens block flödar bredvid spalten
      // som egna block (flow-root), så att linjer och punkter aldrig hamnar under den.
      const sidled = s.sida === 'vanster' ? 'left' : 'right'
      const mot = s.sida === 'vanster' ? 'right' : 'left'
      ut.push(`.spalter-flyt{margin:0 calc(-1 * var(--sida-hoger)) 0 calc(-1 * var(--sida-vanster));padding:0 var(--sida-hoger) 0 var(--sida-vanster)}
.spalter-flyt::after{content:"";display:block;clear:both}
.spalter-flyt>.spalt-sido{float:${sidled};margin-${sidled}:calc(-1 * var(--sida-${s.sida === 'vanster' ? 'vanster' : 'hoger'}));margin-${mot}:${s.mellanrum}mm}
.spalter-flyt>.spalt-huvud{padding:${s.luft.topp}mm 0 0}
.spalter-flyt>.spalt-huvud .avsnitt>*,.spalter-flyt>.spalt-huvud .start>*{display:flow-root}
.spalter-flyt>.spalt-huvud .avsnitt>.post,.spalter-flyt>.spalt-huvud .start>.post{break-inside:avoid}
.spalter-flyt>.spalt-huvud .avsnitt>.post.post-lang{break-inside:auto}`)
    }
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

  // Ram runt sidan (Ramverk), remsa längs vänsterkanten (Kant), sockel nederst (Sockel), rutor (Kakel).
  if (def.sidram) {
    const sr = def.sidram
    // !important: PDF-kedjans ATS-ordning (ats-ordning.ts) gör statiska block relative.
    // Fast i båda medierna: på varje utskriven sida, och i förhandsvisningen och miniatyren runt arket.
    ut.push(`.sidram{position:fixed!important;top:${sr.avstand}mm;right:${sr.avstand}mm;bottom:${sr.avstand}mm;left:${sr.avstand}mm;border:${linjeCss(sr, c, p.accent)};pointer-events:none}`)
  }
  if (def.sidoremsa) {
    const so = def.sidoremsa
    const bg = `linear-gradient(to right,${f(so.farg, p.accent)} ${so.mm}mm,var(--sida) ${so.mm}mm)`
    ut.push(`@media screen{.cv{background:${bg}}}
@media print{html{background:${bg}}body,.cv{background:transparent}}`)
  }
  if (def.sockel) {
    const so = def.sockel
    ut.push(`.sockel{height:${so.hojd}mm;background:${f(so.bakgrund, p.accent)};color:${f(so.text, p.vit)};padding:${so.luft.lodratt}mm ${so.luft.sidor}mm;display:grid;grid-template-columns:2fr 1fr;column-gap:8mm;font-size:9pt;line-height:1.35;overflow:hidden}
.sockel .avsnitt{margin:0}
.sockel .rubrik{color:inherit;border-bottom:0.5pt solid rgba(255,255,255,0.4);font-size:8pt;padding-bottom:0.8mm;margin-bottom:1.5mm}
.sockel .kontakt{margin:0;color:inherit;font-size:9pt}
.sockel .kontakt-lista{display:grid;grid-template-columns:1fr 1fr;column-gap:4mm}
.sockel .kontakt-lista li{line-height:1.35}
.sockel .spraklista li{justify-content:flex-start;gap:0}
.sockel .spraklista .sprak{flex:none;width:20mm}
.sockel .spraklista .sprak{font-weight:700}
.sockel .spraklista .niva{font-weight:400}
.sockel .rad,.sockel .lista{color:inherit}
.sockel{position:fixed!important;left:0;right:0;bottom:0}`)
  }
  if (def.rutor) {
    const ru = def.rutor
    ut.push(`.ruta{background:${f(ru.bakgrund, p.ton)};padding:${ru.luft}mm;break-inside:avoid}
.ruta .start{break-inside:avoid}
.rutnat{width:calc(100% + ${2 * ru.mellanrum}mm);margin:${(m.luftOver - ru.mellanrum).toFixed(2)}mm -${ru.mellanrum}mm -${ru.mellanrum}mm;border-collapse:separate;border-spacing:${ru.mellanrum}mm;table-layout:fixed}
.rutnat td{width:50%;vertical-align:top;padding:0}
.rutnat tr{break-inside:avoid}
.rutnat .avsnitt{margin-top:0}
.rutnat .ruta{break-inside:avoid}`)
  }

  // Sidan
  // Hel sida: Ritnings spalt och Terrakottas sidfärg från kant till kant (R5), och
  // utbud 2:s sidram, sidoremsa och sockel (fasta element mäts från papperskanten).
  const helSida =
    (l.typ === 'sidospalt' && Boolean(l.spalt.helSida)) ||
    (l.typ !== 'sidospalt' && l.typ !== 'tvaspalt' && Boolean(def.farger.sida || def.sidram || def.sidoremsa || def.sockel))
  ut.push(`@page{size:A4;margin:${helSida ? '0' : 'var(--sida-topp) 0 var(--sida-botten) 0'}}
${band || h.form === 'remsa' ? '@page:first{margin-top:0}' : ''}
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

/* ------------------------------------------------------------ spöktext */

/** Pennan (MallIkoner, IkonPenna) i profilens rad. */
const PENNA_SVG =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M13 8l3 3"/></svg>'

/** Grått som i skissen; rubrikerna behåller mallens färg och linjer. */
const SPOK_CSS = `.avsnitt[data-spok] :not(.rubrik):not(.rubrik *){color:#A6A6AE!important}
.avsnitt[data-spok] li::marker{color:#A6A6AE!important}
.avsnitt[data-spok] p.spok-rad.spok-rad,.avsnitt[data-spok] p.spok-rad.spok-rad *{color:#4A4A55!important}
p.spok-rad{display:flex;align-items:center;gap:1.5mm;margin-top:2mm;font-size:8.5pt;line-height:1.35;font-weight:500}
p.spok-rad svg{flex:0 0 auto;color:#65656E!important}
.spok-namn [data-falt="namn"],.spok-titel [data-falt="titel"]{color:#A6A6AE!important}`

/* ------------------------------------------------------------- dokument */

/** HTML för ett Dokument (används av renderMallHtml och testerna). */
export function renderDokumentHtml(dok: Dokument, def: MallDef, val: MallVal = {}, opt: RenderaHtmlVal = {}): string {
  const p = palett(def, val)
  const c: Ctx = { def, val, p, opt, f: (x, reserv) => los(x, p, reserv) }
  if (def.huvud.namnRader) {
    const m = matt(def, val)
    c.namnPt = namnGradTvaRader(dok.namn, m.grad(def.grad.namn), def.huvud.namnRader.minPt, 210 - m.sida.vanster - m.sida.hoger)
  }
  const l = def.layout
  // De korta avsnitten sist i huvudspalten (intyg, språk, intressen,
  // referenser, högst tre) hålls ihop, så att sista sidan aldrig bara får en
  // ensam rad eller två (granskningen G2).
  let delar = dok.huvudspalt.map((a) => avsnitt(a, c, false))
  let sektioner = dok.huvudspalt.map((a) => a.sektion as string)
  // Rutnätet (Kakel): avsnitten i rutnätet samlas där det första av dem står,
  // det första i vänster spalt och resten staplade i höger.
  if (def.rutor) {
    const iRutnat = def.rutor.rutnat.flat()
    const iNat = dok.huvudspalt.map((a) => iRutnat.includes(a.sektion))
    const forsta = iNat.indexOf(true)
    if (forsta >= 0) {
      // En tabellrad per rutrad: Chrome bryter sidan mellan raderna, aldrig inuti en ruta.
      const per = new Map(dok.huvudspalt.map((a, i) => [a.sektion as string, delar[i]]))
      const rader = def.rutor.rutnat
        // Raden fylls från vänster: saknas det vänstra avsnittet står det högra till vänster och högercellen är tom.
        .map((rad) => rad.map((s) => per.get(s)).filter((x): x is string => Boolean(x)))
        .filter((rad) => rad.length)
        .map((rad) => `<tr><td>${rad[0]}</td><td>${rad[1] ?? ''}</td></tr>`)
      const rutnat = `<table class="rutnat" role="presentation"><tbody>${rader.join('')}</tbody></table>`
      const nya: string[] = []
      const nyaS: string[] = []
      delar.forEach((d, i) => {
        if (i === forsta) {
          nya.push(rutnat)
          nyaS.push('rutnat')
        } else if (!iNat[i]) {
          nya.push(d)
          nyaS.push(sektioner[i])
        }
      })
      delar = nya
      sektioner = nyaS
    }
  }
  const slut = slutgruppAntal(sektioner)
  const huvudspalt = slut > 1 ? `${delar.slice(0, -slut).join('')}<div class="slutgrupp">${delar.slice(-slut).join('')}</div>` : delar.join('')
  const axel = def.tidsaxel ? tidsaxel(dok) : ''

  let kropp: string
  if (l.typ === 'sidospalt') {
    const s = l.spalt
    const fotoISpalt = def.foto?.plats === 'sidospalt-topp' ? foto(dok, c) : ''
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
    if (!s.helSida) {
      // Flytande spalt (granskningsvarv 2): huvudet ovanför, spalten först i DOM:en,
      // huvudspalten flödar bredvid och tar full bredd under spalten. Skriptet ger
      // spalten minsta höjd till bottenmarginalen på sida 1 (samma mått i skärm och
      // utskrift: avståndet från arkets överkant); utan skript slutar den med innehållet.
      // Millimetern mäts på arket (.cv är 210 mm brett), inte som 96/25,4 px:
      // i förhandsvisningen skalas iframen med zoom (matning.ts), och då
      // redovisar webbläsaren lägena skalade. Med fast 96/25,4 blev avståndet
      // till huvudet för kort, spalten för hög och arket räknades som två sidor
      // (Kalksten, "Sida 1 av 2"). Utan zoom (PDF:en) är talet detsamma som förut.
      const botten = matt(def, val).sida.botten
      const skript = `<script>(function(){var s=document.querySelector('.spalter-flyt>.spalt-sido'),cv=document.querySelector('.cv');if(!s||!cv)return;function satt(){s.style.minHeight='';var mm=cv.getBoundingClientRect().width/210||96/25.4,av=(s.getBoundingClientRect().top-cv.getBoundingClientRect().top)/mm;s.style.minHeight=Math.max(0,297-${botten}-av-1.5).toFixed(2)+'mm'}satt();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(satt)})()</script>`
      kropp = `${huvud(dok, c)}${axel}<div class="spalter-flyt"><aside class="spalt spalt-sido">${sido}</aside><main class="spalt spalt-huvud cv-kropp">${huvudspalt}</main></div>${skript}`
    } else {
    const celler = `<td class="spalt spalt-sido">${sido}</td><td class="spalt spalt-huvud cv-kropp">${huvudspalt}</td>`
    // Huvudet är tabellens första rad och tabellen minst en sida hög, så att
    // panelen alltid når nederkanten på sida 1 (granskningen G1, som Word).
    // Bara en panel med bakgrund behöver det; utan bakgrund står huvudet ovanför
    // tabellen (Chrome delar en tabell med en rad bättre över sidor).
    const iTabell = !s.huvudISpalten && Boolean(s.bakgrund || s.linje)
    const huvudrad = iTabell ? `<tr class="huvudrad"><td class="huvudcell" colspan="2">${huvud(dok, c)}${axel}</td></tr>` : ''
    const fore = !s.huvudISpalten && !iTabell ? `${huvud(dok, c)}${axel}` : ''
    // Kolumnbredderna ur colgroup: med fast tabellayout läses de ur första
    // raden, och huvudraden har colspan (granskningen R1).
    const kolumner = `<colgroup><col style="width:${s.bredd}mm"><col></colgroup>`
    // Hel sida (Ritning): topp- och bottenmarginalen som rader som upprepas på varje sida (R5).
    const marg = s.helSida ? `<thead><tr class="marg"><td></td><td></td></tr></thead><tfoot><tr class="marg fot"><td></td><td></td></tr></tfoot>` : ''
    kropp = `${fore}<table class="spalter" role="presentation" style="direction:${s.sida === 'vanster' ? 'ltr' : 'rtl'}">${kolumner}${marg}<tbody>${huvudrad}<tr class="spaltrad">${celler}</tr></tbody></table>`
    }
  } else if (l.typ === 'tvaspalt') {
    const full = dok.fullBredd.map((a) => avsnitt(a, c, false)).join('')
    const hoger = dok.sidospalt.map((a) => avsnitt(a, c, true)).join('')
    kropp = `${huvud(dok, c)}${axel}<div class="full-bredd cv-kropp">${full}</div><table class="spalter" role="presentation" style="direction:rtl"><tbody><tr><td class="spalt spalt-sido">${hoger}</td><td class="spalt spalt-huvud cv-kropp">${huvudspalt}</td></tr></tbody></table>`
  } else if (def.farger.sida || def.sidram || def.sidoremsa || def.sockel) {
    // Sidfärg från kant till kant (Terrakotta), sidram, sidoremsa och sockel:
    // sidmarginalen 0 och topp- och bottenmarginalen som tabellrader som
    // upprepas på varje sida, så att de fasta elementen mäts från papperskanten.
    // Sockeln står sist i DOM:en (kontakt och språk läses sist).
    const sockel = def.sockel
      ? `<footer class="sockel">${kontaktAvsnitt(dok)}${dok.sidospalt.map((a) => avsnitt(a, c, true)).join('')}</footer>`
      : ''
    kropp = `<table class="helsida" role="presentation"><thead><tr class="marg"><td></td></tr></thead><tfoot><tr class="marg fot"><td></td></tr></tfoot><tbody><tr><td>${huvud(
      dok,
      c
    )}${axel}<main class="spalt cv-kropp">${huvudspalt}</main></td></tr></tbody></table>${sockel}${def.sidram ? '<div class="sidram" aria-hidden="true"></div>' : ''}`
  } else {
    kropp = `${huvud(dok, c)}${axel}<main class="spalt cv-kropp">${huvudspalt}</main>`
  }

  // Typsnitten som egna filer under Word-namnen (typsnitt-filer.ts): samma
  // typsnitt lokalt, i förhandsvisningen och i lambdan. PDF-kedjan bäddar in dem.
  const typsnitt = fontFace(allaTypsnitt(def, val))

  return `<!DOCTYPE html>
<html lang="sv" data-mall="${esc(def.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(dok.namn ? `CV ${dok.namn}` : 'CV')}</title>
<style>${typsnitt}</style>
<style>${css(c)}</style>${opt.spok ? `<style>${SPOK_CSS}</style>` : ''}
</head>
<body><div class="cv mall-${esc(def.id)} familj-${def.familj}${opt.spok?.namn ? ' spok-namn' : ''}${opt.spok?.titel ? ' spok-titel' : ''}">${kropp}</div></body>
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

/* Brevmallen (src/lib/letters/brevmall/render.ts) ritar brevets huvud med samma delar. Bara exporter, inget ändrat. */
export { css as mallCss, huvud as mallHuvud }
export type { Ctx as MallCtx }
