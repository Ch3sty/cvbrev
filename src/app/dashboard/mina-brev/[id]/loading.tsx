import VaggLaddar from '@/components/rum/VaggLaddar'
import Golv from '@/components/rum/Golv'

/**
 * Utan den här filen ärver /dashboard/mina-brev/[id] förälderns loading.tsx,
 * alltså listans skelett. Sidans egen laddvy är ett helt annat skelett, så
 * bytet flyttade innehållet och mätte 0,0055 i CLS.
 *
 * Skelettet nedan är samma markup som sidans egen laddvy: väggen och golvet
 * med brevets block. Blocken står stilla, bara tråden längs brevpanelens
 * överkant rör sig.
 */
export default function BrevLoading() {
  return (
    <>
      <VaggLaddar label="Laddar brev" />
      <Golv>
        <div className="w-full max-w-3xl space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
          <div className="h-11 w-full rounded-lg bg-papper-2 sm:w-64" />
          <div className="loading-thread h-[520px] rounded-xl border border-kant bg-papper" />
        </div>
      </Golv>
    </>
  )
}
