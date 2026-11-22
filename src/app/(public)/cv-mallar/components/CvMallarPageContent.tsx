/**
 * /cv-mallar i publikt omgång 3 (skissen cv-mallar, noten
 * docs/design/publikt-omgang3/noter/cv-mallar.md). Serverkomponent.
 *
 * Texten är dagens, ordagrant och i samma ordning (SEO-beskedet avsnitt 8,
 * sidan har den hårda regeln): H1, alla elva H2, de 74 yrkenas H3, de 26
 * Word-mallarnas H3, stegen, fördelarna, guiden, frågorna och länkarna.
 * Formen är ny: mallväggen i hjälten, uppladdningen och arbetsytan i det
 * lyfta kortet, yrkena i grupper med "Visa alla" (allt står i HTML:en,
 * dolt med CSS och details), filterchips över de 40 mallarna (CSS, ingen
 * JavaScript) och Premiumremsan. Talen ur katalogen och datan.
 */
import Link from 'next/link'
import {
  Sida,
  Hjalte,
  Sektion,
  SektionHuvud,
  Kort,
  Rutnat,
  Chip,
  Nr,
  VagSteg,
  Faq,
  O,
  Talbrickor,
  Knapp,
  Knapprad,
  TextLank,
  PrisRad,
  MallMiniatyr,
  Filterchips,
  type FaqFraga,
} from '@/components/publikt/v3'
import ProvaProvider from '@/components/cv/Dokument/prova/ProvaKontext'
import { MALL_KATALOG, MALL_ANTAL, GRATIS_ANTAL, PREMIUM_ANTAL, WORD_ANTAL } from '@/lib/cv/mallval/katalog'
import { prisInfo } from '@/lib/cv/mallval/pris.server'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { SALD_PLAN, paketNamn } from '@/lib/plans/plans'
import { YRKESMALL_PUBLIKA, type Yrkesmall } from '../yrkesmall-data'
import { FUNKTIONER, STEG, WORD_INGRESS, WORD_RADER } from './mallar-produkt'
import { arPilotSammanslagen } from '../pilot-slugs'
import { ANTAL_EN_SPALT, ANTAL_FOTO, STIL_SIDOR, stilMallar, type Stil } from '@/lib/seo/cv-kluster'
import { MallKortet, Mallvagg, ProvaLyft, Situationsrad } from './MallDelar'
import YrkeSok from './YrkeSok'
import './mallar-v3.css'

type Mall = (typeof MALL_KATALOG)[number]

/**
 * Mallar efter stil (SEO-svepet 2026-11-17, B4 punkt 3): ett kort per
 * stilsida, talen ur katalogen och bilden av en mall med egenskapen först.
 */
const STILAR: { stil: Stil; antal: string; bild: string }[] = [
  { stil: 'word', antal: `${WORD_ANTAL} mallar som Word-fil`, bild: 'kolumn' },
  { stil: 'foto', antal: `${ANTAL_FOTO} mallar med fotoplats`, bild: 'bjork' },
  { stil: 'enkla', antal: `${ANTAL_EN_SPALT} mallar i en spalt`, bild: 'linne' },
]

const GRATIS_MALLAR = MALL_KATALOG.filter((m) => m.niva === 'gratis')
const GRATIS_NAMN = GRATIS_MALLAR.map((m) => m.namn)

function uppraknat(namn: string[]): string {
  return namn.length < 2 ? namn.join('') : `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`
}

const KATEGORI_LABEL: Record<Yrkesmall['kategori'], string> = {
  vard: 'Vård',
  utbildning: 'Utbildning',
  service: 'Service',
  teknik: 'Tech',
  ekonomi: 'Ekonomi',
  'offentlig-sektor': 'Offentlig sektor',
  hantverk: 'Hantverk',
  industri: 'Teknik',
  logistik: 'Logistik',
  student: 'Student',
}

/** Grupperna i den ordning yrkena först förekommer i datan. */
function grupperaYrken(yrken: Yrkesmall[]) {
  const ordning: Yrkesmall['kategori'][] = []
  const per = new Map<Yrkesmall['kategori'], Yrkesmall[]>()
  for (const y of yrken) {
    if (!per.has(y.kategori)) {
      per.set(y.kategori, [])
      ordning.push(y.kategori)
    }
    per.get(y.kategori)!.push(y)
  }
  return ordning.map((k) => ({ kategori: k, namn: KATEGORI_LABEL[k], yrken: per.get(k)! }))
}

/** Hur många yrken per grupp som syns på dator innan "Visa alla" (skissen: åtta). */
const SYNLIGA_DATOR = 8
/** Och i telefonen (skissen: tre). Själva döljandet står i mallar-v3.css. */
const SYNLIGA_TELEFON = 3

/** Mallväggen i hjälten: åtta mallar ur katalogen, gratismallarna med. */
const VAGG_IDS = ['linne', 'koppar', 'ritning', 'bjork', 'granit', 'terrakotta', 'kalksten', 'morkrum']
const VAGG = VAGG_IDS.map((id) => MALL_KATALOG.find((m) => m.id === id)).filter((m): m is Mall => Boolean(m))

/** Filtren över rutnätet, antalen ur katalogen. */
const FAMILJ_NAMN: Record<string, string> = {
  'en-spalt': 'En spalt',
  sidospalt: 'Sidospalt',
  marginal: 'Rubriker i marginalen',
  konstnarlig: 'Konstnärlig',
}
const FILTER = [
  { id: 'alla', namn: 'Alla', antal: MALL_ANTAL },
  { id: 'gratis', namn: 'Gratis', antal: GRATIS_ANTAL },
  { id: 'word', namn: 'Word', antal: WORD_ANTAL },
  { id: 'foto', namn: 'Foto', antal: MALL_KATALOG.filter((m) => m.foto).length },
  ...Object.entries(FAMILJ_NAMN).map(([id, namn]) => ({ id, namn, antal: MALL_KATALOG.filter((m) => m.familj === id).length })),
].filter((f) => f.antal > 0)

function filterTaggar(m: Mall): string {
  return [m.niva === 'gratis' ? 'gratis' : '', m.word ? 'word' : '', m.foto ? 'foto' : '', m.familj].filter(Boolean).join(' ')
}

const WORD_MALLAR = MALL_KATALOG.filter((m) => m.word).map((m, i) => ({ mall: m, rad: WORD_RADER[i] }))
const LINNE = GRATIS_MALLAR[0] ?? MALL_KATALOG[0]

/** Bilderna i stegen, i stegens ordning (aria-hidden i VagSteg). */
function stegBild(i: number) {
  if (i === 0) {
    return (
      <div className="cvm-b-mallar">
        {['kolumn', LINNE.id, 'granit'].map((id) => (
          <MallMiniatyr key={id} id={id} namn={false} chip={false} />
        ))}
      </div>
    )
  }
  if (i === 1) {
    return (
      <div className="cvm-b-ark">
        <i />
        <i />
        <i style={{ width: '80%' }} />
        <div>
          <i style={{ width: '90%' }} />
          <i className="cvm-m" />
          <i style={{ width: '60%' }} />
        </div>
        <i />
      </div>
    )
  }
  if (i === 2) {
    return (
      <div className="cvm-b-byt">
        <MallMiniatyr id={LINNE.id} namn={false} chip={false} />→<MallMiniatyr id="koppar" namn={false} chip={false} />→
        <MallMiniatyr id="stal" namn={false} chip={false} />
      </div>
    )
  }
  return (
    <div className="cvm-b-fmt">
      <b>PDF</b>
      <b>Word</b>
    </div>
  )
}

/** Den lilla bilden ovanför varje fördel, i FUNKTIONER:s ordning. Exempel, aria-hidden. */
function fordelBild(i: number) {
  switch (i) {
    case 0:
      return (
        <div>
          {MALL_ANTAL} av {MALL_ANTAL}
          <small>lästes rätt</small>
        </div>
      )
    case 1:
      return (
        <div>
          PDF + Word<small>Word i {WORD_ANTAL} mallar</small>
        </div>
      )
    case 2:
      return (
        <div className="cvm-prickar">
          {LINNE.accenter.map((f) => (
            <i key={f} style={{ background: f }} />
          ))}
        </div>
      )
    case 3:
      return (
        <div className="cvm-ordn">
          <i />
          <i />
          <i />
        </div>
      )
    case 4:
      return (
        <div className="cvm-foto">
          <i />
          {ANTAL_FOTO}
        </div>
      )
    case 5:
      return <span className="cvm-rad1">linkedin.com/in/sara-lindstrom</span>
    case 6:
      return (
        <div>
          Sparat<small>i ditt konto</small>
        </div>
      )
    default:
      return (
        <div className="cvm-tel">
          <b />
          <i />
        </div>
      )
  }
}

function FelArk({ ruta, forst }: { ruta: { left: string; top: string; width: string; height: string }; forst?: boolean }) {
  return (
    <span className="cvm-fel-ark" aria-hidden="true">
      <i style={{ width: '50%', marginTop: forst ? 22 : undefined }} />
      <i />
      <i />
      <i style={{ width: '70%' }} />
      <span className="cvm-ruta" style={ruta} />
      <span className="cvm-kryss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </span>
    </span>
  )
}

interface CvMallarPageContentProps {
  yrkesmallar: Yrkesmall[]
  faqItems: readonly FaqFraga[]
}

export default function CvMallarPageContent({ yrkesmallar, faqItems }: CvMallarPageContentProps) {
  const grupper = grupperaYrken(yrkesmallar)
  return (
    <Sida farg="cv">
      <ProvaProvider katalog={MALL_KATALOG} surface="mallsida" pris={prisInfo()}>
        <div id="innehall">
          <Hjalte
            id="hjalte"
            brodsmulor={[
              { name: 'Hem', href: '/' },
              { name: 'Exempel', href: '/exempel' },
              { name: 'CV-mallar', href: '/cv-mallar' },
            ]}
            brodsmulorSchema={false}
            etikett={`${MALL_ANTAL} CV-mallar`}
            h1={
              <>
                CV-mallar att fylla i och ladda ner. <span>{MALL_ANTAL} mallar, {GRATIS_ANTAL} gratis.</span>
              </>
            }
            h1Mindre
            varde={
              <>
                En CV-mall är en färdig layout som du fyller med dina egna uppgifter. Vi har {MALL_ANTAL} mallar, och {GRATIS_ANTAL} av dem är
                gratis: {uppraknat(GRATIS_NAMN)}. <b>Ladda upp ditt CV och se det i alla mallar direkt.</b> Kontot behövs först när du laddar
                ner gratismallarna som PDF eller Word.
              </>
            }
            knappar={
              <>
                <Knapp href="#ladda-upp" pil>
                  Ladda upp ditt CV
                </Knapp>
                <TextLank href="#mall-galleri">Se alla {MALL_ANTAL} mallar</TextLank>
              </>
            }
            brickor={[
              { tal: String(MALL_ANTAL), text: 'mallar, i fyra färger var' },
              { tal: String(GRATIS_ANTAL), text: `gratis: ${uppraknat(GRATIS_NAMN)}` },
              { tal: String(WORD_ANTAL), text: 'finns som Word' },
              { tal: String(ANTAL_FOTO), text: 'har plats för foto' },
            ]}
            bild={<Mallvagg mallar={VAGG} etikett={`${VAGG.length} av de ${MALL_ANTAL} CV-mallarna`} />}
            lyft
          />

          {/* Resultatet på samma sida: uppladdningen och arbetsytan i det lyfta kortet. */}
          <ProvaLyft etikett="Se ditt eget CV i mallarna" under={<Situationsrad />} />

          {/* Yrkesmallar: snabblänkarna för "cv mall {yrke}", i grupper.
              id="yrken" är fotens ankare "CV-mallar per yrke" (SEO:s slutbesked, punkt 26). */}
          <Sektion id="yrken">
            <SektionHuvud
              etikett={`${yrkesmallar.length} yrken i ${grupper.length} grupper`}
              rubrik="CV-mallar för ditt yrke"
              varde={
                <>
                  Alla våra mallar passar alla yrken, men rubrikerna, exemplet och råden skiljer sig. På varje yrkessida ser du ditt yrkes CV i
                  mallarna, med rubriker som rekryterare i branschen känner igen, till exempel &quot;Klinisk erfarenhet&quot; eller &quot;Behörigheter
                  och körkort&quot;. Klicka på ditt yrke för att se vad rekryteraren letar efter och hur du får fram det i mallen.
                </>
              }
            />
            <YrkeSok listaId="cvm-yrken" tomId="cvm-yrken-tom" />
            <div className="cvm-grupper" id="cvm-yrken">
              {grupper.map((g) => {
                const forsta = g.yrken.slice(0, SYNLIGA_DATOR)
                const resten = g.yrken.slice(SYNLIGA_DATOR)
                const kort = (y: Yrkesmall) => {
                  // Piloten (B3): yrkesmallsidan är sammanslagen med CV-exemplet.
                  const pilot = arPilotSammanslagen(y.slug)
                  return (
                    <li key={y.slug} data-yrke={`${y.namn} ${y.slug} ${g.namn}`.toLowerCase()}>
                      <Link
                        href={pilot ? `/cv-exempel/${y.slug}` : `/cv-mallar/${y.slug}`}
                        className="cvm-yrke"
                        aria-label={pilot ? `Se CV-exempel och mallar för ${y.namn}` : `Se CV-mall för ${y.namn}`}
                      >
                        <h3 className="p3-h3">{y.namn}</h3>
                        <p>{y.intro}</p>
                        <span className="cvm-yrke-fot">
                          <span>{PAKETRADER.mallarGratisOchPaket}</span>
                          <b>{pilot ? 'Se exempel och mall' : 'Se mall'}</b>
                        </span>
                      </Link>
                    </li>
                  )
                }
                return (
                  <div key={g.kategori} className="cvm-grupp" data-grupp="">
                    <div className="cvm-grupp-huvud">
                      <p className="cvm-grupp-namn">{g.namn}</p>
                      <Chip>{g.yrken.length}</Chip>
                    </div>
                    <ul className="cvm-grupp-rad">{forsta.map(kort)}</ul>
                    {g.yrken.length > SYNLIGA_TELEFON ? (
                      <details className={`cvm-fler ${resten.length ? '' : 'cvm-bara-telefon'}`.trim()}>
                        <summary>
                          Visa alla {g.yrken.length} i {g.namn}
                        </summary>
                        {resten.length ? <ul className="cvm-grupp-rad">{resten.map(kort)}</ul> : null}
                      </details>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <p id="cvm-yrken-tom" className="p3-liten cvm-sok-tom" hidden>
              Inga yrken matchar sökningen. Prova ett närliggande yrke.
            </p>
          </Sektion>

          {/* Alla mallar: riktiga miniatyrer, var och en till provsidan. */}
          <Sektion botten="ton" id="mall-galleri">
            <SektionHuvud
              etikett="Hela utbudet"
              rubrik="Alla våra CV-mallar"
              varde={
                <>
                  Välj formen för din ansökan: en spalt, sidospalt, rubriker i marginalen eller en konstnärlig layout. Alla {MALL_ANTAL} mallar är
                  testade mot rekryteringssystem och byggda för svenska arbetsgivare, och varje mall finns i fyra färger. {GRATIS_ANTAL} är gratis:{' '}
                  {uppraknat(GRATIS_NAMN)}. Yrkessidorna hjälper dig med rubrikerna och innehållet för din bransch.
                </>
              }
            >
              <p className="p3-text">Klicka på en mall så ser du den med ett färdigt CV, eller ladda upp ditt eget.</p>
            </SektionHuvud>
            <div className="cvm-filtrera">
              <Filterchips className="cvm-filter" namn="cvm-filter" idPrefix="cvm-f-" val={FILTER} forval="alla" legend="Filtrera mallarna" />
              <ul className="cvm-mallnat">
                {MALL_KATALOG.map((m) => (
                  <li key={m.id} id={`mall-${m.id}`} data-f={filterTaggar(m)}>
                    <MallKortet mall={m} href={`/cv-mallar/prova?mall=${encodeURIComponent(m.id)}`} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="p3-premium cvm-prem">
              <div className="cvm-prem-rad">
                <div>
                  <p className="p3-ey">{paketNamn(SALD_PLAN)}</p>
                  <p className="cvm-prem-rubrik" style={{ marginTop: 8 }}>
                    {PREMIUM_ANTAL} mallar till ingår i Premium, med PDF i alla och Word i {WORD_ANTAL} av de {MALL_ANTAL}.
                  </p>
                  <p style={{ marginTop: 8, fontSize: 15.5 }}>
                    Du ser ditt CV i varje mall innan du bestämmer dig. Du betalar först när du laddar ner en Premiummall.
                  </p>
                </div>
                <Knapprad>
                  <PrisRad />
                  <Knapp href="/priser" data-cta-klick="/priser">
                    Se vad som ingår
                  </Knapp>
                </Knapprad>
              </div>
            </div>
          </Sektion>

          {/* Från /verktyg/cv-mallar (308 hit sedan 2026-11-16): Word-avsnittet
              med ankaret #word, stegen och funktionerna, ordagrant. */}
          <Sektion id="word" className="cvm-word">
            <div className="p3-vagg cvm-word-o">
              <div className="cvm-word-rad">
                <SektionHuvud etikett="Word" rubrik="CV-mallar för Word" varde={WORD_INGRESS} />
                <div className="cvm-docx" aria-hidden="true">
                  <i>.docx</i>
                  <div>
                    <b>{WORD_ANTAL}</b>
                    <span>mallar som Word-fil. {uppraknat(GRATIS_NAMN)} utan att betala något.</span>
                  </div>
                </div>
              </div>
            </div>
            <ul className="cvm-wordnat">
              {WORD_MALLAR.map(({ mall, rad }) => (
                <li key={mall.id}>
                  <div className="cvm-wordkort">
                    <MallMiniatyr id={mall.id} namn={false} chip={false} />
                    <div>
                      <div className="cvm-wordnamn">
                        <h3 className="p3-h3">{rad.rubrik}</h3>
                        {mall.niva === 'gratis' ? <Chip typ="gratis">Gratis som Word</Chip> : null}
                      </div>
                      <p>{rad.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <details className="cvm-fler">
              <summary>Visa alla {WORD_ANTAL} Word-mallar</summary>
            </details>
            <Knapprad className="cvm-word-fot">
              <Knapp href="/cv-mallar/word" variant="vit" data-cta-klick="/cv-mallar/word">
                Alla Word-mallar
              </Knapp>
            </Knapprad>
          </Sektion>

          <Sektion botten="papper" id="sa-funkar-det">
            <SektionHuvud
              etikett="Fyra steg"
              rubrik="Så fungerar det"
              varde="Fyra steg från val till färdig PDF. Du fyller i dina uppgifter en gång och byter mall när du vill."
            />
            <VagSteg steg={STEG.map((s, i) => ({ rubrik: s.rubrik, text: s.text, bild: stegBild(i), koppar: i === STEG.length - 1 }))} />
            <Knapprad className="cvm-word-fot">
              <Knapp href="/register?borja=cv" pil>
                Bygg ditt CV nu
              </Knapp>
            </Knapprad>
          </Sektion>

          <Sektion>
            <SektionHuvud
              etikett="Vad du får"
              rubrik="Mer än en snygg layout"
              varde="Varje mall hjälper dig genom hela ansökan, inte bara med hur sidan ser ut."
            />
            <Rutnat kolumner={4} className="cvm-atta">
              {FUNKTIONER.map((f, i) => (
                <Kort key={f.rubrik}>
                  <div className="cvm-ebild" aria-hidden="true">
                    {fordelBild(i)}
                  </div>
                  <h3 className="p3-h3">{f.rubrik}</h3>
                  <p>{f.text}</p>
                </Kort>
              ))}
            </Rutnat>
          </Sektion>

          {/* Guiden, långformen. */}
          <Sektion botten="ton">
            <SektionHuvud
              etikett="Guide"
              rubrik="Vad gör en bra CV-mall för svenska arbetsgivare?"
              varde="Det handlar inte bara om hur det ser ut. Här är fyra saker som avgör."
            />
            <div className="cvm-avgor">
              <article>
                <div className="cvm-topp">
                  <Nr>1</Nr>
                  <p className="p3-ey">ATS-säkerhet</p>
                </div>
                <h3 className="p3-h3">Mallen måste passera rekryteringssystemet</h3>
                <div className="cvm-abild" aria-hidden="true">
                  <span className="cvm-ch cvm-pa">Arbetslivserfarenhet</span>
                  <span className="cvm-pil">→</span>
                  <span className="cvm-ch cvm-pa">Utbildning</span>
                  <span className="cvm-pil">→</span>
                  <span className="cvm-ch cvm-pa">Kompetenser</span>
                  <span>läses i rätt ordning</span>
                </div>
                <p>
                  Innan en människa läser ditt CV passerar det ofta ett ATS, ett Applicant Tracking System. Det är mjukvara som indexerar texten,
                  sorterar in kandidater på sökord och rangordnar matchningar. ATS-system har problem med vissa designval: clip-paths,
                  absolutpositionerade textfält, ovanliga typsnitt, och kolumner där läsordningen blir fel.
                </p>
                <p>
                  Våra mallar använder vanlig flödeslayout, standardrubriker som &quot;Arbetslivserfarenhet&quot; och &quot;Utbildning&quot; i
                  grundläget, och typsnitt som finns i alla operativsystem. Varje mall har dessutom gått genom vår egen CV-läsare med korta och
                  långa CV och olika ordning på avsnitten innan den kom med i utbudet, också mallarna med sidospalt. Du får designkänslan utan att
                  riskera att rekryteringssystemet sorterar bort dig innan en människa ens ser ditt CV.
                </p>
                <p>
                  Vad systemen läser och vad de hoppar över går vi igenom i guiden om ett{' '}
                  <Link href="/artiklar/ats-vanligt-cv" className="cvm-lank">
                    ATS-vänligt CV
                  </Link>
                  .
                </p>
              </article>
              <article>
                <div className="cvm-topp">
                  <Nr>2</Nr>
                  <p className="p3-ey">Branschmatchning</p>
                </div>
                <h3 className="p3-h3">Olika yrken kräver olika upplägg</h3>
                <div className="cvm-abild" aria-hidden="true">
                  <span className="cvm-ch">Klinisk erfarenhet</span>
                  <span className="cvm-ch">Pedagogisk erfarenhet</span>
                  <span className="cvm-ch">Behörigheter och körkort</span>
                  <span>tolv uppsättningar</span>
                </div>
                <p>
                  En läkare, en barnskötare och en säljare har helt olika meriter att lyfta: legitimationer, pedagogiska metoder, säljsiffror. En
                  mall med samma rubriker för alla sätter dem i samma form, vilket sällan fungerar. Därför har varje mall tolv rubrikuppsättningar att
                  välja mellan, en per bransch: &quot;Klinisk erfarenhet&quot; i stället för &quot;Arbetslivserfarenhet&quot; för vården,
                  &quot;Pedagogisk erfarenhet&quot; för skolan, och &quot;Legitimation och behörigheter&quot; eller &quot;Behörigheter och
                  körkort&quot; som eget avsnitt där intygen avgör. Passar ingen av dem skriver du en egen rubrik.
                </p>
                <p>
                  Det handlar också om visuell kod. Vården och offentlig sektor förväntar sig dämpade färger och tydlig struktur. Marknadsföring och
                  kreativa yrken har utrymme för djärvare grepp. Välj en form som matchar branschen du söker dig till, och en av mallens fyra färger
                  som passar tonen: dämpad till vården, varmare till service och kreativa yrken.
                </p>
                <p>
                  Mer om layout, typsnitt och luft finns i guiden om{' '}
                  <Link href="/artiklar/hur-ska-ett-cv-se-ut" className="cvm-lank">
                    hur ett CV ska se ut
                  </Link>
                  , och funderar du på foto läser du först om{' '}
                  <Link href="/artiklar/cv-bild-guide" className="cvm-lank">
                    bild i CV:t
                  </Link>
                  . Söker du utomlands har vi en egen guide för{' '}
                  <Link href="/artiklar/cv-pa-engelska-resume" className="cvm-lank">
                    CV på engelska
                  </Link>
                  .
                </p>
              </article>
              <article>
                <div className="cvm-topp">
                  <Nr>3</Nr>
                  <p className="p3-ey">Erfarenhetsnivå</p>
                </div>
                <h3 className="p3-h3">Mallen ska passa hur långt du kommit i karriären</h3>
                <div className="cvm-abild cvm-tre" aria-hidden="true">
                  <span>
                    <MallMiniatyr id="bjork" namn={false} chip={false} />
                    Student
                  </span>
                  <span>
                    <MallMiniatyr id={LINNE.id} namn={false} chip={false} />
                    Mitt i karriären
                  </span>
                  <span>
                    <MallMiniatyr id="kalksten" namn={false} chip={false} />
                    Senior
                  </span>
                </div>
                <p>
                  Som student utan jobberfarenhet är fokus utbildning, projekt och praktik. Välj ordningen utbildning först och rubrikuppsättningen
                  Student, så får avsnitten plats i den ordning rekryteraren vill läsa dem. Som senior konsult med mer än 15 års erfarenhet behöver
                  du i stället rymma mycket: en sidospalt som Kalksten eller Granit, eller Stål med två spalter, får plats med fler uppdrag utan att
                  sidan känns trång, och valet Få plats på en sida hjälper när du ligger strax över.
                </p>
                <p>
                  Mallarna i en spalt, som Linne, Björk och Koppar, fungerar bra i mitten av karriären. Antikva och Folio, i serif med formellt
                  huvud, signalerar tradition och passar ledningsgrupp eller styrelseroller där det väger tungt.
                </p>
              </article>
              <article>
                <div className="cvm-topp">
                  <Nr>4</Nr>
                  <p className="p3-ey">Mall eller exempel</p>
                </div>
                <h3 className="p3-h3">Använd båda, de kompletterar varandra</h3>
                <div className="cvm-abild" aria-hidden="true">
                  <span className="cvm-ch cvm-pa">Exemplet</span>
                  <span>ger formuleringarna</span>
                  <span className="cvm-pil">+</span>
                  <span className="cvm-ch cvm-pa">Mallen</span>
                  <span>ger formen</span>
                </div>
                <p>
                  En CV-mall är designen: typsnitt, sektionsordning, färger och layout. Ett{' '}
                  <Link href="/cv-exempel" className="cvm-lank">
                    CV-exempel
                  </Link>{' '}
                  är ett färdigt CV med någon annans innehåll som du kan låta dig inspireras av. När du skriver ditt eget, börja med exempel-sidan för
                  ditt yrke (för att få bra formuleringar) och välj sedan en mall för designen.
                </p>
                <p>
                  För varje yrkessida här länkar vi till motsvarande CV-exempel, så att du både kan se ett färdigt CV och välja den form som passar
                  bäst. Ladda upp ditt eget CV högst upp på sidan för att se hur det ser ut i alla mallar.
                </p>
              </article>
            </div>
          </Sektion>

          {/* Från de sammanslagna artiklarna cv-mall-gratis-guide och
              cv-mall-pdf-gratis (B4, 308 hit sedan 2026-11-17), omskrivna. */}
          <Sektion id="gratis-cv-mall">
            <div className="cvm-gratis-rad">
              <div>
                <SektionHuvud etikett="Gratis" rubrik="Var hittar man en gratis CV-mall?" />
                <p>
                  Den första källan har du troligen redan. I Word ligger Microsofts egna CV-mallar under Arkiv och Nytt, Google Docs har ett
                  mallgalleri med några enkla CV-mallar, och på Mac och iPhone har Pages en egen kategori för CV. Alla tre är gratis och sparar till
                  PDF. Priset betalar du i tid: du byter ut exempeltexten, flyttar rubriker och kontrollerar att inget av ditt hamnat på ett ställe
                  där systemen inte läser.
                </p>
                <p>
                  Designverktygen på nätet har de mest påkostade mallarna, men där sitter ofta låsen. Mallen du fastnat för kräver ett konto med
                  kort, eller så får gratisfilen en vattenstämpel. Läs villkoren innan du lägger en kväll på texten, inte efteråt.
                </p>
              </div>
              <div>
                <p className="cvm-ledtext">
                  Oavsett var du hittar mallen finns det tre slags mallar vi avråder från, eftersom rekryteringssystemen ofta läser dem fel:
                </p>
                <ul className="cvm-undvik">
                  <li>
                    <FelArk ruta={{ left: '38%', top: '42%', width: '54%', height: '40%' }} />
                    <div>
                      <b>Textrutor.</b> Text som ligger i en ruta läses för sig, i fel ordning eller inte alls.
                    </div>
                  </li>
                  <li>
                    <FelArk ruta={{ left: '6%', top: '30%', width: '30%', height: '62%' }} />
                    <div>
                      <b>Tabeller för layout.</b> En sidopanel byggd som tabell kan komma ut i fel ordning, så att rader från två spalter blandas
                      ihop.
                    </div>
                  </li>
                  <li>
                    <FelArk ruta={{ left: '6%', top: '6%', width: '88%', height: '18%' }} forst />
                    <div>
                      <b>Text i sidhuvudet.</b> Namn och kontaktuppgifter i dokumentets sidhuvud hoppas ofta över, och då saknas det viktigaste.
                    </div>
                  </li>
                </ul>
                <div className="cvm-hos-oss">
                  <div aria-hidden="true">
                    {GRATIS_MALLAR.map((m) => (
                      <MallMiniatyr key={m.id} id={m.id} namn={false} chip={false} />
                    ))}
                  </div>
                  <p>
                    Hos oss är {uppraknat(GRATIS_NAMN)} gratis. Du fyller i mallen direkt på sidan, eller laddar upp ett CV du har, och laddar ner en
                    fil som PDF eller Word, utan kortuppgift och utan vattenstämpel. Alla {MALL_ANTAL} mallar har gått genom vår egen CV-läsare innan
                    de kom med, så du slipper gissa om texten kommer fram.
                  </p>
                </div>
              </div>
            </div>
          </Sektion>

          <Sektion botten="papper" id="pdf-eller-word">
            <SektionHuvud etikett="Filformat" rubrik="PDF eller Word?" />
            <div className="cvm-duell">
              <article className="cvm-forval">
                <div className="cvm-stor" aria-hidden="true">
                  PDF <Chip>Förvalet</Chip>
                </div>
                <p>
                  Skicka CV:t som PDF om annonsen inte ber om något annat. En PDF ser likadan ut oavsett vilken dator, telefon eller vilket program
                  rekryteraren öppnar den i. Ett Word-dokument byter typsnitt när mottagaren saknar ditt, och då kan en rad brytas fel eller en
                  rubrik hamna ensam längst ner på sidan.
                </p>
              </article>
              <article>
                <div className="cvm-stor" aria-hidden="true">
                  Word <Chip>När annonsen ber om det</Chip>
                </div>
                <p>
                  Word är rätt val när annonsen eller bemanningsföretaget ber om det, ofta för att CV:t ska läsas in i deras eget system, och när du
                  själv vill fortsätta ändra i filen. {WORD_ANTAL} av våra mallar finns som riktig Word-fil:{' '}
                  <Link href="/cv-mallar/word" className="cvm-lank" data-cta-klick="/cv-mallar/word">
                    CV-mallar i Word
                  </Link>
                  .
                </p>
              </article>
            </div>
            <div className="cvm-misstag">
              <p>
                Två misstag är vanliga när CV:t sparas som PDF. Det första är att skanna eller fotografera ett utskrivet CV. Då innehåller filen en
                bild, och systemen kan inte läsa text ur en bild, så spara alltid direkt från programmet. Det andra är filnamnet: Dokument1.pdf ser
                slarvigt ut i inkorgen. Döp filen efter dig, till exempel Anna-Andersson-CV.pdf.
              </p>
              <div className="cvm-filnamn" aria-hidden="true">
                <span className="cvm-nej">
                  <i />
                  Dokument1.pdf
                </span>
                <span>
                  <i />
                  Anna-Andersson-CV.pdf
                </span>
              </div>
            </div>
          </Sektion>

          <Sektion id="mallar-efter-stil">
            <SektionHuvud
              etikett="Efter stil"
              rubrik="Mallar efter stil"
              varde="Vet du redan vad du vill ha? Här är mallarna sorterade efter det de flesta letar efter."
            />
            <Rutnat kolumner={3}>
              {STILAR.map(({ stil, antal, bild }) => {
                const sida = STIL_SIDOR[stil]
                const alla = stilMallar(stil)
                const forst = alla.find((m) => m.id === bild) ?? alla[0]
                const fyra = [forst, ...alla.filter((m) => m.id !== forst.id)].slice(0, 4)
                return (
                  <Link key={stil} href={sida.path} data-cta-klick={sida.path} className="cvm-stil">
                    <span className="cvm-tal" aria-hidden="true">
                      {alla.length}
                    </span>
                    <b>{sida.kort}</b>
                    <span>{antal}</span>
                    <span className="cvm-rad" aria-hidden="true">
                      {fyra.map((m) => (
                        <MallMiniatyr key={m.id} id={m.id} namn={false} chip={false} />
                      ))}
                    </span>
                    <em>Se mallarna</em>
                  </Link>
                )
              })}
            </Rutnat>
          </Sektion>

          <Sektion id="fragor" luft="utan-topp">
            <Faq rubrik="Vanliga frågor om CV-mallar" ingress="Allt du behöver veta innan du väljer." fragor={faqItems} />
          </Sektion>

          <Sektion luft="utan-topp">
            <O
              farg="cv"
              ikon="cv"
              etikett="CV-exempel"
              rubrikNiva="h2"
              rubrik="Letar du efter ett färdigt CV-exempel i stället?"
              varde={`Vi har ${CV_GALLERI.length} färdiga CV-exempel för specifika yrken. Använd dem som inspiration när du skriver ditt eget innehåll.`}
              knappar={<Knapp href="/cv-exempel">Se CV-exempel</Knapp>}
              bild={
                <Talbrickor
                  brickor={[
                    { tal: String(CV_GALLERI.length), text: 'färdiga CV-exempel' },
                    { tal: String(YRKESMALL_PUBLIKA.length), text: 'yrken med egen mallsida' },
                  ]}
                />
              }
            />
          </Sektion>
        </div>
      </ProvaProvider>
    </Sida>
  )
}
