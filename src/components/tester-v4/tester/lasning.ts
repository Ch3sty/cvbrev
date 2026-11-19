// Vilken betalvägg ett lås öppnar (Tester v4). Ren.
//
// Låset bärs av Handling.las i kontraktet; här väljs featuren och platsen
// som GraValSheet och mätningen (paywall_shown, betalvagg_visad) behöver.

import type { Feature } from '@/lib/access/features'
import type { BetalvaggPlats } from '@/lib/analytics/events'
import type { Handling } from '@/lib/tester/v4/typer'

export interface Las {
  feature: Feature
  plats: BetalvaggPlats
}

export function lasFor(h: Pick<Handling, 'slag' | 'las' | 'zon'>): Las {
  if (h.las?.skal === 'nivakoll_gjord') return { feature: 'tests_above_base', plats: 'ommatning' }
  switch (h.slag) {
    case 'trana':
      return { feature: 'test_daily_pass', plats: 'dag2' }
    case 'ovningsprov':
      return { feature: 'test_exam_mode', plats: 'generalrepetition' }
    case 'nivakoll':
      return { feature: 'tests_above_base', plats: 'ommatning' }
    default:
      return { feature: 'tests_above_base', plats: 'testniva' }
  }
}
