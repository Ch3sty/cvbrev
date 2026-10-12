/**
 * Guiden om mallar under korten på /cv-exempel och /personligt-brev-exempel
 * (publikt v2 del B 3.4, "står kvar i textmallen"). Serverkomponent på
 * panel. Rubrikerna och texten är desamma som före; antalet exempel läses ur
 * galleriet i stället för att stå hårdkodat.
 *
 * Täcker sökningar som "cv mall", "cv mall gratis", "cv mall word" och
 * "personligt brev mall".
 */

import Link from 'next/link'
import Rum from '@/components/publikt/Rum'

export default function MallarGuideSection({ type, antal }: { type: 'cv' | 'brev'; antal: number }) {
  const isCV = type === 'cv'
  const noun = isCV ? 'CV' : 'personligt brev'
  const nounMall = isCV ? 'CV-mall' : 'mall för personligt brev'
  const nounMallar = isCV ? 'CV-mallar' : 'mallar för personligt brev'
  const galleriPath = isCV ? '/cv-exempel' : '/personligt-brev-exempel'
  const verktygPath = isCV ? '/verktyg/cv-mallar' : '/verktyg/personligt-brev'
  const verktygLabel = isCV ? 'vårt CV-verktyg' : 'vårt brevverktyg'

  return (
    <Rum yta="panel">
      <div className="pub-wrap ib-hubb-guide">
        <p className="pub-kick">Guide till {nounMallar}</p>
        <h2 className="pub-h2">Allt du behöver veta om {nounMallar}</h2>
        <p>Vad är skillnaden mellan en mall och ett exempel? Hur väljer du rätt? Är de gratis? Här är svaren.</p>

        <article>
          <h3>
            {isCV
              ? 'Vad är en CV-mall, och vad är skillnaden mot ett exempel?'
              : 'Vad är en mall för personligt brev, och vad är skillnaden mot ett exempel?'}
          </h3>
          <p>
            En {nounMall} är en färdig struktur som du fyller med dina egna uppgifter. Den bestämmer ordningen på sektioner, hur
            rubriker ser ut och vilka delar som ska finnas med. Ett exempel är en ifylld {nounMall}{' '}
            {isCV ? 'för ett specifikt yrke' : 'för en specifik roll'}, där du ser hur en riktig person formulerat sig.
          </p>
          <p>
            I praktiken används orden ofta synonymt. Våra {antal} yrkesexempel funkar som mallar du kan kopiera strukturen från och
            anpassa till din situation. När någon säger &quot;jag behöver en {nounMall}&quot; menar de oftast just det här: en konkret
            förlaga att utgå från.
          </p>
        </article>

        <article>
          <h3>Hur väljer du rätt {nounMall} för ditt yrke?</h3>
          <p>
            Börja med din exakta yrkestitel. Är du undersköterska söker du på &quot;undersköterska&quot;. Hittar du ingen exakt träff
            väljer du ett närliggande yrke i samma bransch. En distriktssköterska kan hämta inspiration från sjuksköterska-mallen, en
            account manager från säljare-mallen.
          </p>
          <p>
            Det som faktiskt skiljer en bra {nounMall} från en dålig är hur den hanterar tre saker:{' '}
            {isCV
              ? 'sammanfattningen längst upp, hur erfarenheter är formulerade, och hur kompetenser presenteras.'
              : 'inledningen, kopplingen till annonsens krav, och avslutningen.'}{' '}
            Två yrken med liknande arbetsuppgifter har ofta liknande behov, även om titlarna skiljer sig.
          </p>
          <p>
            Du kan också filtrera på <Link href={`${galleriPath}/kategori/vard`}>bransch</Link> för att se alla mallar inom vård,
            tech, ekonomi, service, utbildning eller offentlig sektor.
          </p>
        </article>

        {isCV ? (
          <article>
            <h3>Vad gör en CV-mall ATS-optimerad?</h3>
            <p>
              ATS står för Applicant Tracking System, programmen som de flesta större arbetsgivare använder för att sortera
              ansökningar. En ATS-optimerad CV-mall är byggd så att programmet kan läsa innehållet korrekt och matcha det mot jobbets
              krav.
            </p>
            <p>
              Konkret betyder det: tydliga rubriker som &quot;Arbetslivserfarenhet&quot; och &quot;Utbildning&quot;, inga komplicerade
              tabeller eller textboxar, ett standardtypsnitt som Garamond eller Calibri, och nyckelorden från jobbannonsen i löpande
              text. Designade CV-mallar med kolumner och grafiska element kan se snygga ut för en människa, men ATS-system läser dem
              ofta som gröt.
            </p>
            <p>
              Alla våra {nounMallar} är skrivna med detta i åtanke. De ser professionella ut, men strukturen är byggd så att både
              datorn och rekryteraren hittar rätt.
            </p>
          </article>
        ) : (
          <article>
            <h3>Vad gör en mall för personligt brev bra?</h3>
            <p>
              En bra mall är inte ett färdigskrivet brev du kopierar. Det är en struktur som visar dig var olika delar ska gå:
              inledning som fångar intresset, en huvuddel som kopplar din erfarenhet till annonsens krav, och en avslutning som gör
              nästa steg tydligt.
            </p>
            <p>
              Det som skiljer våra {nounMallar} från standardmallarna du hittar i Word är att de är yrkesspecifika. En mall för ett
              personligt brev till sjuksköterska är skriven med vårdens ton och nyckelord, inte med generiska fraser som passar lika
              bra till en projektledarroll.
            </p>
            <p>
              Använd mallen som ram. Byt ut detaljerna mot dina egna erfarenheter och dina egna siffror. Ett brev som ser ut som en
              kopia av en mall sticker aldrig ut.
            </p>
          </article>
        )}

        <article>
          <h3>
            Är {nounMallar} gratis? Kan jag ladda ner dem?
          </h3>
          <p>
            Alla våra {nounMallar} är helt gratis att använda. Du behöver inget konto för att läsa dem och inspireras. Vi tar inte
            betalt för innehållet.
          </p>
          <p>
            För nedladdning gör du så här: bygg ditt eget {noun} med <Link href={verktygPath}>{verktygLabel}</Link> och ladda ner det
            som färdig PDF. Det är gratis att börja och du kan kopiera strukturen från vilken som helst av våra mallar i galleriet.
          </p>
          <p>
            Om du hellre vill jobba i Word direkt kan du kopiera texten från en mall, klistra in den i ett tomt dokument och anpassa
            den. Använd Garamond eller Calibri 11-12 punkter och spara som PDF innan du skickar.
          </p>
        </article>

        <div className="ib-guide-slut">
          <p>Redo att börja? Plocka en {nounMall} som passar ditt yrke.</p>
          <Link className="pub-lank" href={`${galleriPath}#yrken`}>
            Bläddra alla {nounMallar}
          </Link>
        </div>
      </div>
    </Rum>
  )
}
