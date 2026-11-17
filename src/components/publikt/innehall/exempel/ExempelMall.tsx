/**
 * Exempelsidan, publikt v2 del B 3.3: /cv-exempel/[yrke] och
 * /personligt-brev-exempel/[yrke]. Serverkomponent. Datan (exampleData) är
 * innehållet och rörs inte här; schemat ligger kvar i respektive page.tsx.
 *
 * Ytor: hjälten på vägg (CV teal, brev plommon), papperet på mark, Varför
 * det fungerar på ton, tipsen på mark, skrivguiden på panel, frågorna på
 * mark, hela ansökan på panel, fler yrken på mark och slutet på vägg.
 *
 * Rubrikerna är desamma som före (bilaga B), med samma text och nivå.
 */

import Link from 'next/link'
import PubliktSida from '../../PubliktSida'
import Rum from '../../Rum'
import Faq from '../../Faq'
import Telefon from '../../telefon/Telefon'
import SkarmCvAnalys from '../../telefon/skarmar/SkarmCvAnalys'
import StickyMobileCTA from '@/components/shared/StickyMobileCTA'
import ExempelKlient from '@/components/exempel-shared/ExempelKlient'
import { YRKESMALL_PUBLIKA } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { FORVALD_MALL_ID, GRATIS_MALL_IDS, getMallKort } from '@/lib/cv/mallar/katalog'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { MallMiniatyr } from '@/components/cv/MallMiniatyr'
import { ARTIKEL } from '@/components/cv/Dokument/texter'
import { pilotInnehall } from './pilot'
import { CV_GALLERI, BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'
import ExempelHjalte from './ExempelHjalte'
import { CvPapper, BrevPapper, CvUtdrag, BrevUtdrag } from './Papper'
import MallValjare from './MallValjare'
import VarforLista from './VarforLista'
import TipsKort from './TipsKort'
import YrkesKort, { MiniPapper } from './YrkesKort'
import AnsokanPar from './AnsokanPar'
import YrkesKarta from '@/components/jobbkartan/YrkesKarta'
import { punkter, fragor, numrera, ankarNummer, brevStycken, type ExempelTyp, type Not } from './exempel-data'
import { brevFalt } from './Papper'
import { getAllPostsMeta } from '@/lib/blog'
import './exempel.css'

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

function antalOrd(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

export default function ExempelMall({
  typ,
  slug,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data,
}: {
  typ: ExempelTyp
  slug: string
  data: any
}) {
  const cv = typ === 'cv'
  const yrke: string = data.yrke
  const yrkeLitet = yrke.toLowerCase()
  const varfor = numrera(punkter(data.varforDetFungerar))
  const nummer = ankarNummer(varfor.punkter)
  const tips = punkter(data.tips)
  // Piloten (B3): yrkesmallsidan är sammanslagen hit och mallblocket tar dess innehåll.
  const pilot = cv ? pilotInnehall(slug, data) : null
  const faq = pilot ? pilot.faq : fragor(data.faq)
  const harMallsida = cv && PUBLIKA_SLUGS.has(slug)
  const intro: string | undefined = data.intro ?? data.heroSubtitle

  // "Använd som mall": CV:t öppnar mallväljaren med exemplets mall vald.
  const primarHref = cv ? `/cv-mallar/prova?yrke=${slug}` : `/skapa-brev/start?yrke=${slug}`
  const slutHref = cv ? `/cv-mallar/prova?yrke=${slug}` : `/skapa-brev/start?yrke=${slug}`

  // Lapparna i hjälten: notens rubrik, och raden bara om den är kort.
  const lappar: Not[] = varfor.noter.slice(0, 2).map((n) => ({ ...n, text: n.text && n.text.length <= 60 ? n.text : undefined }))

  const galleri = cv ? CV_GALLERI : BREV_GALLERI
  const relaterade = ((data.relaterade ?? []) as { yrke: string; slug: string }[]).map((r) => {
    const g = galleri.find((y) => y.slug === r.slug) ?? CV_GALLERI.find((y) => y.slug === r.slug)
    return { yrke: r.yrke, slug: r.slug, kategori: g?.kategori, kategoriNamn: kategoriNamn(g?.kategori) }
  })

  // Relaterade artiklar: bara de som finns, som länkar (aldrig 'Kommer snart').
  const finns = new Set(getAllPostsMeta().map((p) => p.slug))
  const artiklar = ((data.relateradeArtiklar ?? []) as { titel: string; slug: string }[]).filter(
    (a, i, alla) => finns.has(a.slug) && alla.findIndex((b) => b.slug === a.slug) === i,
  )

  const brev = cv ? null : brevFalt(data.exempelBrev)
  const papperId = 'exempel-papper'

  return (
    <PubliktSida>
      <ExempelHjalte
        typ={typ}
        yrke={yrke}
        intro={intro}
        primar={{ text: 'Använd som mall', href: primarHref }}
        bevis={cv ? ['ATS-optimerat', 'Branschspecifika nyckelord', 'Kvantifierade resultat'] : ['Komplett brev', 'Sju mallar', 'Kopiera direkt']}
        utdrag={cv ? <CvUtdrag cv={data.exempelCV} /> : <BrevUtdrag brev={data.exempelBrev} />}
        lappar={lappar}
      />

      {/* 2. Papperet med marginalnoter */}
      <Rum rum={typ} yta="mark" id="exemplet">
        <div className="pub-wrap">
          <div className="ib-ex-rubrik">
            <p className="pub-kick">Vad du får här</p>
            <h2 className="pub-h2">{cv ? 'Komplett CV-exempel som inspirerar' : 'Komplett exempel på 60 sek'}</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              {cv
                ? `Se exakt hur ett ATS-optimerat CV för ${yrkeLitet} ser ut, med rätt nyckelord, kvantifierade resultat och struktur. Använd det som mall för ditt eget.`
                : `Här är ett färdigskrivet personligt brev för ${yrkeLitet} som du kan kopiera och anpassa direkt. Under brevet förklarar vi varför det fungerar och ger konkreta tips för din bransch.`}
            </p>
          </div>
          <div className="ib-ark-ram">
            <div>
              <div id={papperId} className="ib-papper">
                {cv ? <CvPapper cv={data.exempelCV} nummer={nummer} /> : <BrevPapper brev={data.exempelBrev} nummer={nummer} />}
              </div>
              <div className="ib-byt-mall">
                <MallValjare typ={typ} yrke={yrke} data={cv ? data.exempelCV : { ...data.exempelBrev, adress: brev!.adress, arbetsgivare: brev!.arbetsgivare }} papperId={papperId} />
                <p className="ib-ark-fot">
                  {cv ? (
                    <>
                      <span>Mallen {FORVALD_MALL_NAMN}</span>
                      <span>A4</span>
                      <span>Läsbart för rekryteringssystem</span>
                    </>
                  ) : (
                    <>
                      <span>Mallen Klassisk</span>
                      <span>En A4</span>
                      <span>Cirka {Math.round(antalOrd(brevStycken(brev!.brevText).stycken.join(' ')) / 10) * 10} ord</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <aside className="ib-noter" aria-label="Rekryterarens kommentarer">
              <p className="ib-not-rub">Rekryterarens kommentarer</p>
              {varfor.noter.map((n, i) => (
                <div className="ib-not" key={i}>
                  {n.nr ? <i>{n.nr}</i> : <i className="tom" aria-hidden="true" />}
                  <div>
                    <b>{n.rubrik}</b>
                    {n.text ? <span>{n.text}</span> : null}
                  </div>
                </div>
              ))}
              <div className="ib-not-cta">
                <p>{cv ? 'Ditt CV i samma mall' : 'Ditt brev på din annons'}</p>
                <p>
                  {cv
                    ? 'Börja från exemplet och byt ut innehållet mot ditt eget.'
                    : 'Klistra in annonsen, så skriver vi ett utkast utifrån ditt CV.'}
                </p>
                <Link className="pub-knapp" href={primarHref}>
                  Använd som mall
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Rum>

      {/* 3. Varför det fungerar */}
      {varfor.punkter.length ? (
        <Rum rum={typ} yta="ton">
          <div className="pub-wrap">
            <p className="pub-kick">Varför det fungerar</p>
            <h2 className="pub-h2">{cv ? 'Det här gör CV:t starkt' : 'Det här gör brevet starkt'}</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Konkreta detaljer i exemplet som rekryterare och ATS-system letar efter för {yrkeLitet}.
            </p>
            <VarforLista punkter={varfor.punkter} />
          </div>
        </Rum>
      ) : null}

      {/* 4. Tips */}
      {tips.length ? (
        <Rum yta="mark">
          <div className="pub-wrap">
            <p className="pub-kick">Skrivtips</p>
            <h2 className="pub-h2">Tips för {yrkeLitet}</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Råden bygger på det rekryterare letar efter i din bransch.
            </p>
            <TipsKort tips={tips} />
          </div>
        </Rum>
      ) : null}

      {/* 5. Skrivguiden och mallkortet */}
      {data.seoIntro || harMallsida ? (
        <Rum rum={typ} yta="panel">
          <div className="pub-wrap ib-guide-g">
            <div className="ib-guide-text">
              {data.seoIntro ? (
                <>
                  <p className="pub-kick">Skrivguide</p>
                  <h2 className="pub-h2">
                    {cv ? `Så bygger du ett CV som ${yrkeLitet}` : `Så skriver du ett personligt brev som ${yrkeLitet}`}
                  </h2>
                  {String(data.seoIntro)
                    .split('\n\n')
                    .map((s: string, i: number) => (
                      <p key={i}>{s.trim()}</p>
                    ))}
                </>
              ) : null}
            </div>
            {harMallsida ? (
              <div className="ib-mallkort">
                <div className="ib-mallkort-bild" aria-hidden="true">
                  <MiniPapper />
                  <MiniPapper />
                </div>
                <h2>Letar du efter en CV-mall för {yrkeLitet}?</h2>
                <p>Se mallarna med rubriker för {yrkeLitet} och vad rekryterare letar efter.</p>
                <Link className="pub-lank" href={`/cv-mallar/${slug}`} data-cta-klick={`/cv-mallar/${slug}`}>
                  Se CV-mallarna för {yrkeLitet}
                </Link>
              </div>
            ) : null}
          </div>
        </Rum>
      ) : null}

      {/* 5a. Piloten (B3): mallblocket ersätter korslänken till yrkesmallsidan. */}
      {pilot ? (
        <Rum rum="cv" yta="mark" id="cv-mall">
          <div className="pub-wrap">
            <p className="pub-kick">CV-mall</p>
            <h2 className="pub-h2">CV-mall för {yrkeLitet}: välj och fyll i</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Alla våra mallar passar {yrkeLitet}. Välj rubrikerna för din bransch, fyll i direkt och ladda ner gratis i {GRATIS_ELLER}, som PDF
              eller Word.
            </p>
            <div className="ib-pilot-mallar">
              {pilot.mallar.map((m) => {
                const gratis = m.niva === 'gratis'
                const href = `/cv-mallar/prova?mall=${encodeURIComponent(m.id)}&yrke=${encodeURIComponent(slug)}`
                return (
                  <Link key={m.id} href={href} className="ib-pilot-mall" data-cta-klick={href}>
                    <MallMiniatyr
                      mall={{ id: m.id, name: m.namn, imagePath: m.bild.stor, tier: gratis ? 'free' : 'premium' }}
                      under={ARTIKEL.mallrad(gratis, m.word)}
                    />
                    <span className="pub-knapp ib-pilot-knapp">{gratis ? 'Fyll i gratis' : 'Prova med ditt CV'}</span>
                  </Link>
                )
              })}
            </div>
            {pilot.tips.length ? (
              <>
                <h3 className="pub-h3 ib-pilot-h3">Vad rekryterare letar efter hos {yrkeLitet}</h3>
                <div className="pub-raster pub-raster-2" style={{ marginTop: 16 }}>
                  {pilot.tips.map((t) => (
                    <div className="pub-kort" key={t.rubrik}>
                      <h4 className="pub-h4" style={{ marginTop: 0 }}>
                        {t.rubrik}
                      </h4>
                      <p className="pub-brod" style={{ fontSize: 15, marginTop: 8 }}>
                        {t.text}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {pilot.synas.length || pilot.uppgifter.length ? (
              <>
                <h3 className="pub-h3 ib-pilot-h3">Det här ska synas i CV:t för {yrkeLitet}</h3>
                {pilot.synas.length ? (
                  <div className="pub-raster pub-raster-2" style={{ marginTop: 16 }}>
                    {pilot.synas.map((v) => (
                      <div className="pub-kort" key={v.rubrik}>
                        <h4 className="pub-h4" style={{ marginTop: 0 }}>
                          {v.rubrik}
                        </h4>
                        <p className="pub-brod" style={{ fontSize: 15, marginTop: 8 }}>
                          {v.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {pilot.uppgifter.length ? (
                  <div className="pub-raster pub-raster-2" style={{ marginTop: 16 }}>
                    {pilot.uppgifter.map((u) => (
                      <div className="pub-kort" key={u.rubrik}>
                        <h4 className="pub-h4" style={{ marginTop: 0 }}>
                          {u.rubrik}
                        </h4>
                        <ul className="ib-pilot-lista">
                          {u.punkter.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
            <h3 className="pub-h3 ib-pilot-h3">Så läser rekryteringssystemen ditt CV</h3>
            <p className="pub-brod" style={{ marginTop: 12, maxWidth: 760 }}>
              {pilot.atsInfo}
            </p>
            <p className="ib-pilot-lankar">
              <Link className="pub-lank" href="/cv-mallar" data-cta-klick="/cv-mallar">
                Se alla {TEMPLATE_COUNT} CV-mallar
              </Link>
              <Link className="pub-lank" href="/cv-mallar#ladda-upp" data-cta-klick="/cv-mallar#ladda-upp">
                Har du redan ett CV? Ladda upp det och se det i mallarna
              </Link>
            </p>
          </div>
        </Rum>
      ) : null}

      {/* 5b. Var jobben finns (Jobbkartan, bara yrken med säker SSYK-koppling) */}
      <YrkesKarta slug={slug} page={cv ? `/cv-exempel/${slug}` : `/personligt-brev-exempel/${slug}`} />

      {/* 6. Frågorna */}
      {faq.length ? (
        <Rum yta="mark">
          <div className="pub-wrap" style={{ maxWidth: 860 }}>
            <p className="pub-kick">Vanliga frågor</p>
            <Faq rubrik={cv ? `CV för ${yrkeLitet}` : `personligt brev för ${yrkeLitet}`} fragor={faq} />
          </div>
        </Rum>
      ) : null}

      {/* 7. Hela ansökan */}
      <Rum yta="panel">
        <div className="pub-wrap">
          <p className="pub-kick">Komplett ansökan</p>
          <h2 className="pub-h2">Skapa hela ansökan</h2>
          <p className="pub-ingress" style={{ marginTop: 14 }}>
            {cv
              ? `Ett starkt CV ökar dina chanser. Men utan ett skräddarsytt personligt brev missar du intervjuer. Se hur du bygger en komplett ansökan för ${yrkeLitet}.`
              : `Ett starkt personligt brev ökar dina chanser. Men utan ett ATS-optimerat CV missar du intervjuer. Se hur du bygger en komplett ansökan för ${yrkeLitet}.`}
          </p>
          <AnsokanPar yrke={yrke} har={typ} slug={slug} />
        </div>
      </Rum>

      {/* 8. Fler yrken, och för brev med relaterade artiklar och verktyg */}
      {relaterade.length || artiklar.length || data.relateradeVerktyg?.length ? (
        <Rum yta="mark">
          <div className="pub-wrap">
            {relaterade.length ? (
              <>
                <p className="pub-kick">Andra yrken</p>
                <h2 className="pub-h2">{cv ? 'Fler CV-exempel' : 'Fler personliga brev-exempel'}</h2>
                <p className="pub-ingress" style={{ marginTop: 14 }}>
                  {cv ? (
                    <>
                      Hitta inspiration från liknande yrken, eller se alla{' '}
                      <Link href="/cv-exempel">{CV_GALLERI.length} CV-exempel</Link>. Alla följer samma ATS-optimerade upplägg.
                    </>
                  ) : (
                    <>
                      Hitta inspiration från liknande yrken, eller se alla{' '}
                      <Link href="/personligt-brev-exempel">{BREV_GALLERI.length} personligt brev-exempel</Link>. Alla följer samma upplägg.
                    </>
                  )}
                </p>
                <YrkesKort yrken={relaterade} typ={typ} />
              </>
            ) : null}
            {artiklar.length ? (
              <div style={{ marginTop: 56 }}>
                <p className="pub-kick">Läs mer</p>
                <h2 className="pub-h2">Mer om {yrkeLitet}</h2>
                <div className="ib-lankkort">
                  {artiklar.map((a) => (
                    <Link key={a.slug} href={`/artiklar/${a.slug}`}>
                      <h3>{a.titel}</h3>
                      <span className="pub-lank">Läs artikeln</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {data.relateradeVerktyg?.length ? (
              <div style={{ marginTop: 56 }}>
                <p className="pub-kick">Verktyg</p>
                <h2 className="pub-h2">Verktyg som hjälper dig vidare</h2>
                <div className="ib-lankkort">
                  {(data.relateradeVerktyg as { namn: string; slug: string; beskrivning: string }[]).map((v) => (
                    <Link key={v.slug} href={v.slug}>
                      <h3>{v.namn}</h3>
                      <p>{v.beskrivning}</p>
                      <span className="pub-lank">Använd verktyget</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Rum>
      ) : null}

      {/* 9. Slutet */}
      <Rum rum={typ} yta="vagg" storlek="normal">
        <div className="pub-wrap ib-slut-g">
          <div>
            <p className="pub-kick">Skapa ditt eget</p>
            <h2 className="pub-h2">Imponerad? Skapa ditt nu</h2>
            <p className="pub-ingress" style={{ marginTop: 16 }}>
              Ladda upp ditt CV, klistra in jobbannonsen och välj mall, så är det klart på en minut. Skräddarsytt för {yrkeLitet} och
              optimerat för rekryteringssystem.
            </p>
            <div className="pub-handling">
              <Link className="pub-knapp" href={slutHref}>
                {cv ? `Använd denna mall som ${yrkeLitet}` : `Skriv personligt brev som ${yrkeLitet}`}
              </Link>
              <p className="pub-liten">Inga kortuppgifter krävs</p>
            </div>
          </div>
          {cv ? (
            <div className="ib-slut-bild">
              <Telefon rum="cv">
                <SkarmCvAnalys />
              </Telefon>
            </div>
          ) : null}
        </div>
      </Rum>

      <ExempelKlient kind={cv ? 'cv' : 'letter'} slug={slug} />
      <StickyMobileCTA
        cluster={cv ? 'cv' : 'letter'}
        slug={slug}
        label={cv ? `Använd denna mall som ${yrkeLitet}` : `Skriv personligt brev som ${yrkeLitet}`}
        href={slutHref}
      />
    </PubliktSida>
  )
}
