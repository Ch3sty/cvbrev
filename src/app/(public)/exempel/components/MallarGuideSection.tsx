'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Search,
  Download,
  Sparkles,
} from 'lucide-react'

interface MallarGuideSectionProps {
  type: 'cv' | 'brev'
}

/**
 * Long-form SEO-section som visas under galleri-griden pa
 * /cv-exempel och /personligt-brev-exempel.
 *
 * Tacker queries:
 *  - "cv mall", "cv mall gratis", "gratis cv mall"
 *  - "cv mall ladda ner", "cv mall word"
 *  - "personligt brev mall", "personligt brev mall gratis"
 *
 * Innehallet ar genuint hjalpsamt, inte keyword-stuffing.
 */
export default function MallarGuideSection({ type }: MallarGuideSectionProps) {
  const isCV = type === 'cv'
  const noun = isCV ? 'CV' : 'personligt brev'
  const nounMall = isCV ? 'CV-mall' : 'mall för personligt brev'
  const nounMallar = isCV ? 'CV-mallar' : 'mallar för personligt brev'
  const galleriPath = isCV ? '/cv-exempel' : '/personligt-brev-exempel'
  const verktygPath = isCV
    ? '/verktyg/cv-mallar'
    : '/verktyg/personligt-brev'
  const verktygLabel = isCV ? 'vårt CV-verktyg' : 'vårt brevverktyg'

  return (
    <section className="relative py-14 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow + intro */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            Guide till {nounMallar}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-3">
            Allt du behöver veta om {nounMallar}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Vad är skillnaden mellan en mall och ett exempel? Hur väljer du
            rätt? Är de gratis? Här är svaren.
          </p>
        </div>

        {/* Sektioner */}
        <div className="space-y-12 sm:space-y-14">
          <GuideBlock
            icon={<Layers className="w-5 h-5" strokeWidth={2.25} />}
            title={
              isCV
                ? 'Vad är en CV-mall, och vad är skillnaden mot ett exempel?'
                : 'Vad är en mall för personligt brev, och vad är skillnaden mot ett exempel?'
            }
          >
            <p>
              En {nounMall} är en färdig struktur som du fyller med dina egna
              uppgifter. Den bestämmer ordningen på sektioner, hur rubriker
              ser ut och vilka delar som ska finnas med. Ett exempel är en
              ifylld {nounMall} {isCV ? 'för ett specifikt yrke' : 'för en specifik roll'}, där du
              ser hur en riktig person formulerat sig.
            </p>
            <p>
              I praktiken används orden ofta synonymt. Våra {isCV ? '74' : '76'}{' '}
              yrkesexempel funkar som mallar du kan kopiera strukturen från
              och anpassa till din situation. När någon säger "jag behöver en
              {' '}
              {nounMall}
              " menar de oftast just det här: en konkret förlaga att utgå
              från.
            </p>
          </GuideBlock>

          <GuideBlock
            icon={<Search className="w-5 h-5" strokeWidth={2.25} />}
            title={`Hur väljer du rätt ${nounMall} för ditt yrke?`}
          >
            <p>
              Börja med din exakta yrkestitel. Är du undersköterska söker du
              på "undersköterska". Hittar du ingen exakt träff väljer du ett
              närliggande yrke i samma bransch. En distriktssköterska kan
              hämta inspiration från sjuksköterska-mallen, en account manager
              från säljare-mallen.
            </p>
            <p>
              Det som faktiskt skiljer en bra {nounMall} från en dålig är hur
              den hanterar tre saker:{' '}
              {isCV
                ? 'sammanfattningen längst upp, hur erfarenheter är formulerade, och hur kompetenser presenteras.'
                : 'inledningen, kopplingen till annonsens krav, och avslutningen.'}{' '}
              Två yrken med liknande arbetsuppgifter har ofta liknande
              behov, även om titlarna skiljer sig.
            </p>
            <p>
              Du kan också filtrera på{' '}
              <Link
                href={`${galleriPath}/kategori/vard`}
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                bransch
              </Link>{' '}
              för att se alla mallar inom vård, tech, ekonomi, service,
              utbildning eller offentlig sektor.
            </p>
          </GuideBlock>

          {isCV && (
            <GuideBlock
              icon={<CheckCircle2 className="w-5 h-5" strokeWidth={2.25} />}
              title="Vad gör en CV-mall ATS-optimerad?"
            >
              <p>
                ATS står för Applicant Tracking System, programmen som de
                flesta större arbetsgivare använder för att sortera
                ansökningar. En ATS-optimerad CV-mall är byggd så att
                programmet kan läsa innehållet korrekt och matcha det mot
                jobbets krav.
              </p>
              <p>
                Konkret betyder det: tydliga rubriker som "Arbetslivserfarenhet"
                och "Utbildning", inga komplicerade tabeller eller
                textboxar, ett standardtypsnitt som Garamond eller Calibri,
                och nyckelorden från jobbannonsen i löpande text. Designade
                CV-mallar med kolumner och grafiska element kan se snygga
                ut för en människa, men ATS-system läser dem ofta som
                gröt.
              </p>
              <p>
                Alla våra {nounMallar} är skrivna med detta i åtanke. De
                ser professionella ut, men strukturen är byggd så att
                både datorn och rekryteraren hittar rätt.
              </p>
            </GuideBlock>
          )}

          {!isCV && (
            <GuideBlock
              icon={<CheckCircle2 className="w-5 h-5" strokeWidth={2.25} />}
              title="Vad gör en mall för personligt brev bra?"
            >
              <p>
                En bra mall är inte ett färdigskrivet brev du kopierar.
                Det är en struktur som visar dig var olika delar ska gå:
                inledning som fångar intresset, en huvuddel som kopplar
                din erfarenhet till annonsens krav, och en avslutning som
                gör nästa steg tydligt.
              </p>
              <p>
                Det som skiljer våra {nounMallar} från standardmallarna du
                hittar i Word är att de är yrkesspecifika. En mall för
                ett personligt brev till sjuksköterska är skriven med
                vårdens ton och nyckelord, inte med generiska fraser
                som passar lika bra till en projektledarroll.
              </p>
              <p>
                Använd mallen som ram. Byt ut detaljerna mot dina egna
                erfarenheter och dina egna siffror. Ett brev som ser ut
                som en kopia av en mall sticker aldrig ut.
              </p>
            </GuideBlock>
          )}

          <GuideBlock
            icon={<Download className="w-5 h-5" strokeWidth={2.25} />}
            title={`Är ${nounMallar} gratis? Kan jag ladda ner dem?`}
          >
            <p>
              Alla våra {nounMallar} är helt gratis att använda. Du
              behöver inget konto för att läsa dem och inspireras. Vi
              tar inte betalt för innehållet.
            </p>
            <p>
              För nedladdning gör du så här: bygg ditt eget {noun} med{' '}
              <Link
                href={verktygPath}
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                {verktygLabel}
              </Link>
              {' '}
              och ladda ner det som färdig PDF. Det är gratis att börja
              och du kan kopiera strukturen från vilken som helst av
              våra mallar i galleriet.
            </p>
            <p>
              Om du hellre vill jobba i Word direkt kan du kopiera texten
              från en mall, klistra in den i ett tomt dokument och anpassa
              den. Använd Garamond eller Calibri 11-12 punkter och spara
              som PDF innan du skickar.
            </p>
          </GuideBlock>
        </div>

        {/* CTA in i guide-sektionen, lankar till verktyg + galleri */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-orange-50/50 border border-orange-100 text-center"
        >
          <p className="text-base sm:text-lg text-slate-700 font-semibold mb-4">
            Redo att börja? Plocka en {nounMall} som passar ditt yrke.
          </p>
          <Link
            href={`${galleriPath}#yrken`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-700 font-bold text-sm sm:text-base border-2 border-orange-200 hover:border-orange-300 transition-colors min-h-[48px]"
          >
            Bläddra alla {nounMallar}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  GuideBlock: enskild SEO-sektion med ikon + rubrik + body                  */
/* -------------------------------------------------------------------------- */

function GuideBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.3)',
          }}
        >
          {icon}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight pt-1">
          {title}
        </h3>
      </div>
      <div className="space-y-3 text-base text-slate-700 leading-relaxed pl-12">
        {children}
      </div>
    </motion.article>
  )
}
