/**
 * Tratten från sökt till erbjudande, som Statistik och den publika
 * delningssidan (/dela/sokta-tjanster/[token]) ritar den. Tar motorns Tratt
 * (src/lib/jobbsok/statistik.ts) eller delningens aggregat med samma form,
 * så att den som får länken ser samma bild som ägaren.
 *
 * Serverkomponent (inga hooks), går att använda i klientvyer.
 */

import { Tratt } from '@/components/jobb3/kit'
import { langDag, type BrickTon } from '@/lib/jobbsok'
import { Ordtal, trattTon } from './text'

/** En bricka i tratten: företagets två bokstäver (tomt när namnen inte delas) och tonen. */
export interface TrattBildBricka {
  bokstaver: string
  ton: BrickTon
}

/** Det tratten behöver. Motorns Tratt passar rakt in. */
export interface TrattBildData {
  sokta: { antal: number; sedan: string | null; brickor: TrattBildBricka[] }
  svar: { antal: number; kallelser: number; avslag: number; brickor: TrattBildBricka[] }
  intervju: { antal: number; genomforda: number; bokade: number; brickor: TrattBildBricka[] }
  erbjudande: { antal: number; brickor: TrattBildBricka[] }
}

const brickor = (b: TrattBildBricka[]) => b.map((x) => ({ kod: x.bokstaver, ton: trattTon(x.ton) }))

export function TrattBild({ tratt: t }: { tratt: TrattBildData }) {
  const etikett = `${Ordtal(t.sokta.antal)} sökta. ${t.svar.antal} har svarat. ${t.intervju.antal} har lett till intervju. ${t.erbjudande.antal ? `${t.erbjudande.antal} erbjudande.` : 'Inget erbjudande än.'}`
  return (
    <Tratt
      etikett={etikett}
      mellan={[`${t.svar.antal} av ${t.sokta.antal}`, `${t.intervju.antal} av ${t.svar.antal}`, t.erbjudande.antal ? `${t.erbjudande.antal} av ${t.intervju.antal}` : 'väntar']}
      led={[
        { tal: t.sokta.antal, namn: 'Sökta', under: t.sokta.sedan ? `Sedan ${langDag(t.sokta.sedan)}` : undefined, brickor: brickor(t.sokta.brickor) },
        { tal: t.svar.antal, namn: 'Fått svar', under: svarUnder(t.svar.kallelser, t.svar.avslag), brickor: brickor(t.svar.brickor) },
        { tal: t.intervju.antal, namn: 'Intervju', under: intervjuUnder(t.intervju.genomforda, t.intervju.bokade, t.intervju.antal), brickor: brickor(t.intervju.brickor) },
        { tal: t.erbjudande.antal, namn: 'Erbjudande', under: t.erbjudande.antal ? undefined : 'Inget än', brickor: brickor(t.erbjudande.brickor), mal: true },
      ]}
    />
  )
}

function svarUnder(kallelser: number, avslag: number): string {
  const d: string[] = []
  if (kallelser) d.push(kallelser === 1 ? '1 kallelse' : `${kallelser} kallelser`)
  if (avslag) d.push(`${avslag} avslag`)
  return d.length ? d.join(', ') : 'Inget svar än'
}

function intervjuUnder(genomforda: number, bokade: number, antal: number): string {
  if (!antal) return 'Ingen än'
  const d: string[] = []
  if (genomforda) d.push(`${genomforda} genomförd${genomforda === 1 ? '' : 'a'}`)
  if (bokade) d.push(`${bokade} bokad${bokade === 1 ? '' : 'e'}`)
  return d.length ? d.join(', ') : `${antal} kallad${antal === 1 ? '' : 'e'}`
}
