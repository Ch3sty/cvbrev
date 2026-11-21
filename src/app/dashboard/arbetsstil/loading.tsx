import { Golv, JobbVagg, LyftPanel, PanelSkelett, Skel } from '@/components/jobb3/kit'

/** Skelett för Din arbetsstil: väggen och panelen i samma höjd som sidan. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Laddar din arbetsstil">
      <JobbVagg hojd={316} hojdMobil={260} flik={false}>
        <div className="mt-6 xl:mt-[30px]" aria-hidden="true">
          <Skel vagg b="40%" h={46} />
          <Skel vagg b="70%" h={20} stil={{ marginTop: 14 }} />
        </div>
      </JobbVagg>
      <Golv>
        <LyftPanel etikett="Laddar">
          <PanelSkelett kort={2} />
        </LyftPanel>
      </Golv>
    </div>
  )
}
