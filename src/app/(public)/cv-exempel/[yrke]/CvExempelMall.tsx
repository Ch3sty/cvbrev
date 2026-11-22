/**
 * CV-exemplet per yrke i publikt omgång 3: /cv-exempel/[yrke], 89 sidor.
 * Grundens skal i CV:ts petrol, i samma form som brevexemplen
 * (src/components/publikt/innehall/exempel/BrevExempelMall.tsx, P3), som
 * lämnade över CV-grenen av ExempelMall till P2 (onskemal.md). Serverkomponent;
 * klientkod bara i "Byt mall" (MallValjare), mätningen och den fasta knappraden.
 *
 * Texten är ordagrant CV-grenen ur ExempelMall: h1 (yrket), alla h2, h3 och
 * h4 i samma ordning, FAQ, interna länkar och ankartexter. Metadata och
 * schemat ligger kvar i page.tsx. Papperet (CvPapper) och mallväljaren är
 * dagens komponenter, orörda.
 */

import Link from 'next/link'
import StickyMobileCTA from '@/components/shared/StickyMobileCTA'
import ExempelKlient from '@/components/exempel-shared/ExempelKlient'
import YrkesKarta from '@/components/jobbkartan/YrkesKarta'
import { MINIATYR_BREDD, MINIATYR_HOJD, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import { YRKESMALL_PUBLIKA } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'
import { FORVALD_MALL_ID, GRATIS_MALL_IDS, getMallKort } from '@/lib/cv/mallar/katalog'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { ARTIKEL } from '@/components/cv/Dokument/texter'
import { getAllPostsMeta } from '@/lib/blog'
import { Sida, Hjalte, Sektion, SektionHuvud, Chip, Nr, Faq, Knapp, TextLank, Kort, CvArk, MallMiniatyr, Ikon } from '@/components/publikt/v3'
import MallValjare from '@/components/publikt/innehall/exempel/MallValjare'
import Rik, { inline } from '@/components/publikt/innehall/exempel/Rik'
import { tolka } from '@/components/publikt/innehall/exempel/TipsKort'
import { CvPapper, CvUtdrag } from '@/components/publikt/innehall/exempel/Papper'
import { pilotInnehall } from '@/components/publikt/innehall/exempel/pilot'
import { ankarNummer, fragor, numrera, punkter, type Not } from '@/components/publikt/innehall/exempel/exempel-data'
import { YrkesKortLista } from '../components/ExempelDelar'
import '@/components/publikt/publikt.css'
import '@/components/publikt/innehall/exempel/exempel.css'
import '@/components/publikt/innehall/exempel/brev-exempel.css'
import '../components/exempel-v3.css'

/** Exempelarket är enspaltigt som förvalsmallen; namnet ur katalogen. */
const FORVALD_MALL_NAMN = getMallKort(FORVALD_MALL_ID)?.namn ?? ''

/** Gratismallarnas namn ur katalogen: "Linne eller Björk". */
const GRATIS_ELLER = (() => {
  const n = GRATIS_MALL_IDS.map((id) => getMallKort(id)?.namn ?? id)
  return n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} eller ${n[n.length - 1]}`
})()

/** Yrkesmallsidorna som finns som egna sidor (piloten 308:ar hit, B3). */
const PUBLIKA_SLUGS = new Set(YRKESMALL_PUBLIKA.map((y) => y.slug))

function kategoriNamn(kategori: string | undefined): string | undefined {
  const slug = kategori === 'teknik' ? 'tech' : kategori
  return KATEGORIER.find((k) => k.slug === slug)?.namn
}

/** Tipsets text: stycken, rubriker och rutorna Före och Efter, samma tolkning som i dag. */
function TipsText({ text }: { text: string }) {
  return (
    <>
      {tolka(text).map((d, j) => {
        if (d.typ === 'rub')
          return (
            <p key={j} className="bx-fe-rub">
              {d.text}
            </p>
          )
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
        return (
          <p key={j} className={d.typ === 'efterNot' ? 'bx-efter-not' : undefined}>
            {inline(d.text)}
          </p>
        )
      })}
    </>
  )
}

export default function CvExempelMall({
  slug,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data,
}: {
  slug: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
}) {
  const yrke: string = data.yrke
  const yrkeLitet = yrke.toLowerCase()
  const varfor = numrera(punkter(data.varforDetFungerar))
  const nummer = ankarNummer(varfor.punkter)
  const harNummer = varfor.punkter.some((p) => p.nr)
  const tips = punkter(data.tips)
  // Piloten (B3): yrkesmallsidan är sammanslagen hit och mallblocket tar dess innehåll.
  const pilot = pilotInnehall(slug, data)
  const faq = pilot ? pilot.faq : fragor(data.faq)
  const harMallsida = PUBLIKA_SLUGS.has(slug)
  const intro: string | undefined = data.intro ?? data.heroSubtitle

  // "Använd som mall": CV:t öppnar mallväljaren med exemplets mall vald.
  const primarHref = `/cv-mallar/prova?yrke=${slug}`
  const slutHref = `/cv-mallar/prova?yrke=${slug}`

  // Lapparna i hjälten: notens rubrik, och raden bara om den är kort.
  const lappar: Not[] = varfor.noter.slice(0, 2).map((n) => ({ ...n, text: n.text && n.text.length <= 60 ? n.text : undefined }))

  const relaterade = ((data.relaterade ?? []) as { yrke: string; slug: string }[]).map((r) => {
    const g = CV_GALLERI.find((y) => y.slug === r.slug)
    return { yrke: r.yrke, slug: r.slug, ovan: kategoriNamn(g?.kategori) }
  })

  // Relaterade artiklar: bara de som finns, som länkar (aldrig 'Kommer snart').
  const finns = new Set(getAllPostsMeta().map((p) => p.slug))
  const artiklar = ((data.relateradeArtiklar ?? []) as { titel: string; slug: string }[]).filter(
    (a, i, alla) => finns.has(a.slug) && alla.findIndex((b) => b.slug === a.slug) === i,
  )

  const papperId = 'exempel-papper'
  const harSlug = !!slug && /^[a-z0-9-]+$/.test(slug)

  return (
    <Sida farg="cv" className="bx">
      {/* 1. Hjälten: yrket, introt och ett utdrag ur papperet med lapparna */}
      <Hjalte
        id="hjalte"
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Exempel', href: '/exempel' },
          { name: 'CV-exempel', href: '/cv-exempel' },
          { name: yrke, href: `/cv-exempel/${slug}` },
        ]}
        brodsmulorSchema={false}
        etikett="CV-exempel"
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
        bild={
          <div className="ib-ex-bild" aria-hidden="true">
            <CvUtdrag cv={data.exempelCV} />
            {lappar.map((l, i) => (
              <div key={i} className={i === 0 ? 'ib-ex-lapp' : 'ib-ex-lapp ib-ex-lapp-2'}>
                <i>{l.nr ?? '✓'}</i>
                <b>{l.rubrik}</b>
                {l.text ? <span>{l.text}</span> : null}
              </div>
            ))}
          </div>
        }
      >
        <ul className="bx-bevis">
          {['ATS-optimerat', 'Branschspecifika nyckelord', 'Kvantifierade resultat'].map((b) => (
            <li key={b}>
              <Ikon namn="bock" />
              {b}
            </li>
          ))}
        </ul>
      </Hjalte>

      {/* 2. Papperet på petrolytan, med rekryterarens kommentarer */}
      <Sektion id="exemplet" botten="golv">
        <SektionHuvud
          etikett="Vad du får här"
          rubrik="Komplett CV-exempel som inspirerar"
          varde={`Se exakt hur ett ATS-optimerat CV för ${yrkeLitet} ser ut, med rätt nyckelord, kvantifierade resultat och struktur. Använd det som mall för ditt eget.`}
        />
        <div className="bx-exempel">
          <div className="bx-yta">
            <div id={papperId} className="ib-papper">
              <CvPapper cv={data.exempelCV} nummer={nummer} />
            </div>
            <div className="bx-fotrad ib-byt-mall">
              {/* CV:ts mallväljare laddas först vid klick på "Byt mall", orörd. */}
              <MallValjare typ="cv" yrke={yrke} data={data.exempelCV} papperId={papperId} />
              <p className="bx-marken">
                <span>Mallen {FORVALD_MALL_NAMN}</span>
                <span>A4</span>
                <span>Läsbart för rekryteringssystem</span>
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
              <p className="bx-not-cta-rub">Ditt CV i samma mall</p>
              <p>Börja från exemplet och byt ut innehållet mot ditt eget.</p>
              <Knapp href={primarHref} bred>
                Använd som mall
              </Knapp>
            </div>
          </aside>
        </div>
      </Sektion>

      {/* 3. Varför det fungerar */}
      {varfor.punkter.length ? (
        <Sektion botten="ton">
          <SektionHuvud
            etikett="Varför det fungerar"
            rubrik="Det här gör CV:t starkt"
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

      {/* 5. Skrivguiden och mallkortet */}
      {data.seoIntro || harMallsida ? (
        <Sektion botten="papper">
          <div className="bx-guide">
            {data.seoIntro ? (
              <div className="bx-guide-text">
                <p className="p3-ey">Skrivguide</p>
                <h2 className="p3-h2">{`Så bygger du ett CV som ${yrkeLitet}`}</h2>
                {String(data.seoIntro)
                  .split('\n\n')
                  .map((s: string, i: number) => (
                    <p key={i} className={i === 0 ? 'p3-varde' : 'p3-text'}>
                      {s.trim()}
                    </p>
                  ))}
              </div>
            ) : null}
            {harMallsida ? (
              <Kort className="cve-mallkort">
                <div className="cve-mallkort-bild" aria-hidden="true">
                  {GRATIS_MALL_IDS.slice(0, 2).map((id) => (
                    <MallMiniatyr key={id} id={id} namn={false} chip={false} />
                  ))}
                </div>
                <h2 className="p3-h3">Letar du efter en CV-mall för {yrkeLitet}?</h2>
                <p>Se mallarna med rubriker för {yrkeLitet} och vad rekryterare letar efter.</p>
                <Link className="p3-lank" href={`/cv-mallar/${slug}`} data-cta-klick={`/cv-mallar/${slug}`}>
                  Se CV-mallarna för {yrkeLitet}
                </Link>
              </Kort>
            ) : null}
          </div>
        </Sektion>
      ) : null}

      {/* 5a. Piloten (B3): mallblocket ersätter korslänken till yrkesmallsidan. */}
      {pilot ? (
        <Sektion id="cv-mall" botten="golv">
          <SektionHuvud
            etikett="CV-mall"
            rubrik={`CV-mall för ${yrkeLitet}: välj och fyll i`}
            varde={`Alla våra mallar passar ${yrkeLitet}. Välj rubrikerna för din bransch, fyll i direkt och ladda ner gratis i ${GRATIS_ELLER}, som PDF eller Word.`}
          />
          <ul className="cve-pilot-mallar">
            {pilot.mallar.map((m) => {
              const gratis = m.niva === 'gratis'
              const href = `/cv-mallar/prova?mall=${encodeURIComponent(m.id)}&yrke=${encodeURIComponent(slug)}`
              return (
                <li key={m.id}>
                  <Link href={href} className="cve-pilot-mall" data-cta-klick={href}>
                    <MallMiniatyr id={m.id} storlek="stor" format />
                    <small>{ARTIKEL.mallrad(gratis, m.word)}</small>
                    <span className="cve-pilot-knapp">{gratis ? 'Fyll i gratis' : 'Prova med ditt CV'}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          {pilot.tips.length ? (
            <>
              <h3 className="p3-h3 cve-pilot-h3">Vad rekryterare letar efter hos {yrkeLitet}</h3>
              <div className="cve-pilot-rutnat">
                {pilot.tips.map((t) => (
                  <Kort key={t.rubrik}>
                    <h4 className="cve-h4">{t.rubrik}</h4>
                    <p>{t.text}</p>
                  </Kort>
                ))}
              </div>
            </>
          ) : null}
          {pilot.synas.length || pilot.uppgifter.length ? (
            <>
              <h3 className="p3-h3 cve-pilot-h3">Det här ska synas i CV:t för {yrkeLitet}</h3>
              {pilot.synas.length ? (
                <div className="cve-pilot-rutnat">
                  {pilot.synas.map((v) => (
                    <Kort key={v.rubrik}>
                      <h4 className="cve-h4">{v.rubrik}</h4>
                      <p>{v.text}</p>
                    </Kort>
                  ))}
                </div>
              ) : null}
              {pilot.uppgifter.length ? (
                <div className="cve-pilot-rutnat">
                  {pilot.uppgifter.map((u) => (
                    <Kort key={u.rubrik}>
                      <h4 className="cve-h4">{u.rubrik}</h4>
                      <ul className="cve-pilot-lista">
                        {u.punkter.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </Kort>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          <h3 className="p3-h3 cve-pilot-h3">Så läser rekryteringssystemen ditt CV</h3>
          <p className="p3-text cve-pilot-ats">{pilot.atsInfo}</p>
          <p className="cve-pilot-lankar">
            <Link className="p3-lank" href="/cv-mallar" data-cta-klick="/cv-mallar">
              Se alla {TEMPLATE_COUNT} CV-mallar
            </Link>
            <Link className="p3-lank" href="/cv-mallar#ladda-upp" data-cta-klick="/cv-mallar#ladda-upp">
              Har du redan ett CV? Ladda upp det och se det i mallarna
            </Link>
          </p>
        </Sektion>
      ) : null}

      {/* 5b. Var jobben finns (Jobbkartan, bara yrken med säker SSYK-koppling). Ritas av Jobbkartan. */}
      <YrkesKarta slug={slug} page={`/cv-exempel/${slug}`} />

      {/* 6. Frågorna */}
      {faq.length ? (
        <Sektion botten="golv" className="bx-faq">
          <Faq etikett="Vanliga frågor" rubrik={`CV för ${yrkeLitet}`} fragor={faq} />
        </Sektion>
      ) : null}

      {/* 7. Hela ansökan */}
      <Sektion botten="papper">
        <SektionHuvud
          etikett="Komplett ansökan"
          rubrik="Skapa hela ansökan"
          varde={`Ett starkt CV ökar dina chanser. Men utan ett skräddarsytt personligt brev missar du intervjuer. Se hur du bygger en komplett ansökan för ${yrkeLitet}.`}
        />
        {harSlug ? (
          <>
            <div className="bx-par">
              <div className="bx-par-kort bx-har">
                <span className="bx-par-bild" aria-hidden="true">
                  <MallMiniatyr id={FORVALD_MALL_ID} namn={false} chip={false} />
                </span>
                <div>
                  <Chip typ="koppar">Du är här</Chip>
                  <h3 className="p3-h3">CV-exempel</h3>
                  <p className="p3-liten">{yrke}</p>
                  <ul className="p3-bockar p3-pa-papper">
                    <li>
                      <span>ATS-optimerad struktur</span>
                    </li>
                    <li>
                      <span>Branschspecifika nyckelord</span>
                    </li>
                    <li>
                      <span>Kvantifierade resultat</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link className="bx-par-kort bx-par-lank" href={`/personligt-brev-exempel/${slug}`} data-p3-farg="brev">
                <span className="bx-par-bild" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brevMiniatyrSrc('linne')} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
                </span>
                <div>
                  <h3 className="p3-h3">Personligt brev</h3>
                  <p className="p3-liten">{yrke}</p>
                  <p>Se hur du skriver ett övertygande personligt brev som kompletterar ditt CV och får dig till intervju.</p>
                  <span className="p3-lank">Se det personliga brevet</span>
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
                rubrik="Fler CV-exempel"
                varde={
                  <>
                    Hitta inspiration från liknande yrken, eller se alla{' '}
                    <Link className="cve-lank" href="/cv-exempel">
                      {CV_GALLERI.length} CV-exempel
                    </Link>
                    . Alla följer samma ATS-optimerade upplägg.
                  </>
                }
              />
              <YrkesKortLista yrken={relaterade} />
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

      {/* 9. Slutet: petrolön med CV-arket */}
      <Sektion botten="golv" luft="utan-topp">
        <div className="p3-o p3-med-bild bx-slut">
          <div className="p3-o-rad">
            <div className="p3-o-text">
              <p className="p3-ey">Skapa ditt eget</p>
              <h2 className="p3-h2">Imponerad? Skapa ditt nu</h2>
              <p className="p3-varde">
                Ladda upp ditt CV, klistra in jobbannonsen och välj mall, så är det klart på en minut. Skräddarsytt för {yrkeLitet} och optimerat för
                rekryteringssystem.
              </p>
              <div className="p3-knapprad">
                <Knapp href={slutHref}>{`Använd denna mall som ${yrkeLitet}`}</Knapp>
                <span className="p3-gratisrad">Inga kortuppgifter krävs</span>
              </div>
            </div>
            <div className="p3-o-bild" aria-hidden="true">
              <CvArk nalar={false} vald={0} />
            </div>
          </div>
        </div>
      </Sektion>

      <ExempelKlient kind="cv" slug={slug} />
      <StickyMobileCTA cluster="cv" slug={slug} label={`Använd denna mall som ${yrkeLitet}`} href={slutHref} />
    </Sida>
  )
}
