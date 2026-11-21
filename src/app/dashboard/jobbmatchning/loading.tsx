import { Golv, JobbVagg, LyftPanel, RadSkelett, VaggSkelett } from '@/components/jobb3/kit'

/** Matchade jobb medan sidan läses: väggen och listans panel i samma form som det färdiga. */
export default function JobbmatchningLaddar() {
  return (
    <>
      <JobbVagg hojd={436} hojdMobil={338} flik={false} etikett="Laddar Matchade jobb">
        <VaggSkelett />
      </JobbVagg>
      <Golv>
        <LyftPanel>
          <RadSkelett rader={5} />
        </LyftPanel>
      </Golv>
    </>
  )
}
