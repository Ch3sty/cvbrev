/**
 * Laddvyn i arbetsläget (loading.tsx för Skriv brev och Brevet): samma yta,
 * huvud, blad och ark som den färdiga sidan, utan innehåll, så att bytet
 * inte flyttar något. Bara tråden längs bladets överkant rör sig.
 */
import { ArbetsYta, Blad } from '@/components/brev3/kit'
import ArbetsRam from './ArbetsRam'

export default function ArbetsLaddar({ rubrik, bladRubrik, hojd, flikar = false }: { rubrik: string; bladRubrik: string; hojd: number; flikar?: boolean }) {
  return (
    <ArbetsRam>
      <div role="status" aria-busy="true" aria-label={`Laddar ${rubrik.toLocaleLowerCase('sv-SE')}`}>
        <ArbetsYta
          telefonArk={flikar ? 'stort' : 'litet'}
          huvud={
            <header className="b3-huvud">
              <span className="b3-kryss" aria-hidden="true" />
              <div className="b3-huvud-titel">
                <b className="b3-disp">{rubrik}</b>
                <span>&nbsp;</span>
              </div>
            </header>
          }
          avsnitt={flikar ? <div className="b3-avsn" aria-hidden="true" style={{ height: 44 }} /> : undefined}
          blad={
            <Blad rubrik={bladRubrik} hojd={hojd}>
              <div className="loading-thread mt-2 h-[120px] rounded-[14px] bg-[color:var(--b3-mjuk)]" aria-hidden="true" />
            </Blad>
          }
          ark={<div className="h-full w-full bg-white xl:h-[678px] xl:w-[480px] xl:rounded-lg" aria-hidden="true" />}
        />
      </div>
    </ArbetsRam>
  )
}
