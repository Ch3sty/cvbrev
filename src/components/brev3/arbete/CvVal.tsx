'use client'

/**
 * "Byt CV" i Skriv brev: CV-väljaren (CvPickerGrid) i ett ark. Låsta CV
 * visas men går inte att välja, som i dagens första steg.
 */
import Sheet from '@/components/shell/Sheet'
import CvPickerGrid from '@/components/brev3/cv/CvPickerGrid'
import type { SkrivCv } from './SkrivBrev'
import { SKRIV } from './texter'

export default function CvVal({ cvs, valt, onVal, onClose }: { cvs: SkrivCv[]; valt: string; onVal: (id: string) => void; onClose: () => void }) {
  return (
    <Sheet open onClose={onClose} title={SKRIV.valjCv}>
      <CvPickerGrid
        cvs={cvs.map((c) => ({ id: c.id, file_name: c.namn, created_at: c.datum }))}
        lockedCvIds={new Set(cvs.filter((c) => c.last).map((c) => c.id))}
        selectedCV={valt}
        onCVSelect={onVal}
      />
    </Sheet>
  )
}
