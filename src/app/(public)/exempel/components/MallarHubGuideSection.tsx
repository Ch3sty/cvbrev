'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Layers,
  GitCompare,
  Search,
  Download,
  FileType,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

/**
 * Long-form SEO-section som visas pa /exempel-hubsidan.
 *
 * Tacker queries som inte ar specifikt CV eller brev:
 *  - "cv och personligt brev mall", "mall jobbansokan"
 *  - "skillnad cv personligt brev"
 *  - "gratis ansokan mall"
 *  - "hur valjer man cv mall"
 *  - format-queries som "cv mall word", "cv mall pdf"
 *  - ATS-relaterade queries
 *
 * Skiljer sig fran MallarGuideSection (som ar CV- eller brev-specifik)
 * genom att tacka BADE och ge bredd-perspektiv.
 */
export default function MallarHubGuideSection() {
  return (
    <section className="relative py-14 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow + intro */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            Guide till mallarna
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-3">
            Allt du behöver veta om CV-mallar och brev-mallar
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Vad är skillnaden? När behöver du båda? Hur väljer du rätt? Här
            är svaren på det folk faktiskt undrar.
          </p>
        </div>

        {/* Sektioner */}
        <div className="space-y-12 sm:space-y-14">
          <GuideBlock
            icon={<GitCompare className="w-5 h-5" strokeWidth={2.25} />}
            title="Vad är skillnaden mellan en CV-mall och en mall för personligt brev?"
          >
            <p>
              CV-mallen är en struktur för fakta. Den listar din erfarenhet,
              utbildning och kompetens på ett sätt som är lätt att skanna.
              Innehållet är konkret och punktlistor är vanliga. Tonen är
              neutral och rakt på sak.
            </p>
            <p>
              Mallen för personligt brev är en struktur för argumentation.
              Den hjälper dig förklara varför just du passar för just det
              här jobbet. Den är skriven i löpande prosa, inte punktlistor,
              och har en tydlig riktning: inledning som fångar intresse,
              huvuddel som argumenterar, avslutning som rör frågan framåt.
            </p>
            <p>
              I praktiken kompletterar de varandra. CV:t ger fakta,
              brevet ger sammanhang. Många rekryterare läser brevet först
              för att förstå motivationen, sen CV:t för att verifiera
              att kandidaten faktiskt kan det den säger.
            </p>
          </GuideBlock>

          <GuideBlock
            icon={<Layers className="w-5 h-5" strokeWidth={2.25} />}
            title="När behöver du både CV-mall och brev-mall?"
          >
            <p>
              Nästan alltid. De flesta jobbansökningar i Sverige förväntar
              sig båda. Vissa annonser ber bara om CV, men då skadar det
              sällan att lägga till ett kort personligt brev ändå om
              annonsen inte uttryckligen avråder.
            </p>
            <p>
              Två situationer där du kan klara dig med bara CV: när du
              söker via en headhunter som specifikt frågat efter just
              ditt CV, eller när du söker en mycket teknisk roll där
              företaget har sagt att de bara vill se CV och kodprov.
              I alla andra fall: båda.
            </p>
            <p>
              Det omvända, bara brev utan CV, händer aldrig. CV:t är
              alltid grunden. Brevet är det som lyfter.
            </p>
          </GuideBlock>

          <GuideBlock
            icon={<Search className="w-5 h-5" strokeWidth={2.25} />}
            title="Hur väljer du rätt mallar för ditt yrke?"
          >
            <p>
              Sök på din exakta yrkestitel i något av våra två gallerier.
              Hittar du inte din titel: välj ett närliggande yrke i samma
              bransch. En distriktssköterska kan utgå från sjuksköterska-
              mallen, en account manager från säljare-mallen.
            </p>
            <p>
              Det som faktiskt skiljer en bra mall från en dålig är hur
              den hanterar yrkesspecifika detaljer. En lärarmall lyfter
              ämneskompetens, behörigheter och pedagogisk approach. En
              säljarmall lyfter resultat, säljmål och kundrelationer.
              Generiska mallar utan yrkesperspektiv ger sällan starka
              ansökningar.
            </p>
            <p>
              Du kan också browsa direkt på bransch:{' '}
              <Link
                href="/cv-exempel/kategori/vard"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                vård
              </Link>
              ,{' '}
              <Link
                href="/cv-exempel/kategori/tech"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                tech
              </Link>
              ,{' '}
              <Link
                href="/cv-exempel/kategori/ekonomi"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                ekonomi
              </Link>
              ,{' '}
              <Link
                href="/cv-exempel/kategori/service"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                service
              </Link>
              ,{' '}
              <Link
                href="/cv-exempel/kategori/utbildning"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                utbildning
              </Link>
              {' '}eller{' '}
              <Link
                href="/cv-exempel/kategori/offentlig-sektor"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                offentlig sektor
              </Link>
              . Samma kategorier finns för{' '}
              <Link
                href="/personligt-brev-exempel"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                brev-mallar
              </Link>
              .
            </p>
          </GuideBlock>

          <GuideBlock
            icon={<ShieldCheck className="w-5 h-5" strokeWidth={2.25} />}
            title="Vad är ATS, och varför spelar det roll för mallarna?"
          >
            <p>
              ATS står för Applicant Tracking System. Det är de program de
              flesta större arbetsgivare använder för att sortera ansökningar
              innan en människa ser dem. När du skickar en ansökan till
              ett bolag med fler än hundra anställda är det ofta ATS som
              läser den först.
            </p>
            <p>
              Konsekvensen: din CV-mall och brev-mall måste vara läsbara
              för datorn, inte bara för människan. ATS-vänliga mallar har
              tydliga rubriker som "Arbetslivserfarenhet" och "Utbildning",
              en kolumn istället för flera, standardtypsnitt som Garamond
              eller Calibri, och ingen text inbäddad i grafik eller tabeller.
            </p>
            <p>
              De vackra Canva-mallarna med två kolumner och färgade
              sidopaneler ser snygga ut för en människa. För ATS-systemet
              ser de ut som obegriplig sopa, och din ansökan kanske aldrig
              ens når rekryteraren. Alla våra mallar är byggda för att
              klara båda läsningarna.
            </p>
          </GuideBlock>

          <GuideBlock
            icon={<FileType className="w-5 h-5" strokeWidth={2.25} />}
            title="Word, PDF eller online-byggare?"
          >
            <p>
              Praktiskt: PDF när du skickar. ATS-system 2026 hanterar PDF
              utmärkt så länge texten är riktig text och inte en bild av
              text. Det är formatet du ska sikta mot.
            </p>
            <p>
              <strong>Word</strong> fungerar fint som arbetsverktyg. Skriv
              din mall i Word, anpassa innehållet, spara sen som PDF
              innan du skickar. Word-filer kan se trasiga ut hos
              mottagaren beroende på deras Word-version, så skicka aldrig
              filen i .docx-format.
            </p>
            <p>
              <strong>Online-byggare</strong> är snabbast vägen från
              inget till färdig PDF. Du svarar på frågor, programmet
              skapar en mall automatiskt baserat på dina svar och du
              laddar ner direkt. Vårt{' '}
              <Link
                href="/verktyg/skapa-cv"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                CV-verktyg
              </Link>
              {' '}och{' '}
              <Link
                href="/verktyg/personligt-brev"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                brevverktyg
              </Link>
              {' '}fungerar så.
            </p>
            <p>
              Filnamn när du skickar: alltid{' '}
              <code className="text-sm bg-orange-50 px-1.5 py-0.5 rounded text-orange-700 font-mono">
                CV - Ditt Namn - Företag.pdf
              </code>
              {' '}och{' '}
              <code className="text-sm bg-orange-50 px-1.5 py-0.5 rounded text-orange-700 font-mono">
                Personligt brev - Ditt Namn - Företag.pdf
              </code>
              . Aldrig{' '}
              <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                dokument1.pdf
              </code>
              .
            </p>
          </GuideBlock>

          <GuideBlock
            icon={<Download className="w-5 h-5" strokeWidth={2.25} />}
            title="Är alla mallar verkligen gratis?"
          >
            <p>
              Ja. Alla 151 mallar i biblioteket är gratis att läsa och
              använda. Du behöver inget konto. Det finns inga
              vattenstämplar, inga premium-versioner, inga dolda avgifter.
              Vi tar inte betalt för innehållet.
            </p>
            <p>
              Det vi tar betalt för är de avancerade verktygen som
              genererar anpassade ansökningar baserat på ditt CV och en
              specifik jobbannons. Men du kan komma långt utan att betala
              en krona, bara genom att kopiera strukturen från en mall
              som ligger nära ditt yrke och fylla i den själv.
            </p>
            <p>
              Vill du djupdyka i vad som funkar med mallar har vi separata
              guider:{' '}
              <Link
                href="/artiklar/cv-mall-gratis-guide"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                CV-mallar 2026
              </Link>
              {' '}och{' '}
              <Link
                href="/artiklar/personligt-brev-mall-gratis"
                className="text-orange-700 font-bold hover:text-orange-800 underline-offset-2 hover:underline"
              >
                mallar för personligt brev
              </Link>
              .
            </p>
          </GuideBlock>
        </div>

        {/* CTA in i guide-sektionen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-orange-50/50 border border-orange-100 text-center"
        >
          <p className="text-base sm:text-lg text-slate-700 font-semibold mb-4">
            Redo att börja? Plocka en mall som passar ditt yrke.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cv-exempel"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-700 font-bold text-sm sm:text-base border-2 border-orange-200 hover:border-orange-300 transition-colors min-h-[48px]"
            >
              Bläddra CV-mallar
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <Link
              href="/personligt-brev-exempel"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-700 font-bold text-sm sm:text-base border-2 border-orange-200 hover:border-orange-300 transition-colors min-h-[48px]"
            >
              Bläddra brev-mallar
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
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
