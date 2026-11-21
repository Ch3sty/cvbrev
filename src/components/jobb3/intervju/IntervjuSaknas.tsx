/**
 * 404 i rummets form för /dashboard/intervju: ett prov eller en tolkning som
 * inte finns eller tillhör någon annan. Proxyn skriver om dokumentet till
 * /dashboard/intervju/saknas med status 404, och not-found.tsx ritar samma
 * vy när notFound() kastas vid klientnavigering. Texten är dagens (SAKNAS).
 */

import Topprad from '@/components/rum/Topprad'
import { Golv, JobbVagg, LyftPanel, PanelHuvud, StorKnapp, TextLank, VaggText } from '@/components/jobb3/kit'
import { INFOR_INTERVJUN_HREF } from '@/lib/intervju/lankar'
import { SAKNAS } from '@/app/dashboard/intervju/infor-intervjun-copy'

export default function IntervjuSaknas() {
  return (
    <>
      <JobbVagg hojd={300} hojdMobil={260} flik={false} tillbaka={{ href: INFOR_INTERVJUN_HREF, text: SAKNAS.eyebrow }} atgarder={<Topprad bara="atgarder" />}>
        <div className="mt-6 xl:mt-[30px]">
          <VaggText rubrik={SAKNAS.titel} />
        </div>
      </JobbVagg>
      <Golv>
        <LyftPanel rubrikId="saknas-rubrik">
          <PanelHuvud rubrik={SAKNAS.kortTitel} rubrikId="saknas-rubrik" under={SAKNAS.text} />
          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-6">
            <StorKnapp golv storlek="mellan" href={INFOR_INTERVJUN_HREF}>
              {SAKNAS.lankHubb}
            </StorKnapp>
            <TextLank href="/dashboard">{SAKNAS.lankHem}</TextLank>
          </div>
        </LyftPanel>
      </Golv>
    </>
  )
}
