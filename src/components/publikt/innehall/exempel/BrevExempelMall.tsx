/**
 * Brevexemplet per yrke i publikt omgång 3 (skissen brev-exempel, noten
 * docs/design/publikt-omgang3/noter/brev-exempel.md, SEO:s besked 13).
 * /personligt-brev-exempel/[yrke], 89 sidor. Serverkomponent; klientkod
 * bara i "Byt mall" (MallValjare), mätningen och den fasta knappraden.
 *
 * SEO: brevets text, h1 (yrket), alla h2 och h3 i samma ordning och med
 * samma text, FAQ, interna länkar och ankartexter står ordagrant som i
 * ExempelMall (typ brev), som sidtypen använde före omgång 3. Metadata och
 * schemat ligger kvar i page.tsx. Hjältens och kommentarskortets länk är
 * /skapa-brev/start?yrke=<yrke>, ordagrant; bara visarens knapp får mallen
 * i adressen. Ändrat i text: slutet säger "klart på några minuter" (SEO JA).
 *
 * CV-exemplen (/cv-exempel/[yrke]) ritas fortfarande av ExempelMall.
 */

import Link from 'next/link'
import StickyMobileCTA from '@/components/shared/StickyMobileCTA'
import ExempelKlient from '@/components/exempel-shared/ExempelKlient'
import YrkesKarta from '@/components/jobbkartan/YrkesKarta'
import { BREV_MALL_ANTAL, MINIATYR_BREDD, MINIATYR_HOJD, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import { visarAllaLank, visarFot, visarMallar } from '@/components/publikt/brevvisare/visare-data'
import { BREV_GALLERI, CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'
import { getAllPostsMeta } from '@/lib/blog'
import { Sida, Hjalte, Sektion, SektionHuvud, Chip, Nr, Faq, Knapp, TextLank, Brevpar, MallMiniatyr, Ikon } from '@/components/publikt/v3'
import { FORVALD_MALL_ID } from '@/lib/cv/mallar/katalog'
import MallValjare, { type BrevValjarData } from './MallValjare'
import BrevYrkesKort from './BrevYrkesKort'
import Rik, { inline } from './Rik'
import { tolka } from './TipsKort'
import { brevFalt } from './Papper'
import { ankarNummer, brevStycken, fragor, numrera, punkter, type Ankare } from './exempel-data'
import '@/components/publikt/publikt.css'
import './brev-exempel.css'

function kategoriNamn(kategori: string | undefined): string | undefined {
  const slug = kategori === 'teknik' ? 'tech' : kategori
  return KATEGORIER.find((k) => k.slug === slug)?.namn
}

function antalOrd(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

/**
 * Exempelmeningen i ett tips i egen ruta (SEO: bara om alla ord står kvar).
 * Regeln: ett stycke som slutar med ett kolon följt av en mening inom
 * citattecken. Passar regeln inte står stycket som det är.
 */
function delaCitat(text: string): { fore: string; citat: string } | null {
  const m = text.match(/^([\s\S]*?:)\s*("[^"]{12,}"[.!]?)\s*$/)
  return m ? { fore: m[1], citat: m[2] } : null
}

function TipsText({ text }: { text: string }) {
  let citatAnvant = false
  return (
    <>
      {tolka(text).map((d, j) => {
        if (d.typ === 'rub') return <p key={j} className="bx-fe-rub">{d.text}</p>
        if (d.typ === 'fe')
          return (
            <div key={j} className="bx-fe">
              {d.fore ? (
                <p className="bx-fore">
                  <small>Före</small>
                  {inline(d.fore)}
                </p>
              ) : null}
              {d.efter ? (
                <p className="bx-efter">
                  <small>Efter</small>
                  {inline(d.efter)}
                </p>
              ) : null}
            </div>
          )
        const delad = !citatAnvant && d.typ === 'p' ? delaCitat(d.text) : null
        if (delad) {
          citatAnvant = true
          return (
            <div key={j}>
              <p>{inline(delad.fore)}</p>
              <p className="bx-citat">{inline(delad.citat)}</p>
            </div>
          )
        }
        return (
          <p key={j} className={d.typ === 'efterNot' ? 'bx-efter-not' : undefined}>
            {inline(d.text)}
          </p>
        )
      })}
    </>
  )
}

/** Arket i hjälten (bara brett läge, aria-hidden): brevets början i Linne, två mallar bakom. */
function HjalteArk({ brev, lappar }: { brev: ReturnType<typeof brevFalt>; lappar: { nr?: number; rubrik: string }[] }) {
  const { halsning, stycken } = brevStycken(brev.brevText)
  return (
    <div className="bx-hjalte-ark" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bx-bakom bx-bakom-v" src={brevMiniatyrSrc('koppar')} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bx-bakom bx-bakom-h" src={brevMiniatyrSrc('ritning')} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} decoding="async" />
      <div className="bx-a4 bx-a4-liten">
        <p className="bx-a4-namn">{brev.namn}</p>
        <p className="bx-a4-kontakt">{[brev.adress, brev.telefon, brev.epost].filter(Boolean).join(' · ')}</p>
        <p className="bx-a4-mottagare">
          <b>{brev.arbetsgivare}</b>
        </p>
        {brev.roll ? <p className="bx-a4-roll">{brev.roll}</p> : null}
        {halsning ? <p>{halsning}</p> : null}
        {stycken.slice(0, 3).map((s, i) => (
          <p key={i}>{s}</p>
        ))}
      </div>
      {lappar.slice(0, 2).map((l, i) => (
        <p key={i} className={`bx-lapp ${i === 0 ? 'bx-lapp-1' : 'bx-lapp-2'} p3-gungar ${i ? 'p3-sen' : ''}`.trim()}>
          {l.nr ? <i>{l.nr}</i> : null}
          <b>{l.rubrik}</b>
        </p>
      ))}
    </div>
  )
}

/** Papperet: brevet ord för ord, satt som mallen Linne, med notens siffra vid sitt stycke. */
function BrevArk({ brev, nummer }: { brev: ReturnType<typeof brevFalt>; nummer: Map<Ankare, number[]> }) {
  const { halsning, stycken, avslut } = brevStycken(brev.brevText)
  return (
    <div className="bx-a4">
      <p className="bx-a4-namn">{brev.namn}</p>
      <p className="bx-a4-kontakt">
        {[brev.adress, brev.telefon, brev.epost].filter(Boolean).map((v, i) => (
          <span key={v}>
            {i ? ' · ' : ''}
            {v}
          </span>
        ))}
      </p>
      {brev.datum ? <p className="bx-a4-datum">{brev.datum}</p> : null}
      <p className="bx-a4-mottagare">
        <b>{brev.arbetsgivare}</b>
      </p>
      {brev.roll ? <p className="bx-a4-roll">{brev.roll}</p> : null}
      {halsning ? <p className="bx-a4-stycke">{halsning}</p> : null}
      {stycken.map((s, i) => {
        const nr = nummer.get(`stycke-${i + 1}` as Ankare)
        return (
          <p key={i} className={`bx-a4-stycke ${nr?.length ? 'bx-med-nr' : ''}`.trim()}>
            {nr?.length ? (
              <span className="bx-a4-nr">
                {nr.map((n) => (
                  <span key={n} aria-label={`Not ${n}`}>
                    {n}
                  </span>
                ))}
              </span>
            ) : null}
            {s}
          </p>
        )
      })}
      {avslut ? <p className="bx-a4-stycke bx-a4-avslut">{avslut}</p> : null}
    </div>
  )
}

export default function BrevExempelMall({
  slug,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data,
}: {
  slug: string
  data: any
}) {
  const yrke: string = data.yrke
  const yrkeLitet = yrke.toLowerCase()
  const varfor = numrera(punkter(data.varforDetFungerar))
  const nummer = ankarNummer(varfor.punkter)
  const harNummer = varfor.punkter.some((p) => p.nr)
  const tips = punkter(data.tips)
  const faq = fragor(data.faq)
  const intro: string | undefined = data.intro ?? data.heroSubtitle

  // Hjältens och kommentarskortets länk står ordagrant (SEO:s besked 13). Bara visarens knapp får mallen.
  const primarHref = `/skapa-brev/start?yrke=${slug}`
  const slutHref = `/skapa-brev/start?yrke=${slug}`

  // Lapparna i hjälten: notens rubrik.
  const lappar = varfor.noter.slice(0, 2)

  const relaterade = ((data.relaterade ?? []) as { yrke: string; slug: string }[]).map((r) => {
    const g = BREV_GALLERI.find((y) => y.slug === r.slug) ?? CV_GALLERI.find((y) => y.slug === r.slug)
    return { yrke: r.yrke, slug: r.slug, kategori: g?.kategori, kategoriNamn: kategoriNamn(g?.kategori) }
  })

  // Relaterade artiklar: bara de som finns, som länkar (aldrig 'Kommer snart').
  const finns = new Set(getAllPostsMeta().map((p) => p.slug))
  const artiklar = ((data.relateradeArtiklar ?? []) as { titel: string; slug: string }[]).filter(
    (a, i, alla) => finns.has(a.slug) && alla.findIndex((b) => b.slug === a.slug) === i,
  )

  const brev = brevFalt(data.exempelBrev)
  const papperId = 'exempel-papper'
  const brevValjare: BrevValjarData = {
    slug,
    yrke: yrkeLitet,
    mallar: visarMallar(),
    fot: visarFot(),
    alla: visarAllaLank(),
    href: primarHref,
    ctaKnappId: 'exempel-cta-knapp',
    ctaPlatsId: 'exempel-cta-plats',
  }
  const ord = Math.round(antalOrd(brevStycken(brev.brevText).stycken.join(' ')) / 10) * 10
  const harSlug = !!slug && /^[a-z0-9-]+$/.test(slug)

  return (
    <Sida farg="brev" className="bx">
      {/* 1. Hjälten: kort på telefon, brevet på arket i brett läge */}
      <Hjalte
        id="hjalte"
        className="bx-hjalte"
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Exempel', href: '/exempel' },
          { name: 'Personligt brev-exempel', href: '/personligt-brev-exempel' },
          { name: yrke, href: `/personligt-brev-exempel/${slug}` },
        ]}
        brodsmulorSchema={false}
        etikett="Personligt brev-exempel"
        h1={yrke}
        varde={intro}
        knappar={
          <>
            <Knapp href={primarHref} pil data-primar="">
              Använd som mall
            </Knapp>
            <TextLank href="#exemplet">Se exemplet</TextLank>
          </>
        }
        bild={<HjalteArk brev={brev} lappar={lappar} />}
      >
        <ul className="bx-bevis">
          {['Komplett brev', `${BREV_MALL_ANTAL} mallar`, 'Kopiera direkt'].map((b) => (
            <li key={b}>
              <Ikon namn="bock" />
              {b}
            </li>
          ))}
        </ul>
      </Hjalte>

      {/* 2. Papperet på plommonytan, med rekryterarens kommentarer */}
      <Sektion id="exemplet" botten="golv">
        <SektionHuvud
          etikett="Vad du får här"
          rubrik="Komplett exempel på 60 sek"
          varde={`Här är ett färdigskrivet personligt brev för ${yrkeLitet} som du kan kopiera och anpassa direkt. Under brevet förklarar vi varför det fungerar och ger konkreta tips för din bransch.`}
        />
        <div className="bx-exempel">
          <div className="bx-yta">
            <div id={papperId} className="bx-papper">
              <BrevArk brev={brev} nummer={nummer} />
            </div>
            <div className="bx-fotrad">
              {/* Visaren laddas först vid klick. Utan JavaScript göms knappen (noscript). */}
              <noscript dangerouslySetInnerHTML={{ __html: '<style>.ib-byt-brev{display:none!important}</style>' }} />
              <MallValjare typ="brev" yrke={yrke} papperId={papperId} brev={brevValjare} />
              <p className="bx-marken">
                <span>Exempelbrev</span>
                <span>En A4</span>
                <span>Cirka {ord} ord</span>
              </p>
            </div>
          </div>
          <aside className="bx-noter" aria-label="Rekryterarens kommentarer">
            <p className="p3-ey">Rekryterarens kommentarer</p>
            {varfor.noter.map((n, i) => (
              <div className="bx-not" key={i}>
                {n.nr ? <Nr typ="vagg">{n.nr}</Nr> : null}
                <div>
                  <b>{n.rubrik}</b>
                  {n.text ? <span>{n.text}</span> : null}
                </div>
              </div>
            ))}
            <div className="bx-not-cta">
              <p className="bx-not-cta-rub">Ditt brev på din annons</p>
              <p>Klistra in annonsen, så skriver vi ett utkast utifrån ditt CV.</p>
              <Knapp href={primarHref} id="exempel-cta-knapp" bred>
                Använd som mall
              </Knapp>
              {/* Medan visaren är öppen: textlänken "Skriv brevet på din annons" ritas här (MallValjare). */}
              <span id="exempel-cta-plats" />
            </div>
          </aside>
        </div>
      </Sektion>

      {/* 3. Varför det fungerar */}
      {varfor.punkter.length ? (
        <Sektion botten="ton">
          <SektionHuvud
            etikett="Varför det fungerar"
            rubrik="Det här gör brevet starkt"
            varde={`Konkreta detaljer i exemplet som rekryterare och ATS-system letar efter för ${yrkeLitet}.`}
          />
          <ul className="bx-kort-rutnat">
            {varfor.punkter.map((p, i) => {
              const nr = p.nr ?? (harNummer ? undefined : i + 1)
              return (
                <li key={i} className="bx-kort">
                  {nr ? <Nr>{nr}</Nr> : null}
                  <div>
                    <h3 className="p3-h3">{p.titel}</h3>
                    <Rik text={p.text} />
                  </div>
                </li>
              )
            })}
          </ul>
        </Sektion>
      ) : null}

      {/* 4. Tips */}
      {tips.length ? (
        <Sektion botten="golv">
          <SektionHuvud etikett="Skrivtips" rubrik={`Tips för ${yrkeLitet}`} varde="Råden bygger på det rekryterare letar efter i din bransch." />
          <ul className={`bx-kort-rutnat bx-tips ${tips.length % 2 ? 'bx-udda' : ''}`.trim()}>
            {tips.map((t, i) => (
              <li key={i} className="bx-kort bx-tips-kort">
                <div className="bx-tips-huvud">
                  <Nr>{i + 1}</Nr>
                  <h3 className="p3-h3">{t.titel}</h3>
                </div>
                <TipsText text={t.text} />
              </li>
            ))}
          </ul>
        </Sektion>
      ) : null}

      {/* 5. Skrivguiden */}
      {data.seoIntro ? (
        <Sektion botten="papper">
          <div className="bx-guide">
            <div className="bx-guide-text">
              <p className="p3-ey">Skrivguide</p>
              <h2 className="p3-h2">{`Så skriver du ett personligt brev som ${yrkeLitet}`}</h2>
              {String(data.seoIntro)
                .split('\n\n')
                .map((s: string, i: number) => (
                  <p key={i} className={i === 0 ? 'p3-varde' : 'p3-text'}>
                    {s.trim()}
                  </p>
                ))}
            </div>
            <div className="bx-delar" aria-hidden="true">
              <p className="p3-ey">Brevets tre delar</p>
              <ol>
                <li>
                  <Nr typ="vagg">1</Nr>
                  <span>
                    <b>Inledningen</b>Tjänsten du söker och varför just den.
                  </span>
                </li>
                <li>
                  <Nr typ="vagg">2</Nr>
                  <span>
                    <b>Huvuddelen</b>Ett krav per stycke, med ett exempel och en siffra.
                  </span>
                </li>
                <li>
                  <Nr typ="vagg">3</Nr>
                  <span>
                    <b>Avslutningen</b>Vad du vill ska hända härnäst.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </Sektion>
      ) : null}

      {/* 5b. Var jobben finns (Jobbkartan, bara yrken med säker SSYK-koppling). Ritas av Jobbkartan. */}
      <YrkesKarta slug={slug} page={`/personligt-brev-exempel/${slug}`} />

      {/* 6. Frågorna */}
      {faq.length ? (
        <Sektion botten="golv" className="bx-faq">
          <Faq etikett="Vanliga frågor" rubrik={`personligt brev för ${yrkeLitet}`} fragor={faq} />
        </Sektion>
      ) : null}

      {/* 7. Hela ansökan */}
      <Sektion botten="papper">
        <SektionHuvud
          etikett="Komplett ansökan"
          rubrik="Skapa hela ansökan"
          varde={`Ett starkt personligt brev ökar dina chanser. Men utan ett ATS-optimerat CV missar du intervjuer. Se hur du bygger en komplett ansökan för ${yrkeLitet}.`}
        />
        {harSlug ? (
          <>
            <div className="bx-par">
              <div className="bx-par-kort bx-har">
                <span className="bx-par-bild" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brevMiniatyrSrc('linne')} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
                </span>
                <div>
                  <Chip typ="koppar">Du är här</Chip>
                  <h3 className="p3-h3">Personligt brev</h3>
                  <p className="p3-liten">{yrke}</p>
                  <ul className="p3-bockar p3-pa-papper">
                    <li>
                      <span>Engagerande inledning</span>
                    </li>
                    <li>
                      <span>Rätt tonalitet och längd</span>
                    </li>
                    <li>
                      <span>Stark avslutning</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link className="bx-par-kort bx-par-lank" href={`/cv-exempel/${slug}`} data-p3-farg="cv">
                <span className="bx-par-bild" aria-hidden="true">
                  <MallMiniatyr id={FORVALD_MALL_ID} namn={false} chip={false} />
                </span>
                <div>
                  <h3 className="p3-h3">CV-exempel</h3>
                  <p className="p3-liten">{yrke}</p>
                  <p>Se hur du strukturerar ett ATS-optimerat CV med rätt nyckelord och kvantifierade resultat för {yrkeLitet}.</p>
                  <span className="p3-lank">Se CV-exemplet</span>
                </div>
              </Link>
            </div>
            <p className="bx-par-fot">
              <span>Redo att skapa din egen ansökan?</span>
              <Link className="p3-lank" href="/dashboard/skapa-cv">
                Skapa CV
              </Link>
              <Link className="p3-lank" href="/dashboard/skapa-brev">
                Skapa personligt brev
              </Link>
            </p>
          </>
        ) : null}
      </Sektion>

      {/* 8. Fler yrken, relaterade artiklar och verktyg */}
      {relaterade.length || artiklar.length || data.relateradeVerktyg?.length ? (
        <Sektion botten="golv">
          {relaterade.length ? (
            <>
              <SektionHuvud
                etikett="Andra yrken"
                rubrik="Fler personliga brev-exempel"
                varde={
                  <>
                    Hitta inspiration från liknande yrken, eller se alla{' '}
                    <Link className="p3-lank-inline" href="/personligt-brev-exempel">
                      {BREV_GALLERI.length} personligt brev-exempel
                    </Link>
                    . Alla följer samma upplägg.
                  </>
                }
              />
              <BrevYrkesKort yrken={relaterade} />
            </>
          ) : null}
          {artiklar.length ? (
            <div className="bx-mer">
              <p className="p3-ey">Läs mer</p>
              <h2 className="p3-h2">Mer om {yrkeLitet}</h2>
              <ul className="bx-lankkort">
                {artiklar.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/artiklar/${a.slug}`}>
                      <h3>{a.titel}</h3>
                      <span className="p3-lank">Läs artikeln</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.relateradeVerktyg?.length ? (
            <div className="bx-mer">
              <p className="p3-ey">Verktyg</p>
              <h2 className="p3-h2">Verktyg som hjälper dig vidare</h2>
              <ul className="bx-lankkort">
                {(data.relateradeVerktyg as { namn: string; slug: string; beskrivning: string }[]).map((v) => (
                  <li key={v.slug}>
                    <Link href={v.slug}>
                      <h3>{v.namn}</h3>
                      <p>{v.beskrivning}</p>
                      <span className="p3-lank">Använd verktyget</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Sektion>
      ) : null}

      {/* 9. Slutet: plommonön med annonsen och brevet */}
      <Sektion botten="golv" luft="utan-topp">
        <div className="p3-o p3-med-bild bx-slut">
          <div className="p3-o-rad">
            <div className="p3-o-text">
              <p className="p3-ey">Skapa ditt eget</p>
              <h2 className="p3-h2">Imponerad? Skapa ditt nu</h2>
              <p className="p3-varde">
                Ladda upp ditt CV, klistra in jobbannonsen och välj mall, så är det klart på några minuter. Skräddarsytt för {yrkeLitet} och optimerat för
                rekryteringssystem.
              </p>
              <div className="p3-knapprad">
                <Knapp href={slutHref}>{`Skriv personligt brev som ${yrkeLitet}`}</Knapp>
                <span className="p3-gratisrad">Inga kortuppgifter krävs</span>
              </div>
            </div>
            <div className="p3-o-bild">
              <Brevpar />
            </div>
          </div>
        </div>
      </Sektion>

      <ExempelKlient kind="letter" slug={slug} />
      <StickyMobileCTA cluster="letter" slug={slug} label={`Skriv personligt brev som ${yrkeLitet}`} href={slutHref} />
    </Sida>
  )
}
