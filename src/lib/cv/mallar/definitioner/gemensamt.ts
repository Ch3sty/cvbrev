/** Det som är lika i många definitioner. */
import type { Sektion } from '../kontrakt'
import type { MallDef } from '../typer'

/** Standardordningen i en spalt. */
export const STANDARD_ORDNING: Sektion[] = ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'intyg', 'sprak', 'projekt', 'intressen', 'referenser']

/** Kompetenserna före utbildningen (Raster, Terrakotta). */
export const KOMPETENSER_FORE: Sektion[] = ['profil', 'erfarenhet', 'kompetenser', 'utbildning', 'intyg', 'sprak', 'projekt', 'intressen', 'referenser']

/** Huvudspalten när kompetenser, intyg och språk står i en spalt. */
export const HUVUDSPALT: Sektion[] = ['profil', 'erfarenhet', 'utbildning', 'projekt', 'referenser']

/** "Få plats på en sida" enligt spec avsnitt 2. */
export const EN_SIDA: MallDef['enSida'] = { grad: -0.5, marginal: 4, luftOver: 4 }

export const PUNKT: MallDef['punkt'] = { tecken: '•', farg: 'text', indrag: 4.5 }
