/**
 * Brevrummets gemensamma delar (BYGGSPEC avsnitt 6). Vyerna importerar
 * härifrån och skriver ingen egen CSS; klasserna står i src/app/brev3.css.
 * Spärren laddas via BrevSparrLaddare (dynamiskt), aldrig BrevSparr direkt.
 */

export { BrevVagg, BrevFlikar, VaggArk, type BrevFlik, type BrevVaggProps } from './BrevVagg'
export { BrevBana, BANANS_STEG, banaEtikett, type BrevBanaProps } from './BrevBana'
export { ArkBunt, type ArkBuntProps } from './ArkBunt'
export { StorKnapp, VitKnapp, Bricka, LitenKnapp, Chip, Tagg, MatarBricka, Formatmarken, Pips, KravBitar } from './delar'
export { Golv, LyftPanel, PanelHuvud, SektionsHuvud } from './LyftPanel'
export { MattRutnat, Matare, KravMitt, LangdMitt, MallMitt, type MatareProps } from './Matare'
export { Radkort, JobbKort, JobbRutnat, BrevKort, BrevRemsa, NyttBrevKort, type RadkortProps, type JobbKortProps, type BrevKortProps, type NyttBrevKortProps, type NyttBrevKvot } from './Kort'
export { ArbetsYta, ArbetsHuvud, MallKapsel, Avsnittsrad, Blad, type ArbetsYtaProps, type ArbetsHuvudProps, type MallKapselProps, type Avsnitt, type BladProps, type Sparstatus } from './Arbete'
export { default as BrevSparrLaddare, type BrevSparrProps, type BrevSparrVariant } from './BrevSparrLaddare'
export { veckoremsa, dagText, svenskDag, type Veckoremsa, type RemsDag } from './veckoremsa'
export * from './ikoner'
