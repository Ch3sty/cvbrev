/**
 * Kalibrering av intervjuprovets bedömning mot tio riktiga svar
 * (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 7).
 *
 * Två bra, fyra medel, två dåliga, ett irrelevant och ett för kort. Skriver
 * nivå, mening, works, missing och omskrivningens längd per svar, så att det
 * syns om skalan skiljer bra från dåligt.
 *
 *   npx tsx --conditions=react-server scripts/qa-intervjuprov-bedomning.ts [--json ut.json]
 */
import fs from 'node:fs'
import { laddaEnv } from './_env'

laddaEnv()

type Fall = {
  id: string
  fraga: 'styrkor' | 'star'
  forvantat: string
  svar: string
}

const FALL: Fall[] = [
  {
    id: 'bra-1',
    fraga: 'styrkor',
    forvantat: '4 till 5',
    svar:
      'En styrka jag har är att jag får ordning på kaos. När jag började som lagerplanerare på Dagab i Jönköping låg plockfelen på runt två procent. Jag gick igenom ett halvårs avvikelser, såg att hälften kom från två hyllsektioner med liknande artikelnummer och ritade om platserna. Efter tre månader var vi nere på 0,6 procent. Min svaghet är att jag har svårt att släppa detaljer när jag delegerar. Jag märkte det när en kollega tog över inventeringen och jag kontrollerade allt hon gjorde. Nu bestämmer vi i förväg vilka två saker jag följer upp, och resten släpper jag. Det har gjort att hon tar mer eget ansvar, och jag har fått tid till planeringen.',
  },
  {
    id: 'bra-2',
    fraga: 'star',
    forvantat: '4 till 5',
    svar:
      'På min förra arbetsplats, en vårdcentral i Umeå, hade telefonkön varit ett problem i över ett år. Patienter fick vänta i 40 minuter och alla klagade, men ingen hade ansvaret. Jag jobbade i receptionen och bestämde mig för att ta tag i det. Jag förde statistik i två veckor och såg att 30 procent av samtalen gällde receptförnyelser som kunde skötas digitalt. Jag tog fram en kort instruktion, fick verksamhetschefen att godkänna ett nytt val i telefonmenyn och visade kollegorna hur det fungerade. Efter två månader hade väntetiden gått ner till 15 minuter och antalet klagomål halverats. Jag lärde mig att det lönar sig att mäta innan man föreslår något.',
  },
  {
    id: 'medel-1',
    fraga: 'styrkor',
    forvantat: '3',
    svar:
      'En av mina styrkor är att jag är strukturerad. På mitt förra jobb hade jag ansvar för tre projekt samtidigt och ingen deadline sprack. Min svaghet är att jag har svårt att delegera, jag vill gärna göra saker själv för att veta att det blir rätt.',
  },
  {
    id: 'medel-2',
    fraga: 'star',
    forvantat: '3',
    svar:
      'På mitt förra jobb på ett lager hade vi under flera veckor problem med att plocklistorna kom i fel ordning, så att vi gick fram och tillbaka i onödan. Ingen ägde frågan. Jag tog fram statistik på hur lång tid en plockrunda tog och föreslog för lagerchefen att vi skulle sortera listorna efter gång i stället för efter ordernummer. Han tyckte det var en bra idé och vi började göra så.',
  },
  {
    id: 'medel-3',
    fraga: 'styrkor',
    forvantat: '2 till 3',
    svar:
      'Jag skulle säga att jag är väldigt social och bra på att samarbeta, jag har jobbat i butik i fyra år och kommer bra överens med alla kollegor och kunder. Jag är också flexibel och ställer upp när någon är sjuk. En svaghet är att jag kan bli stressad när det är mycket, men jag försöker tänka på att ta en sak i taget och göra listor.',
  },
  {
    id: 'medel-4',
    fraga: 'star',
    forvantat: '3',
    svar:
      'Vi hade ett problem på kontoret med att mötesrummen alltid var dubbelbokade. Det var ingen som tog tag i det så vi pratade om det på ett möte och bestämde att vi skulle göra ett nytt bokningssystem i Outlook. Vi satte upp det tillsammans och skickade ut information till alla. Efter det blev det mycket bättre och folk slutade klaga på att rummen var upptagna.',
  },
  {
    id: 'dalig-1',
    fraga: 'styrkor',
    forvantat: '1 till 2',
    svar:
      'Mina styrkor är att jag är driven, noggrann, lojal, positiv och en riktig lagspelare. Jag gillar utmaningar och lär mig snabbt nya saker. Min största svaghet är nog att jag är perfektionist och jobbar lite för hårt ibland, men det brukar ju bara bli bra resultat av det så det är inget stort problem egentligen.',
  },
  {
    id: 'dalig-2',
    fraga: 'star',
    forvantat: '1 till 2',
    svar:
      'Jag är en sådan person som alltid tar tag i saker när andra inte gör det. Jag tycker det är viktigt att ta ansvar och inte bara vänta på att någon annan ska lösa problemen. Det har jag gjort på alla mina jobb och chefer har alltid sagt att jag är bra på att ta initiativ och lösa problem.',
  },
  {
    id: 'irrelevant',
    fraga: 'star',
    forvantat: 'relevant=false (422)',
    svar:
      'Hej, jag undrar hur lång tid det brukar ta innan man får svar efter en intervju? Jag var på intervju förra veckan hos ett företag i Göteborg och de sa att de skulle höra av sig men jag har inte hört något ännu. Ska jag ringa dem eller vänta? Tack på förhand.',
  },
  {
    id: 'for-kort',
    fraga: 'styrkor',
    forvantat: '400 too_short, inget modellanrop',
    svar: 'Jag är strukturerad och bra på att samarbeta. Min svaghet är att jag är otålig.',
  },
]

function arg(namn: string): string | undefined {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main() {
  const { bedomIntervjusvar } = await import('../src/lib/intervju/bedomning')
  const { kontrolleraSvarslangd } = await import('../src/lib/intervju/validering')

  const ut: Array<Record<string, unknown>> = []
  for (const f of FALL) {
    const langd = f.svar.trim().length
    const fel = kontrolleraSvarslangd(f.svar)
    if (fel) {
      console.log(`${f.id.padEnd(11)} ${String(langd).padStart(4)} tecken  STOPP ${fel} (förväntat ${f.forvantat})`)
      ut.push({ id: f.id, fraga: f.fraga, langd, forvantat: f.forvantat, utfall: fel })
      continue
    }
    try {
      const r = await bedomIntervjusvar(f.fraga, f.svar)
      if (!r.svar.relevant) {
        console.log(`${f.id.padEnd(11)} ${String(langd).padStart(4)} tecken  relevant=false  ${r.ms} ms`)
        ut.push({ id: f.id, fraga: f.fraga, langd, forvantat: f.forvantat, utfall: 'irrelevant', ms: r.ms })
        continue
      }
      const s = r.svar
      console.log(
        `${f.id.padEnd(11)} ${String(langd).padStart(4)} tecken  nivå ${s.level} ${s.levelLabel.padEnd(13)} (förväntat ${f.forvantat})  ${r.ms} ms  ${r.promptTokens}/${r.completionTokens} tok  $${(r.costUsd ?? 0).toFixed(5)}`
      )
      console.log(`   summary: ${s.summary}`)
      console.log(`   works:   ${s.works}`)
      console.log(`   missing: ${s.missing} [${s.missingKind}]`)
      console.log(`   punkter: ${s.full.points.map((p) => p.title).join(' | ')}`)
      console.log(`   omskrivet ${s.improvedAnswer.length} tecken: ${s.improvedAnswer.slice(0, 160)}...`)
      ut.push({
        id: f.id,
        fraga: f.fraga,
        langd,
        forvantat: f.forvantat,
        utfall: s.level,
        levelLabel: s.levelLabel,
        summary: s.summary,
        works: s.works,
        missing: s.missing,
        missingKind: s.missingKind,
        punkter: s.full.points,
        improvedAnswer: s.improvedAnswer,
        improvedWhy: s.improvedWhy,
        ms: r.ms,
        promptTokens: r.promptTokens,
        completionTokens: r.completionTokens,
        costUsd: r.costUsd,
      })
    } catch (err) {
      console.log(`${f.id.padEnd(11)} FEL ${(err as Error).message}`)
      ut.push({ id: f.id, fraga: f.fraga, langd, forvantat: f.forvantat, utfall: 'fel', fel: (err as Error).message })
    }
  }

  const jsonUt = arg('json')
  if (jsonUt) fs.writeFileSync(jsonUt, JSON.stringify(ut, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
