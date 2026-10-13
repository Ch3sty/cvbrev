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
import { YRKESMALL_SLUGS } from '@/app/(public)/cv-mallar/yrkesmall-data'
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
import './exempel.css'

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
  const faq = fragor(data.faq)
  const intro: string | undefined = data.intro ?? data.heroSubtitle

  // "Använd som mall": CV:t öppnar mallväljaren med exemplets mall vald.
  const primarHref = cv ? `/cv-mallar/start?yrke=${slug}&mall=norrsken` : `/skapa-brev/start?yrke=${slug}`
  const slutHref = cv ? `/cv-mallar/start?yrke=${slug}` : `/skapa-brev/start?yrke=${slug}`

  // Lapparna i hjälten: notens rubrik, och raden bara om den är kort.
  const lappar: Not[] = varfor.noter.slice(0, 2).map((n) => ({ ...n, text: n.text && n.text.length <= 60 ? n.text : undefined }))

  const galleri = cv ? CV_GALLERI : BREV_GALLERI
  const relaterade = ((data.relaterade ?? []) as { yrke: string; slug: string }[]).map((r) => {
    const g = galleri.find((y) => y.slug === r.slug) ?? CV_GALLERI.find((y) => y.slug === r.slug)
    return { yrke: r.yrke, slug: r.slug, kategori: g?.kategori, kategoriNamn: kategoriNamn(g?.kategori) }
  })

  const brev = cv ? null : brevFalt(data.exempelBrev)
  const papperId = 'exempel-papper'

  return (
    <PubliktSida>
      <ExempelHjalte
        typ={typ}
        yrke={yrke}
        intro={intro}
        primar={{ text: 'Använd som mall', href: primarHref }}
        bevis={cv ? ['ATS-optimerat', 'Branschspecifika nyckelord', 'Kvantifierade resultat'] : ['Komplett brev', 'Sex mallar', 'Kopiera direkt']}
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
                      <span>Mallen Norrsken</span>
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
      {data.seoIntro || (cv && YRKESMALL_SLUGS.includes(slug)) ? (
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
            {cv && YRKESMALL_SLUGS.includes(slug) ? (
              <div className="ib-mallkort">
                <div className="ib-mallkort-bild" aria-hidden="true">
                  <MiniPapper />
                  <MiniPapper />
                </div>
                <h2>Letar du efter en CV-mall för {yrkeLitet}?</h2>
                <p>Vi har en mall för {yrkeLitet} med rätt sektioner och tips från rekryterare.</p>
                <Link className="pub-lank" href={`/cv-mallar/${slug}`}>
                  Se mallen
                </Link>
              </div>
            ) : null}
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
      {relaterade.length || data.relateradeArtiklar?.length || data.relateradeVerktyg?.length ? (
        <Rum yta="mark">
          <div className="pub-wrap">
            {relaterade.length ? (
              <>
                <p className="pub-kick">Andra yrken</p>
                <h2 className="pub-h2">{cv ? 'Fler CV-exempel' : 'Fler personliga brev-exempel'}</h2>
                <p className="pub-ingress" style={{ marginTop: 14 }}>
                  Hitta inspiration från liknande yrken. Alla exempel följer samma ATS-optimerade upplägg.
                </p>
                <YrkesKort yrken={relaterade} typ={typ} />
              </>
            ) : null}
            {data.relateradeArtiklar?.length ? (
              <div style={{ marginTop: 56 }}>
                <p className="pub-kick">Läs mer</p>
                <h2 className="pub-h2">Mer om {yrkeLitet}</h2>
                <div className="ib-lankkort">
                  {(data.relateradeArtiklar as { titel: string; slug: string }[]).map((a) => (
                    <div key={a.slug}>
                      <h3>{a.titel}</h3>
                      <p>Kommer snart</p>
                    </div>
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
                {cv ? `Använd denna mall som ${yrkeLitet}` : `Skapa mitt brev som ${yrkeLitet}`}
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
        label={cv ? `Använd denna mall som ${yrkeLitet}` : `Skapa mitt brev som ${yrkeLitet}`}
        href={slutHref}
      />
    </PubliktSida>
  )
}
