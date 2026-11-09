/**
 * Matris- och serieuppgifterna i testartiklarna (saas-leads beslut 3,
 * 2026-11-09): samma figurritare som testerna (grafik v3, FigurV7 och
 * LuckaV7), så att uppgifterna kan visa rotation, spegling och överlägg,
 * som tecken i en tabell inte klarade.
 *
 * Uppgifterna står i src/lib/artikelfigurer/{matriser,serier,analogier}.json, egna
 * för artiklarna och aldrig bankens (facit får inte läcka). De byggs av
 * generatorns kedja och går genom samma kontroller som banken:
 *   node scripts/v7-facit-check.mjs src/lib/artikelfigurer/matriser.json
 *   node scripts/v7-geometri-check.mjs src/lib/artikelfigurer/matriser.json
 *   node scripts/v7-facit-check.mjs --serie src/lib/artikelfigurer/serier.json
 *   node scripts/v7-geometri-check.mjs --serie src/lib/artikelfigurer/serier.json
 *
 * Figuren är aria-hidden. Uppgiften står som text i en figcaption för
 * skärmläsare (beskrivning i datafilen), och lösningen skrivs i artikeln.
 * Ingen JavaScript: komponenten renderas på servern.
 *
 *   <MatrisUppgift id="logik-u9" />   rutnätet (eller raden) och A till F
 *   <MatrisFacit id="logik-u9" />     luckan ifylld med facit, för "Visa lösning"
 */

import { cn } from '@/lib/utils'
import { FigurV7, LuckaV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
import matriser from '@/lib/artikelfigurer/matriser.json'
import serier from '@/lib/artikelfigurer/serier.json'
import analogier from '@/lib/artikelfigurer/analogier.json'

type Uppgift = {
  id: string
  /** 3 × 3 (matris) eller 2 × 2 (analogi) med null i luckan, eller fem figurer och luckan (serie). */
  celler: (LayeredCell | null)[]
  kolumner: number
  serie: boolean
  options: LayeredCell[]
  correctAnswer: number
  beskrivning: string
}

/** En rad i datafilerna: matris och analogi har grid, serien har rad. */
type Rad = {
  id: string
  grid?: (LayeredCell | null)[][]
  rad?: LayeredCell[]
  options: LayeredCell[]
  correctAnswer: number
  beskrivning: string
}

function tillUppgift(q: Rad): Uppgift {
  const gemensamt = { id: q.id, options: q.options, correctAnswer: q.correctAnswer, beskrivning: q.beskrivning }
  if (q.rad) return { ...gemensamt, celler: [...q.rad, null], kolumner: 6, serie: true }
  const grid = q.grid ?? []
  return { ...gemensamt, celler: grid.flat(), kolumner: grid[0]?.length ?? 3, serie: false }
}

const UPPGIFTER = new Map<string, Uppgift>(
  ([...matriser, ...analogier, ...serier] as unknown as Rad[]).map((q) => [q.id, tillUppgift(q)])
)

function hamta(id: string): Uppgift {
  const u = UPPGIFTER.get(id)
  if (!u) throw new Error(`MatrisUppgift: okänt id ${id}`)
  return u
}

const BOKSTAV = (i: number) => String.fromCharCode(65 + i)

/** Rutnätet eller raden, med luckan tom eller ifylld med facit. */
function Rutnat({ u, facit }: { u: Uppgift; facit?: LayeredCell }) {
  const ruta = (cell: LayeredCell | null) => {
    if (cell) return <FigurV7 cell={cell} />
    if (facit) {
      return (
        <span className="ratt-fylld flex h-full w-full">
          <FigurV7 cell={facit} />
        </span>
      )
    }
    return <LuckaV7 />
  }
  if (u.serie) {
    // Figurseriens remsa (globals.css .serie): tre per rad i en smal
    // kolumn, sex i en remsa när kolumnen är bred nog.
    return (
      <div className="serie-kolumn">
        <div className="rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft">
          <div className="serie">
            {u.celler.map((c, i) => (
              <div key={i} className={cn('ruta', !c && !facit && 'lucka')}>
                {ruta(c)}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('mx-auto w-full rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft', u.kolumner === 2 && 'max-w-[240px]')}>
      <div className="grid gap-px overflow-hidden bg-kant" style={{ gridTemplateColumns: `repeat(${u.kolumner}, minmax(0, 1fr))` }}>
        {u.celler.map((c, i) => (
          <div key={i} className={cn('flex aspect-square items-center justify-center', c || facit ? 'bg-papper' : 'bg-papper-2')}>
            {ruta(c)}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MatrisUppgift({ id }: { id: string }) {
  const u = hamta(id)
  return (
    <figure className="not-prose matrisyta my-6" data-matrisuppgift={u.id}>
      <div aria-hidden="true" className={cn('mx-auto w-full', u.serie ? 'max-w-[680px]' : 'max-w-[360px]')}>
        <Rutnat u={u} />
        <div className={cn('mt-3', u.serie ? 'serie-kolumn' : '')}>
          <div className={cn(u.serie ? 'serie-alt' : u.options.length === 4 ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-3 gap-2.5')}>
            {u.options.map((o, i) => (
              <div key={i} className="relative aspect-square rounded-xl border border-kant bg-papper">
                <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold leading-4 text-ink-3">{BOKSTAV(i)}</span>
                <div className="flex h-full w-full items-center justify-center">
                  <FigurV7 cell={o} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="sr-only">{u.beskrivning}</figcaption>
    </figure>
  )
}

/** Lösningen i bild: luckan ifylld med facit i koppar (.ratt-fylld). */
export function MatrisFacit({ id }: { id: string }) {
  const u = hamta(id)
  return (
    <div className="not-prose matrisyta my-4" aria-hidden="true" data-matrisfacit={u.id}>
      <div className={cn('w-full', u.serie ? 'max-w-[440px]' : u.kolumner === 2 ? 'max-w-[180px]' : 'max-w-[240px]')}>
        <Rutnat u={u} facit={u.options[u.correctAnswer]} />
      </div>
    </div>
  )
}
