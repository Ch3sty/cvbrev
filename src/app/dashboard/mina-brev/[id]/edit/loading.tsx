import VaggLaddar from '@/components/rum/VaggLaddar'
import Golv from '@/components/rum/Golv'

/**
 * Samma sak som för visningssidan: utan en egen loading.tsx ärvs listans
 * skelett, och bytet mot sidans egen laddvy blir ett layoutskifte.
 * Markupen här är densamma som sidans egen laddvy.
 */
export default function RedigeraBrevLoading() {
  return (
    <>
      <VaggLaddar label="Laddar brev" />
      <Golv>
        <div className="w-full max-w-3xl space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
          <div className="h-11 w-full rounded-lg bg-insunken sm:w-64" />
          <div className="loading-thread h-[520px] rounded-xl border border-kant bg-papper" />
        </div>
      </Golv>
    </>
  )
}
