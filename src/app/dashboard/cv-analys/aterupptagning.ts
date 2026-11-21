/**
 * Återupptagen CV-analys (art-director 21.2 fråga 2 och 21.3 punkt 2).
 *
 * "Åtgärda i CV:t" i CV-rummet lovar att åtgärda ett fynd ur en analys som
 * redan är sparad i cv_analysis_jobs.result. Knappen öppnar därför den
 * sparade analysen med ?job=<id> i granskningssteget, utan nytt AI-anrop,
 * utan kvot och utan ny rad i cv_analysis_jobs. Regeln för alla rum: ett
 * lyft kort som pekar på sparad data öppnar den datan.
 *
 * Klientsäker, inga beroenden.
 */

export interface AterupptagenAnalys {
  id: string
  cvId: string | null
  displayName: string | null
  /** cv_analysis_jobs.result, som analysen sparade den. */
  result: Record<string, unknown>
  /** Från Analys-sidans knappar: steget och förslaget att börja med. */
  oppna?: Oppna
}

/**
 * Analys-sidans knappar (steg 4): "Åtgärda i CV:t" landar i väljsteget (4)
 * med de förvalda förslagen, "Ändra texten" i väljsteget med ett förslag
 * valt och "Använd förslaget" i granskningen (5) med bara det förslaget.
 * valj: profil, roll-<i>, kompetenser (de förvalda) eller forvalda.
 */
export interface Oppna {
  steg: 4 | 5 | null
  valj: string | null
}

/** Det wizarden behöver ur den sparade analysen. */
export interface Aterupptagning {
  cvId: string | null
  /** Resultatet i samma form som pollningen ger det (id och display_name inräknade). */
  resultat: Record<string, unknown> & { id: string }
  harStrukturerad: boolean
  /** Förvalda förbättringar: de som valdes senast, annars alla analysens förslag. */
  val: { profil: boolean; roller: number[]; kompetenser: number[]; allmant: number[] }
  /** Steget att landa i, ettbaserat som ?steg=N: granskningen (5) eller resultatet (3). */
  steg: number
}

function index(lista: unknown, ok: (v: Record<string, unknown>) => boolean): number[] {
  if (!Array.isArray(lista)) return []
  return lista.flatMap((v, i) => (v && typeof v === 'object' && ok(v as Record<string, unknown>) ? [i] : []))
}

function talLista(v: unknown): number[] | null {
  return Array.isArray(v) && v.every((n) => typeof n === 'number') ? (v as number[]) : null
}

function forvalt(r: Record<string, unknown>, harProfil: boolean, roller: number[], kompetenser: number[]) {
  const ok = (v: Record<string, unknown> | undefined) => v?.forvald !== false
  return {
    profil: harProfil && ok(r.profileSummary as Record<string, unknown> | undefined),
    roller: roller.filter((i) => ok((r.roleBasedImprovements as Record<string, unknown>[])[i])),
    kompetenser: kompetenser.filter((i) => ok((r.skillSuggestions as Record<string, unknown>[])[i])),
    allmant: [] as number[],
  }
}

export function aterupptagning(a: AterupptagenAnalys): Aterupptagning {
  const r = a.result
  const profil = r.profileSummary as Record<string, unknown> | undefined
  const sparat = r.selectedImprovements as Record<string, unknown> | undefined
  const harProfil = typeof profil?.improvedText === 'string' && profil.improvedText.trim().length > 0
  const roller = index(r.roleBasedImprovements, (v) => typeof v.suggestedText === 'string' && v.suggestedText.trim().length > 0)
  const kompetenser = index(r.skillSuggestions, (v) => typeof v.skill === 'string' && v.skill.trim().length > 0)
  // Förvalt utan sparat val: bara förslag som inte sänker poängen
  // (forvald: false sätts av poängmodellen, src/lib/cv/poang).
  const forvald = (v: Record<string, unknown> | undefined) => v?.forvald !== false
  const val = sparat
    ? {
        profil: sparat.profile === true && harProfil,
        roller: (talLista(sparat.roles) ?? []).filter((i) => roller.includes(i)),
        kompetenser: (talLista(sparat.skills) ?? []).filter((i) => kompetenser.includes(i)),
        allmant: talLista(sparat.general) ?? [],
      }
    : {
        profil: harProfil && forvald(profil),
        roller: roller.filter((i) => forvald((r.roleBasedImprovements as Record<string, unknown>[])[i])),
        kompetenser: kompetenser.filter((i) => forvald((r.skillSuggestions as Record<string, unknown>[])[i])),
        allmant: [] as number[],
      }
  const harStrukturerad = Boolean(r.structuredCV && typeof r.structuredCV === 'object')
  // Ett enskilt förslag från Analys-sidan: bara det är valt. "forvalda"
  // väljer de förvalda även när ett äldre val finns sparat.
  const v = a.oppna?.valj ?? null
  const valtNu =
    v === 'forvalda'
      ? forvalt(r, harProfil, roller, kompetenser)
      : v
        ? {
            profil: v === 'profil' && harProfil,
            roller: v.startsWith('roll-') ? roller.filter((i) => i === Number(v.slice(5))) : [],
            kompetenser: v === 'kompetenser' ? forvalt(r, harProfil, roller, kompetenser).kompetenser : [],
            allmant: [] as number[],
          }
        : val
  const fransida = a.oppna?.steg ?? null
  return {
    cvId: a.cvId,
    resultat: { ...r, id: a.id, display_name: a.displayName },
    harStrukturerad,
    val: valtNu,
    // Granskningen behöver det strukturerade CV:t för att visa före och efter.
    steg: fransida && harStrukturerad ? fransida : harStrukturerad ? 5 : 3,
  }
}
