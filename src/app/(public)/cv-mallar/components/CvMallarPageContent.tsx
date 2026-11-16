/**
 * /cv-mallar på publikt v2 (plan-mallar 3.2): serverkomponent utan
 * framer-motion och lucide, mallregistret stannar på servern.
 *
 * Ägarens punkt 9: uppladdningen högst upp, utan konto, och resultatet på
 * samma sida (arbetsytan direkt under hjälten). Rubrikerna, guiden, frågorna
 * och länkarna står kvar ordagrant (SEO-grinden, avsnitt 5); talen och
 * gratismallarnas namn läses ur katalogen.
 */
import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import Hjalte from '@/components/publikt/Hjalte'
import Rum from '@/components/publikt/Rum'
import Faq from '@/components/publikt/Faq'
import ProvaProvider from '@/components/cv/Dokument/prova/ProvaKontext'
import Uppladdning from '@/components/cv/Dokument/prova/Uppladdning'
import ProvaArbetsyta from '@/components/cv/Dokument/prova/ProvaArbetsyta'
import Miniatyr from '@/components/cv/Dokument/Miniatyr'
import { MALL_KATALOG, MALL_ANTAL, GRATIS_ANTAL } from '@/lib/cv/mallval/katalog'
import { prisInfo } from '@/lib/cv/mallval/pris.server'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import type { Yrkesmall } from '../yrkesmall-data'

const GRATIS_NAMN = MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.namn)

function uppraknat(namn: string[]): string {
  return namn.length < 2 ? namn.join('') : `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`
}

/** Situationsraden: vanliga länkar till sidor och avsnitt som redan finns. */
const SITUATION = [
  { text: 'Student', href: '/cv-mallar/student' },
  { text: 'Utan erfarenhet', href: '/artiklar/cv-utan-erfarenhet' },
  { text: 'Karriärbyte', href: '/artiklar/hur-skriver-man-cv#cv-vid-karriarbyte' },
  { text: 'Chef', href: '/cv-mallar/chef' },
] as const

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

interface CvMallarPageContentProps {
  yrkesmallar: Yrkesmall[]
  faqItems: { q: string; a: string }[]
}

function GuideBlock({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="pub-kick">{eyebrow}</p>
      <h3 className="pub-h3">{title}</h3>
      <div className="pub-brod" style={{ marginTop: 14, display: 'grid', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

export default function CvMallarPageContent({ yrkesmallar, faqItems }: CvMallarPageContentProps) {
  return (
    <PubliktSida>
      <ProvaProvider katalog={MALL_KATALOG} surface="mallsida" pris={prisInfo()}>
        <div id="innehall">
          <Hjalte
            id="hjalte"
            rum="cv"
            yta="vagg"
            vag="mark"
            brodsmulor={[
              { name: 'Hem', href: '/' },
              { name: 'Exempel', href: '/exempel' },
              { name: 'CV-mallar', href: '/cv-mallar' },
            ]}
            kick={`${MALL_ANTAL} CV-mallar`}
            h1={
              <>
                CV-mallar att fylla i och ladda ner. <span>{MALL_ANTAL} mallar, {GRATIS_ANTAL} gratis.</span>
              </>
            }
            ingress={
              <>
                En CV-mall är en färdig layout som du fyller med dina egna uppgifter. Vi har {MALL_ANTAL} mallar, och {GRATIS_ANTAL} av dem är
                gratis: {uppraknat(GRATIS_NAMN)}. Ladda upp ditt CV och se det i alla mallar direkt. Kontot behövs först när du laddar
                ner gratismallarna som PDF eller Word.
              </>
            }
            primar={null}
            bildLag
            bild={<Uppladdning />}
          />

          {/* Resultatet på samma sida: arbetsytan direkt under uppladdningen. */}
          <Rum rum="cv" yta="mark" storlek="tat" id="valj-mall">
            <div className="pub-wrap">
              <ProvaArbetsyta />
              {/* Situationsraden under arbetsytan (granskningen V5), så att
                  uppladdningen kommer direkt efter ingressen. */}
              <nav aria-label="Välj efter situation" className="mt-8 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">Börja från din situation</span>
                {SITUATION.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="inline-flex min-h-10 items-center rounded-full border border-kant-stark bg-papper px-4 text-sm font-semibold text-ink-1 hover:border-ink-1"
                  >
                    {s.text}
                  </Link>
                ))}
              </nav>
            </div>
          </Rum>

          {/* Yrkesmallar: snabblänkarna för "cv mall {yrke}". */}
          <Rum rum="cv" yta="panel">
            <div className="pub-wrap">
              <h2 className="pub-h2">CV-mallar för ditt yrke</h2>
              <p className="pub-ingress" style={{ marginTop: 16 }}>
                Alla våra mallar passar alla yrken, men rubrikerna, exemplet och råden skiljer sig. På varje yrkessida ser du ditt yrkes CV i
                mallarna, med rubriker som rekryterare i branschen känner igen, till exempel &quot;Klinisk erfarenhet&quot; eller &quot;Behörigheter
                och körkort&quot;. Klicka på ditt yrke för att se vad rekryteraren letar efter och hur du får fram det i mallen.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {yrkesmallar.map((y) => (
                  <Link
                    key={y.slug}
                    href={`/cv-mallar/${y.slug}`}
                    className="pub-kort block h-full hover:border-ink-1"
                    aria-label={`Se CV-mall för ${y.namn}`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ton-ink">{KATEGORI_LABEL[y.kategori]}</p>
                    <h3 className="pub-h4" style={{ marginTop: 4 }}>
                      {y.namn}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-ink-2">{y.intro}</p>
                    <p className="mt-3 flex items-center justify-between gap-2 text-[12px]">
                      <span className="font-semibold uppercase tracking-wide text-ink-3">{PAKETRADER.mallarGratisOchPaket}</span>
                      <span className="font-semibold text-ink-1 underline decoration-kant-stark underline-offset-4">Se mall</span>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </Rum>

          {/* Alla mallar: riktiga miniatyrer, var och en till provsidan. */}
          <Rum rum="cv" yta="mark" id="mall-galleri">
            <div className="pub-wrap">
              <h2 className="pub-h2">Alla våra CV-mallar</h2>
              <p className="pub-ingress" style={{ marginTop: 16 }}>
                Välj formen för din ansökan: en spalt, sidospalt, rubriker i marginalen eller en konstnärlig layout. Alla {MALL_ANTAL} mallar är
                testade mot rekryteringssystem och byggda för svenska arbetsgivare, och varje mall finns i fyra färger. {GRATIS_ANTAL} är gratis:{' '}
                {uppraknat(GRATIS_NAMN)}. Yrkessidorna hjälper dig med rubrikerna och innehållet för din bransch.
              </p>
              <p className="pub-brod" style={{ marginTop: 8 }}>Klicka på en mall så ser du den med ett färdigt CV, eller ladda upp ditt eget.</p>
              <div className="mt-8 grid max-w-[744px] grid-cols-3 gap-3 sm:grid-cols-4">
                {MALL_KATALOG.map((m) => (
                  <div key={m.id} id={`mall-${m.id}`} className="scroll-mt-24">
                    <Miniatyr mall={m} storlek="rutnat" href={`/cv-mallar/prova?mall=${encodeURIComponent(m.id)}`} />
                  </div>
                ))}
              </div>
            </div>
          </Rum>

          {/* Guiden, långformen. */}
          <Rum rum="cv" yta="panel">
            <div className="pub-wrap" style={{ maxWidth: 760 }}>
              <p className="pub-kick">Guide</p>
              <h2 className="pub-h2">Vad gör en bra CV-mall för svenska arbetsgivare?</h2>
              <p className="pub-ingress" style={{ marginTop: 16 }}>
                Det handlar inte bara om hur det ser ut. Här är fyra saker som avgör.
              </p>
              <div className="mt-10 grid gap-10">
                <GuideBlock eyebrow="ATS-säkerhet" title="Mallen måste passera rekryteringssystemet">
                  <p>
                    Innan en människa läser ditt CV passerar det ofta ett ATS, ett Applicant Tracking System. Det är mjukvara som indexerar
                    texten, sorterar in kandidater på sökord och rangordnar matchningar. ATS-system har problem med vissa designval:
                    clip-paths, absolutpositionerade textfält, ovanliga typsnitt, och kolumner där läsordningen blir fel.
                  </p>
                  <p>
                    Våra mallar använder vanlig flödeslayout, standardrubriker som &quot;Arbetslivserfarenhet&quot; och &quot;Utbildning&quot; i
                    grundläget, och typsnitt som finns i alla operativsystem. Varje mall har dessutom gått genom vår egen CV-läsare med korta och
                    långa CV och olika ordning på avsnitten innan den kom med i utbudet, också mallarna med sidospalt. Du får designkänslan utan
                    att riskera att rekryteringssystemet sorterar bort dig innan en människa ens ser ditt CV.
                  </p>
                </GuideBlock>
                <GuideBlock eyebrow="Branschmatchning" title="Olika yrken kräver olika upplägg">
                  <p>
                    En läkare, en barnskötare och en säljare har helt olika meriter att lyfta: legitimationer, pedagogiska metoder,
                    säljsiffror. En mall med samma rubriker för alla sätter dem i samma form, vilket sällan fungerar. Därför har varje mall tolv
                    rubrikuppsättningar att välja mellan, en per bransch: &quot;Klinisk erfarenhet&quot; i stället för &quot;Arbetslivserfarenhet&quot;
                    för vården, &quot;Pedagogisk erfarenhet&quot; för skolan, och &quot;Legitimation och behörigheter&quot; eller &quot;Behörigheter
                    och körkort&quot; som eget avsnitt där intygen avgör. Passar ingen av dem skriver du en egen rubrik.
                  </p>
                  <p>
                    Det handlar också om visuell kod. Vården och offentlig sektor förväntar sig dämpade färger och tydlig struktur.
                    Marknadsföring och kreativa yrken har utrymme för djärvare grepp. Välj en form som matchar branschen du söker dig till,
                    och en av mallens fyra färger som passar tonen: dämpad till vården, varmare till service och kreativa yrken.
                  </p>
                </GuideBlock>
                <GuideBlock eyebrow="Erfarenhetsnivå" title="Mallen ska passa hur långt du kommit i karriären">
                  <p>
                    Som student utan jobberfarenhet är fokus utbildning, projekt och praktik. Välj ordningen utbildning först och
                    rubrikuppsättningen Student, så får avsnitten plats i den ordning rekryteraren vill läsa dem. Som senior konsult med mer än
                    15 års erfarenhet behöver du i stället rymma mycket: en sidospalt som Kalksten eller Granit, eller Stål med två spalter, får
                    plats med fler uppdrag utan att sidan känns trång, och valet Få plats på en sida hjälper när du ligger strax över.
                  </p>
                  <p>
                    Mallarna i en spalt, som Linne, Björk och Koppar, fungerar bra i mitten av karriären. Antikva och Folio, i serif med formellt
                    huvud, signalerar tradition och passar ledningsgrupp eller styrelseroller där det väger tungt.
                  </p>
                </GuideBlock>
                <GuideBlock eyebrow="Mall eller exempel" title="Använd båda, de kompletterar varandra">
                  <p>
                    En CV-mall är designen: typsnitt, sektionsordning, färger och layout. Ett{' '}
                    <Link href="/cv-exempel" className="pub-lank">
                      CV-exempel
                    </Link>{' '}
                    är ett färdigt CV med någon annans innehåll som du kan låta dig inspireras av. När du skriver ditt eget, börja med
                    exempel-sidan för ditt yrke (för att få bra formuleringar) och välj sedan en mall för designen.
                  </p>
                  <p>
                    För varje yrkessida här länkar vi till motsvarande CV-exempel, så att du både kan se ett färdigt CV och välja den form som
                    passar bäst. Ladda upp ditt eget CV högst upp på sidan för att se hur det ser ut i alla mallar.
                  </p>
                </GuideBlock>
              </div>
            </div>
          </Rum>

          <Rum rum="cv" yta="mark" id="fragor">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <Faq rubrik="Vanliga frågor om CV-mallar" ingress="Allt du behöver veta innan du väljer." fragor={faqItems} />
            </div>
          </Rum>

          <Rum rum="cv" yta="panel" storlek="tat">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <div className="pub-kort text-center">
                <h2 className="pub-h3">Letar du efter ett färdigt CV-exempel i stället?</h2>
                <p className="pub-brod mx-auto" style={{ marginTop: 12 }}>
                  Vi har {CV_GALLERI.length} färdiga CV-exempel för specifika yrken. Använd dem som inspiration när du skriver ditt eget
                  innehåll.
                </p>
                <div className="pub-handling" style={{ justifyContent: 'center' }}>
                  <Link href="/cv-exempel" className="pub-knapp">
                    Se CV-exempel
                  </Link>
                </div>
              </div>
            </div>
          </Rum>
        </div>
      </ProvaProvider>
    </PubliktSida>
  )
}
