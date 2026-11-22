/**
 * /cv-mallar/[yrke] i publikt omgång 3: grundens skal och färger (CV:ts
 * petrol), med mallvisningen i hjälten som förut. Serverkomponent; den
 * gamla klientkomponenten med framer-motion och orange toning är borta.
 *
 * Texten är sidans egen, ordagrant och i samma ordning (SEO-beskedet,
 * sidorna har den hårda regeln): H1, alla H2 och H3, ingresserna, listorna,
 * frågorna och länkarna. Branschtermerna och frågorna står nu alla i
 * HTML:en från början (details), i stället för bara den första.
 */
import Link from 'next/link'
import { Sida, Hjalte, Sektion, SektionHuvud, Kort, Rutnat, Nr, Faq, O, Knapp, Bocklista } from '@/components/publikt/v3'
import type { Yrkesmall } from '../yrkesmall-data'
import MallVisningCv, { type ArtikelMall } from '@/components/artiklar/MallVisningCv'
import { MALL_KATALOG, mallBild } from '@/lib/cv/mallar/katalog'
import { ARTIKEL, DOK, KNAPP, UPPLADDNING } from '@/components/cv/Dokument/texter'
import ViktigtPunkter from './components/ViktigtPunkter'
import VarforVarMallPassar from './components/VarforVarMallPassar'
import ArbetsuppgifterList from './components/ArbetsuppgifterList'
import BranschtermerList from './components/BranschtermerList'
import StortExempelCTA from './components/StortExempelCTA'
import TypiskaArbetsgivare from './components/TypiskaArbetsgivare'
import Utbildningsvagar from './components/Utbildningsvagar'
import '../components/mallar-v3.css'

/**
 * Fem mallar för yrkets dokument (plan-mallar 3.2, yrkessidorna): yrkets
 * gratismall först, sedan katalogens ordning. Inga namn hårdkodade.
 */
function femFor(gratisId: string): ArtikelMall[] {
  const forst = MALL_KATALOG.find((m) => m.id === gratisId)
  const ovriga = MALL_KATALOG.filter((m) => m.id !== gratisId)
  return [...(forst ? [forst] : []), ...ovriga].slice(0, 5).map((m) => ({
    id: m.id,
    namn: m.namn,
    rad: ARTIKEL.mallrad(m.niva === 'gratis', m.word),
    bild: m.bild.liten,
    word: m.word,
  }))
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

interface YrkesmallContentProps {
  data: Yrkesmall
  relaterade: Yrkesmall[]
}

export default function YrkesmallContent({ data, relaterade }: YrkesmallContentProps) {
  const fragor = data.faqItems.filter((f) => f.q && f.a).map((f) => ({ q: f.q, a: f.a }))
  return (
    <Sida farg="cv">
      {/* Hjälten är dokumentet (skissen yta 2, granskningen B5): H1 och första
          ingresstycket som förut (SEO), sedan yrkets exempel-CV i
          gratismallen med titeln förifylld, uppladdningsraden och raden om
          premiummallarna. Samma mönster på alla yrkessidor. */}
      <Hjalte
        id="preview"
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'CV-mallar', href: '/cv-mallar' },
          { name: data.namn, href: `/cv-mallar/${data.slug}` },
        ]}
        brodsmulorSchema={false}
        etikett={`CV-mall för ${KATEGORI_LABEL[data.kategori]}`}
        h1={`CV-mall för ${data.namn}`}
        varde={data.heroIngress || data.intro}
        bild={
          <Kort className="cvy-visning">
            <MallVisningCv
              mallar={femFor(data.freeMallId)}
              yrke={data.slug}
              titelForval={data.namn}
              affisch={{ src: mallBild(data.freeMallId).stor, alt: `${data.freeMallNamn} CV-mall för ${data.namnBestamd} (gratis)` }}
              etiketter={{ namn: UPPLADDNING.namn, titel: UPPLADDNING.titel, fortsatt: KNAPP.fortsatt, svep: DOK.svep }}
              uppladdning={
                <div className="cvy-uppl">
                  <p>{ARTIKEL.uppladdning}</p>
                  <a href="/cv-mallar#ladda-upp" data-cta-klick="/cv-mallar#ladda-upp" className="cvm-mall-knapp">
                    {ARTIKEL.laddaUpp}
                  </a>
                </div>
              }
              efter={<p className="cvy-efter">{ARTIKEL.yrkesrad('yrket')}</p>}
            />
            <p className="cvy-lankar">
              <Link href={`/cv-exempel/${data.slug}`} className="p3-lank">
                Se ett färdigt CV-exempel för {data.namnBestamd}
              </Link>
              <Link href={`/personligt-brev-exempel/${data.slug}`} className="p3-lank">
                Personligt brev
              </Link>
            </p>
          </Kort>
        }
      >
        <p className="p3-liten">ATS-säkra · Uppdaterade 2026 · Svenska arbetsgivare</p>
      </Hjalte>

      {/* SEO Intro: 185-220 ord rik content under hero */}
      {data.seoIntro ? (
        <Sektion botten="papper">
          <div className="cvy-prosa">
            {data.seoIntro.split(/\n\n+/).map((stycke, i) => (
              <p key={i}>{stycke}</p>
            ))}
          </div>
        </Sektion>
      ) : null}

      {/* Viktigt att tänka på, annars varför just dessa mallar */}
      {data.viktigtAttTankaPa && data.viktigtAttTankaPa.length > 0 ? (
        <Sektion>
          <SektionHuvud
            etikett="Viktigt att tänka på"
            rubrik={`Så bygger du ett starkt ${data.namnBestamd}-CV`}
            varde="Sex punkter som rekryterare specifikt letar efter i din ansökan."
          />
          <ViktigtPunkter punkter={data.viktigtAttTankaPa} />
        </Sektion>
      ) : (
        <Sektion>
          <SektionHuvud etikett="Varför just dessa mallar" rubrik={`Mallarna ${data.freeMallNamn} och ${data.premiumMallNamn} för ${data.namnBestamd}`} />
          <Rutnat kolumner={2}>
            {data.varforDennaMall.map((reason, idx) => (
              <Kort key={idx} ton>
                <p>{reason}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>
      )}

      {/* Vanliga arbetsuppgifter */}
      {data.arbetsuppgifter && data.arbetsuppgifter.length > 0 ? (
        <Sektion botten="ton">
          <SektionHuvud
            etikett="Yrkesinnehåll"
            rubrik={`Vanliga arbetsuppgifter för ${data.namnBestamd}`}
            varde="Vad du faktiskt gör i rollen och vad rekryterare förväntar sig att du har erfarenhet av."
          />
          <ArbetsuppgifterList grupper={data.arbetsuppgifter} />
        </Sektion>
      ) : null}

      {/* Vad rekryterare letar efter */}
      <Sektion>
        <SektionHuvud
          etikett="Rekryterar-perspektiv"
          rubrik={`Vad rekryterare letar efter i ett ${data.namnBestamd}-CV`}
          varde={data.rekryterarTipsen.length > 3 ? 'Sex saker som avgör om du går vidare till intervju.' : 'Tre saker som avgör om du går vidare till intervju.'}
        />
        <ol className="cvy-tips">
          {data.rekryterarTipsen.map((tip, idx) => (
            <li key={idx}>
              <Kort>
                <div className="cvy-tips-huvud">
                  <Nr>{idx + 1}</Nr>
                  <h3 className="p3-h3">{tip.rubrik}</h3>
                </div>
                <p>{tip.text}</p>
              </Kort>
            </li>
          ))}
        </ol>
      </Sektion>

      {/* Varför vår mall passar yrket */}
      {data.varforVarMallPassar && data.varforVarMallPassar.length > 0 ? (
        <Sektion botten="papper">
          <SektionHuvud
            etikett="Vår design"
            rubrik={`Så har vi byggt mallarna för ${data.namnBestamd}`}
            varde={`Det här är våra designval och varför mallen ${data.freeMallNamn} och ${data.premiumMallNamn}, som ingår i Premium, fungerar för rollen.`}
          />
          <VarforVarMallPassar punkter={data.varforVarMallPassar} yrkesNamn={data.namn} />
        </Sektion>
      ) : null}

      {/* Korten till CV-exemplet och brevexemplet */}
      <Sektion luft="tat">
        <Rutnat kolumner={2}>
          <StortExempelCTA variant="cv-exempel" yrkesNamn={data.namn} namnBestamd={data.namnBestamd} slug={data.slug} />
          <StortExempelCTA variant="personligt-brev" yrkesNamn={data.namn} namnBestamd={data.namnBestamd} slug={data.slug} />
        </Rutnat>
      </Sektion>

      {/* Personlig profil, exempel och tips */}
      <Sektion botten="ton">
        <SektionHuvud
          etikett="Personlig profil"
          rubrik={`Personlig profil för ${data.namnBestamd}`}
          varde="Sammanfattningen längst upp på CV:t är det första rekryteraren läser. Här är ett konkret exempel och våra bästa tips."
        />
        <Kort className="cvy-profil">
          <p className="p3-ey">Exempel</p>
          <blockquote>{data.profilExempel}</blockquote>
          <p className="p3-ey">Så skriver du</p>
          <p>{data.profilTips}</p>
        </Kort>
      </Sektion>

      {/* Kompetenser */}
      <Sektion>
        <SektionHuvud
          etikett="Kompetenser"
          rubrik={`Vilka kompetenser ska finnas på ett ${data.namnBestamd}-CV`}
          varde="Vi har samlat de tekniska och personliga kompetenser som rekryterare värderar mest för rollen."
        />
        <Rutnat kolumner={2}>
          <Kort>
            <h3 className="p3-h3">Tekniska kompetenser</h3>
            <ul className="cvy-punkter">
              {data.kompetenser.tekniska.map((k, idx) => (
                <li key={idx}>{k}</li>
              ))}
            </ul>
          </Kort>
          <Kort>
            <h3 className="p3-h3">Personliga egenskaper</h3>
            <ul className="cvy-punkter">
              {data.kompetenser.personliga.map((k, idx) => (
                <li key={idx}>{k}</li>
              ))}
            </ul>
          </Kort>
        </Rutnat>
      </Sektion>

      {/* Branschterminologi */}
      {data.branschtermer && data.branschtermer.length > 0 ? (
        <Sektion botten="papper">
          <SektionHuvud
            etikett="Branschterminologi"
            rubrik={`Termer, system och lagar för ${data.namnBestamd}`}
            varde="De begrepp rekryterare och chefer använder i jobbannonser. Klicka för att expandera varje grupp."
          />
          <BranschtermerList grupper={data.branschtermer} />
        </Sektion>
      ) : null}

      {/* Tips per sektion och ATS-säkerheten */}
      <Sektion>
        <SektionHuvud
          etikett="Skriv-guide"
          rubrik="Vad ska stå i varje sektion av CV:t"
          varde={`Vi går igenom de viktigaste sektionerna i ett ${data.namnBestamd}-CV och vad som ska finnas med i varje.`}
        />
        <ul className="cvy-sektioner">
          {data.sektionTips.map((tip, idx) => (
            <li key={idx} className="p3-kort">
              <span className="p3-ey">{tip.sektion}</span>
              <p>{tip.tips}</p>
            </li>
          ))}
        </ul>
        <Kort ton className="cvy-ats">
          <p className="p3-ey">ATS-säkerhet</p>
          <h3 className="p3-h3">Är mallen ATS-säker för {data.namnBestamd}?</h3>
          <p>{data.atsInfo}</p>
        </Kort>
      </Sektion>

      {/* Checklista */}
      <Sektion botten="ton">
        <SektionHuvud etikett="Checklista" rubrik={`Det här ska finnas med i ditt ${data.namnBestamd}-CV`} />
        <Kort className="cvy-check">
          <Bocklista paPapper punkter={data.checklista} />
        </Kort>
      </Sektion>

      {/* Typiska arbetsgivare */}
      {data.typiskaArbetsgivare && data.typiskaArbetsgivare.length > 0 ? (
        <Sektion>
          <SektionHuvud
            etikett="Var jobben finns"
            rubrik={`Typiska arbetsgivare för ${data.namnBestamd}`}
            varde="Var de flesta tjänsterna finns och hur arbetsmarknaden ser ut."
          />
          <TypiskaArbetsgivare grupper={data.typiskaArbetsgivare} />
        </Sektion>
      ) : null}

      {/* Utbildningsvägar */}
      {data.utbildningsvagar && data.utbildningsvagar.length > 0 ? (
        <Sektion botten="papper">
          <SektionHuvud etikett="Utbildning" rubrik={`Hur du blir ${data.namnBestamd}`} varde="Vanliga vägar in i yrket och vad som krävs." />
          <Utbildningsvagar vagar={data.utbildningsvagar} />
        </Sektion>
      ) : null}

      {/* Relaterade yrkesmallar */}
      {relaterade.length > 0 ? (
        <Sektion>
          <SektionHuvud rubrik="Andra yrkesmallar du kanske gillar" />
          <Rutnat kolumner={3}>
            {relaterade.map((y) => (
              <Link key={y.slug} href={`/cv-mallar/${y.slug}`} className="cvm-yrke cvy-relaterad" aria-label={`Se CV-mall för ${y.namn}`}>
                <span className="p3-ey">{KATEGORI_LABEL[y.kategori]}</span>
                <h3 className="p3-h3">{y.namn}</h3>
                <p>{y.intro}</p>
                <span className="cvm-yrke-fot">
                  <b>Se CV-mall</b>
                </span>
              </Link>
            ))}
          </Rutnat>
        </Sektion>
      ) : null}

      {/* Frågorna */}
      <Sektion botten="ton">
        <SektionHuvud rubrik={`Vanliga frågor om ${data.namnBestamd}-CV`} />
        {fragor.length ? <Faq etikett="Vanliga frågor" rubrik={`CV för ${data.namn.toLowerCase()}`} fragor={fragor} /> : null}
      </Sektion>

      {/* Slutet */}
      <Sektion luft="tat">
        <O
          farg="cv"
          rubrikNiva="h2"
          rubrik={`Klar att skapa ditt ${data.namnBestamd}-CV?`}
          varde="Använd någon av våra mallar direkt i appen. Gratis att börja, ingen kortuppgift krävs."
          knappar={
            <Knapp href="/cv-mallar" pil>
              Skapa CV nu
            </Knapp>
          }
        />
      </Sektion>
    </Sida>
  )
}
