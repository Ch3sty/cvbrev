import { Golv, JobbVagg, LyftPanel, PanelSkelett, VaggSkelett } from '@/components/jobb3/kit'

/** Skelett för Inför intervjun: väggen och panelen i samma höjd som sidan. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Laddar Inför intervjun">
      <JobbVagg hojd={612} hojdMobil={432} flik={false}>
        <VaggSkelett />
      </JobbVagg>
      <Golv>
        <LyftPanel etikett="Laddar">
          <PanelSkelett kort={2} />
        </LyftPanel>
      </Golv>
    </div>
  )
}
