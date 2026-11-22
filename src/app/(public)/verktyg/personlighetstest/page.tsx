/**
 * /verktyg/personlighetstest i publikt omgång 3 (skissen personlighetstest,
 * docs/design/publikt-omgang3/sidor/personlighetstest.html, noten
 * noter/personlighetstest.md, SEO:s besked avsnitt 11).
 *
 * Byggd med grundens komponenter (src/components/publikt/v3). Provet är det
 * lyfta kortet: samma fungerande Personlighetsprov som i artiklarna
 * (serverrenderat första påstående, fem svar i HTML:en). Exempelprofilen
 * (Sara) läses genom tolkningens riktiga funktioner och kravprofilerna ur
 * KRAVPROFILER (src/lib/personlighet/smakprov-tolkning.ts). Mätarna visar
 * bandord, aldrig siffror 1 till 5 (SEO: FAQ-svaret säger bandord).
 *
 * Kravprofilvalet fungerar utan JavaScript: sex radioknappar, och varje
 * faktorkort har sex mätare i HTML:en där CSS visar den som hör till valet.
 * Rubrikerna (H3 per faktor) står en gång.
 *
 * Inloggade skickas till hela testet med 50 påståenden (spec avsnitt 6).
 */
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
// Direkt import, inte via mdx-klientens next/dynamic: den dynamiska
// omslutningen gav olika useId på server och klient.
import Personlighetsprov from '@/components/artiklar/personlighetsprov/Personlighetsprov'
import { SIDA } from '@/components/artiklar/personlighetsprov/personlighetsprov-copy'
import { GRUNDTEST_HREF } from '@/lib/intervju/lankar'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { ANTAL_PASTAENDEN } from '@/lib/personlighet/smakprov-pastaenden'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import { TESTTAL } from '@/components/publikt/testtal'
import type { BigFiveScores } from '@/lib/personalityTest/types'
import { bandFor } from '@/lib/personalityTest/insights'
import { INTERVJU, KRAVPROFILER, bandOrd, faktorUtfall, segment, visadPoang, type Faktor } from '@/lib/personlighet/smakprov-tolkning'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Chip,
  Nr,
  Faq,
  Bocklista,
  Knapp,
  Knapprad,
  TextLank,
  Svav,
  Dorr,
  Ikon,
} from '@/components/publikt/v3'
import './personlighetstest.css'

const URL = 'https://www.jobbcoach.ai/verktyg/personlighetstest'
const T = TESTTAL
const PRIS = prisPeriod(SALD_PLAN)

const STEG = [
  {
    rubrik: 'Svara på tjugo påståenden',
    text: 'Fyra per faktor, på samma femgradiga skala som MAP och de flesta test i svensk rekrytering. Tänk på hur du är på jobbet och ta första rimliga svaret.',
  },
  {
    rubrik: 'Se profilen direkt',
    text: 'Du får de fem faktorerna med ett bandord (hög, mitt emellan eller låg) och en mening per faktor om hur en rekryterare läser den.',
  },
  {
    rubrik: 'Spara den med ett gratiskonto',
    text: 'Då ser du profilen läst mot sex vanliga kravprofiler, vad du kan säga på intervjun och vilka påståenden som var omvända.',
  },
  {
    rubrik: 'Gör hela testet',
    text: 'I kontot finns hela testet med femtio påståenden, gratis. Det ger profilen du kan ta med dig till intervjun.',
  },
]

const FAKTORER: { rubrik: string; text: string; faktor: Faktor }[] = [
  { rubrik: 'Samvetsgrannhet', faktor: 'conscientiousness', text: 'Struktur, noggrannhet och att göra klart det man lovat. Väger tungt i ekonomi, administration och ledarroller.' },
  { rubrik: 'Utåtriktning', faktor: 'extraversion', text: 'Var du hämtar energi: i möten med människor eller i eget arbete. Väger tungt i sälj och kundkontakt.' },
  { rubrik: 'Stabilitet', faktor: 'stability', text: 'Hur du hanterar press och motgångar. Hög stabilitet är detsamma som låg särbarhet i testets egna termer.' },
  { rubrik: 'Vänlighet', faktor: 'agreeableness', text: 'Samarbete, omtanke och hur rakt du säger ifrån. Väger tungt i vård, omsorg och team med mycket samarbete.' },
  { rubrik: 'Öppenhet', faktor: 'openness', text: 'Nyfikenhet på nya arbetssätt och idéer. Väger tungt där verktyg och metoder byts ofta, som i IT.' },
]

/** Faktorns "i arbetet"-text per namn, till tydligaste draget i resultatet. Samma text som avsnittet De fem faktorerna. */
const I_ARBETET: Record<string, string> = Object.fromEntries(FAKTORER.map((f) => [f.rubrik, f.text]))

const FAQ = [
  {
    q: 'Är personlighetstestet gratis?',
    a: 'Ja. Provet med tjugo påståenden kräver inget konto. Med ett gratiskonto sparar du profilen och får hela tolkningen, och hela testet med femtio påståenden ingår också gratis.',
  },
  {
    q: 'Vilken modell bygger testet på?',
    a: 'Femfaktormodellen, även kallad Big Five. Det är samma modell som MAP från Assessio och de flesta personlighetstest i svensk rekrytering bygger på. Faktorerna är samvetsgrannhet, utåtriktning, stabilitet, vänlighet och öppenhet.',
  },
  {
    q: 'Räcker tjugo påståenden för en profil?',
    a: 'Tjugo påståenden ger en riktning, inte ett exakt tal. Därför visar vi bandord i stället för poäng. Vill du ha en profil du kan lita på gör du hela testet med femtio påståenden i kontot.',
  },
  {
    q: 'Vad är omvända påståenden?',
    a: 'Hälften av påståendena är formulerade åt andra hållet, så att "stämmer inte" ger högt värde på faktorn. Det är så ett test ser om du svarar konsekvent. Efter att du skapat ett konto ser du vilka tio som var omvända och hur konsekvent du svarade.',
  },
  {
    q: 'Kan jag öva inför ett skarpt personlighetstest?',
    a: 'Du kan vänja dig vid formatet, och det är värt det. Svaren ska däremot vara ärliga: de flesta test har en indikator som flaggar tillrättalagda svar, och den som svarar sig in i fel roll hamnar på en arbetsplats där hen trivs sämre.',
  },
  {
    q: 'Vad ingår om jag betalar?',
    a: `Grundtestet med femtio påståenden är gratis. Med ${paketKort()}, ${prisPeriod(SALD_PLAN)}, ingår det fördjupade testet med 120 påståenden och 30 delfaktorer, och intervjuprovet utan tak.`,
  },
]

/** Saras profil, exempel. Samma nivåer som exemplet på /verktyg/rekryteringstester. */
const SARA: BigFiveScores = { conscientiousness: 88, extraversion: 26, neuroticism: 28, agreeableness: 58, openness: 52 }
const FORVALD_KRAVPROFIL = 'Ledarskap och projektledning'

/** Kravets spann på skalan 0 till 100, ur bandgränserna (bandFor: låg under 40, hög från 70). */
function kravSpann(krav: 'hog' | 'mittPlus'): [number, number] {
  return krav === 'hog' ? [70, 100] : [40, 100]
}

/** Mätaren för en faktor mot en kravprofil: spannet streckat, Saras värde som punkt, utfallet som chip. Inga siffror. */
function Matare({ faktor, profilIndex, forvald }: { faktor: Faktor; profilIndex: number; forvald: boolean }) {
  const profil = KRAVPROFILER[profilIndex]
  const regel = profil.regler.find((r) => r.faktor === faktor)
  const p = visadPoang(SARA, faktor)
  const band = bandFor(p)
  const passar = regel ? (regel.krav === 'hog' ? band === 'high' : band !== 'low') : true
  const spann = regel ? kravSpann(regel.krav) : null
  const etikett = `Exempel: Saras värde är ${bandOrd(band).toLowerCase()}. ${
    regel ? `${profil.namn} frågar efter ${regel.krav === 'hog' ? 'hög' : 'mitt emellan eller hög'}.` : `${profil.namn} ställer inget krav på faktorn.`
  }`
  return (
    <div className={['pt-matt', !passar ? 'pt-fraga' : '', forvald ? 'pt-forvald' : ''].filter(Boolean).join(' ')} data-k={profilIndex}>
      <div className="pt-matt-topp">
        {bandOrd(band)}
        <Chip typ={!regel ? 'ton' : passar ? 'gratis' : 'koppar'}>{!regel ? 'Inget krav i rollen' : passar ? 'Passar kravprofilen' : 'Räkna med en fråga'}</Chip>
      </div>
      <div className="pt-spann" role="img" aria-label={etikett}>
        {spann ? <span className="pt-krav" style={{ left: `${spann[0]}%`, right: `${100 - spann[1]}%` }} /> : null}
        <span className="pt-du" style={{ left: `${p}%` }} />
      </div>
      <div className="pt-axel" aria-hidden="true">
        <span>Låg</span>
        <span>Mitt emellan</span>
        <span>Hög</span>
      </div>
    </div>
  )
}

export default function PersonlighetstestSida() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Personlighetstest',
    url: URL,
    description: SIDA.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK', description: 'Gratis, utan konto' },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const utfall = faktorUtfall(SARA)
  const tydligast = utfall[0]
  const utslag = utfall.filter((u) => u.band !== 'mid').slice(0, 2)
  const forvald = Math.max(0, KRAVPROFILER.findIndex((k) => k.namn === FORVALD_KRAVPROFIL))

  return (
    <>
      <RedirectLoggedIn to={GRUNDTEST_HREF} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Sida farg="tran" className="pt-sida">
        <Hjalte
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Personlighetstest', href: '/verktyg/personlighetstest' },
          ]}
          etikett="Personlighetstest, femfaktormodellen"
          h1={SIDA.h1}
          varde={
            <>
              Tjugo påståenden på samma modell som MAP och de flesta test i svensk rekrytering. Du får din profil direkt och en rad per
              faktor om hur en rekryterare läser den. <b>Inget konto, ungefär två minuter.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="#provet" pil>
                Gör provet nu
              </Knapp>
              <TextLank href="#faktorerna">Så läser rekryteraren profilen</TextLank>
            </>
          }
          brickor={[
            { tal: String(ANTAL_PASTAENDEN), text: 'påståenden' },
            { tal: '2 min', text: 'ungefär' },
            { tal: String(FAKTORER.length), text: 'faktorer i profilen' },
          ]}
          bild={
            <div
              className="pt-hbild"
              role="img"
              aria-label="Exempel: Sara Lindströms profil med fem faktorer, hennes tydligaste drag och en fråga hon kan få på intervjun"
            >
              <Svav className="pt-drag" gungar>
                <em>Ditt tydligaste drag</em>
                <b>
                  {tydligast.bandOrd} {tydligast.namn.toLowerCase()}
                </b>
              </Svav>
              <div className="pt-profil">
                <em>Din profil, exempel</em>
                <b>Fem faktorer med bandord</b>
                {FAKTORER.map((f) => {
                  const p = visadPoang(SARA, f.faktor)
                  const seg = segment(p)
                  return (
                    <div className="pt-frad" key={f.faktor}>
                      <b>{f.rubrik}</b>
                      <span className="p3-chip">{bandOrd(bandFor(p))}</span>
                      <span className="pt-skala">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i key={s} className={s < seg ? 'pt-pa' : s === seg ? 'pt-nu' : undefined} />
                        ))}
                      </span>
                    </div>
                  )
                })}
              </div>
              <Svav className="pt-fragasv" gungar sen>
                <em>Rekryteraren lär fråga</em>
                <b>{tydligast.lasning}</b>
              </Svav>
            </div>
          }
          lyft
        />

        {/* Provet: sidans första handling, det fungerande provet ur artiklarna */}
        <Lyft id="provet" etikett="Personlighetsprovet">
          <div className="pt-prov">
            <div className="pt-prov-panel">
              <Personlighetsprov slug="verktyg/personlighetstest" sida iArbetet={I_ARBETET} />
            </div>
            <div className="pt-efter">
              <p className="p3-ey">Det här får du</p>
              <ul>
                <li>
                  <i>
                    <Ikon namn="bock" />
                  </i>
                  <div>
                    Profilen direkt<span>Fem faktorer med bandord: hög, mitt emellan eller låg.</span>
                  </div>
                </li>
                <li>
                  <i>
                    <Ikon namn="bock" />
                  </i>
                  <div>
                    En rad per faktor<span>Så läser en rekryterare den.</span>
                  </div>
                </li>
                <li>
                  <i className="pt-las">
                    <Ikon namn="las" />
                  </i>
                  <div>
                    Profilen mot sex kravprofiler<span>Med ett gratiskonto.</span>
                  </div>
                </li>
                <li>
                  <i className="pt-las">
                    <Ikon namn="las" />
                  </i>
                  <div>
                    Vad du kan säga på intervjun<span>Med ett gratiskonto.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Lyft>

        {/* Så fungerar det: stegen som väg med en bild var */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud etikett="Från kryss till profil" rubrik="Så fungerar det" varde="Från tjugo kryss till en profil du kan ta med dig in i intervjun." />
          <ol className="pt-vag">
            {STEG.map((s, i) => (
              <li key={s.rubrik}>
                <Nr typ={i === 3 ? 'koppar' : 'ton'}>{i + 1}</Nr>
                <h3 className="p3-h3">{s.rubrik}</h3>
                <p>{s.text}</p>
                <div className="pt-stegbild" aria-hidden="true">
                  {i === 0 ? (
                    <span className="pt-b-likert">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <i key={n} className={n === 4 ? 'pt-v' : undefined}>
                          {n}
                        </i>
                      ))}
                    </span>
                  ) : i === 1 ? (
                    <span className="pt-b-profil">
                      {FAKTORER.map((f) => {
                        const seg = segment(visadPoang(SARA, f.faktor))
                        return (
                          <span key={f.faktor}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <i key={n} className={n < seg ? 'pt-pa' : n === seg ? 'pt-nu' : undefined} />
                            ))}
                          </span>
                        )
                      })}
                    </span>
                  ) : i === 2 ? (
                    <span className="pt-b-krav">
                      {KRAVPROFILER.slice(0, 3).map((k) => (
                        <span key={k.namn}>{k.namn}</span>
                      ))}
                    </span>
                  ) : (
                    <span className="pt-b-femtio">{T.personlighetGrund.fragor}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Sektion>

        {/* De fem faktorerna läst mot en kravprofil som går att välja */}
        <Sektion id="faktorerna" botten="ton" className="pt-faktorsekt">
          <SektionHuvud
            etikett="Vad testet mäter"
            rubrik="De fem faktorerna och vad rekryteraren ser i dem"
            varde="Ingen faktor är bra eller dålig i sig. Det som avgör är hur profilen möter kravprofilen för rollen."
          >
            <p className="p3-text">Här är Saras profil, ett exempel, läst mot en av de sex kravprofilerna. Välj en annan roll så byts mätarna.</p>
          </SektionHuvud>
          <fieldset className="pt-roller">
            <legend>Kravprofil</legend>
            {KRAVPROFILER.map((k, i) => (
              <label key={k.namn}>
                <input type="radio" name="kravprofil" value={i} defaultChecked={i === forvald} />
                <span>{k.namn}</span>
              </label>
            ))}
          </fieldset>
          <div className="pt-forkl" aria-hidden="true">
            <span>
              <i />
              Saras värde
            </span>
            <span>
              <i className="pt-k" />
              Det kravprofilen frågar efter
            </span>
          </div>
          <div className="pt-fakt">
            {FAKTORER.map((f) => (
              <article key={f.faktor}>
                <div>
                  <h3 className="p3-h3">{f.rubrik}</h3>
                  <p>{f.text}</p>
                </div>
                <div className="pt-matare">
                  {KRAVPROFILER.map((k, i) => (
                    <Matare key={k.namn} faktor={f.faktor} profilIndex={i} forvald={i === forvald} />
                  ))}
                </div>
              </article>
            ))}
          </div>

          <article className="p3-o p3-med-bild pt-ifragor-o">
            <div className="p3-o-rad">
              <div className="p3-o-text">
                <div className="p3-o-huvud">
                  <Dorr ikon="tran" />
                  <p className="p3-ey">Inför intervjun</p>
                </div>
                <h3 className="p3-h2">Frågor rekryteraren lär ställa</h3>
                <p className="p3-varde">
                  Där profilen och kravprofilen skiljer sig kommer frågan. Vi skriver ut vilka frågor din profil brukar ge och hur du kan svara,
                  faktor för faktor.
                </p>
                <p>Med det fördjupade testet i Premium får du också frågorna rekryteraren har i sin intervjuguide, att öva på i förväg.</p>
                <div className="p3-knapprad">
                  <Knapp href="#provet" variant="vit">
                    Gör provet utan konto
                  </Knapp>
                  <span className="p3-liten">Hela tolkningen följer med ett gratiskonto.</span>
                </div>
              </div>
              <div className="p3-o-bild">
                <div className="pt-ifragor">
                  {utslag.map((u, i) => (
                    <div key={u.key} className="pt-ifr-par">
                      <div className="pt-ifr">
                        <em>
                          Fråga {i + 1}, {u.bandOrd.toLowerCase()} {u.namn.toLowerCase()}
                        </em>
                        <b>{u.lasning}</b>
                      </div>
                      <div className="pt-ifr pt-isvar">
                        <em>Så svarar du</em>
                        <p>{INTERVJU[u.key][u.band]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </Sektion>

        {/* Hela testet: tre steg i en trappa */}
        <Sektion>
          <div className="p3-vagg pt-femtio">
            <SektionHuvud
              etikett="Hela testet"
              rubrik="Femtio påståenden, gratis i kontot"
              varde="Provet ger en riktning. Hela testet ger profilen rekryteraren faktiskt jämför med, och den sparas inför intervjun."
            />
            <div className="pt-trappa">
              <div className="pt-steg">
                <p className="pt-tal">
                  {ANTAL_PASTAENDEN}
                  <small>påståenden</small>
                </p>
                <p className="pt-steg-namn">
                  Provet <Chip typ="vagg">Utan konto</Chip>
                </p>
                <p>Två minuter. Profilen direkt, med en rad per faktor om hur rekryteraren läser den.</p>
              </div>
              <div className="pt-steg pt-mitt">
                <p className="pt-tal">
                  {T.personlighetGrund.fragor}
                  <small>påståenden</small>
                </p>
                <p className="pt-steg-namn">
                  Hela testet <Chip typ="gratis">Gratis i kontot</Chip>
                </p>
                <p>{T.personlighetGrund.minuter} minuter. Profilen du kan ta med dig till intervjun.</p>
                <Bocklista paPapper punkter={['Profilen mot sex kravprofiler', 'Styrkorna och det att vara medveten om', 'Det du kan säga på intervjun']} />
                <Knapprad>
                  <Knapp href="/register?borja=tester">Skapa konto gratis</Knapp>
                  <TextLank href="#provet">Gör provet först</TextLank>
                </Knapprad>
              </div>
              <div className="pt-steg pt-prem">
                <p className="pt-tal">
                  {T.personlighetFordjupad.fragor}
                  <small>påståenden</small>
                </p>
                <p className="pt-steg-namn">
                  Fördjupade testet <Chip typ="premium">Premium</Chip>
                </p>
                <p>
                  {T.personlighetFordjupad.minuter} minuter, 30 delfaktorer. Din arbetsstil och frågorna i rekryterarens intervjuguide. Ingår i{' '}
                  {paketKort()}, <MedKampanjPris text={PRIS} />.
                </p>
              </div>
            </div>
          </div>
        </Sektion>

        <Sektion luft="utan-topp">
          <Faq
            rubrik="Vanliga frågor om personlighetstestet"
            fragor={FAQ}
            efter={
              <Knapprad>
                <Knapp href="#provet" pil>
                  Gör provet nu
                </Knapp>
                <TextLank href="/verktyg/rekryteringstester">Alla rekryteringstester</TextLank>
              </Knapprad>
            }
          />
        </Sektion>
      </Sida>
    </>
  )
}
