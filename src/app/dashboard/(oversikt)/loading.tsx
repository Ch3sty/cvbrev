import { Golv, JobbVagg, LyftPanel, PanelSkelett, RadSkelett, Avsnitt, VaggSkelett } from '@/components/jobb3/kit'

/** Översikt medan sidan läses: väggen och panelen i samma form som det färdiga (CLS 0). */
export default function OversiktLaddar() {
  return (
    <>
      <JobbVagg hojd={596} hojdMobil={500} flik={false} etikett="Laddar Jobbsöket">
        <VaggSkelett />
      </JobbVagg>
      <Golv>
        <LyftPanel>
          <PanelSkelett />
        </LyftPanel>
        <Avsnitt>
          <RadSkelett rader={3} />
        </Avsnitt>
      </Golv>
    </>
  )
}
