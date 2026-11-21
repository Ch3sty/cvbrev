/**
 * Brevmallen, serverns ingång (brevrummet, omgång 1, byggspecen avsnitt 5).
 *
 *   renderBrevHtml(mallId, data, val?, opt?)  fristående HTML-dokument, A4
 *   byggBrevDocx(mallId, data, val?)          Word-fil för mallar med word: true
 *   brevOrd(data)                             brödtextens ordantal
 *
 * Klienten importerar katalogen ur './katalog' och texthjälparna ur './text'.
 * Renderaren (./render) har inga Node-moduler och kan laddas dynamiskt i
 * klienten; Word-byggaren (./word) är bara för servern.
 */
export { renderBrevHtml, brevMallDef, brevDef, brevGransMm, uppskattatSteg, type BrevSteg, type BrevRenderValUtokad } from './render'
export { byggBrevDocx, byggBrevDokument, BREV_DOCX_MIME } from './word'
export { brevOrd, brevSomText, datumRad, halsningsRad, arendeRad, avslutsRad, hittaMarkeringar } from './text'
export { brevMallKatalog, brevMallKort, BREV_FORVALD_MALL } from './katalog'
export type * from './typer'
