/**
 * Hur många träffar gratisnivån ser per körning. Matchningen körs när
 * användaren öppnar sidan, inte på natten; annonserna från Platsbanken
 * uppdateras tre gånger per dygn.
 *
 * Bor här och inte i rutten, så att menyn ("Tre träffar, med skälen") kan läsa
 * samma tal som suddningen använder utan att dra in en serverrutt i
 * klientpaketet. Ändras talet ändras det på ett ställe.
 */
export const FREE_TIER_JOB_LIMIT = 3

/**
 * Hur många träffar en körning ger med Premium: de bästa, inte alla. Stod
 * tidigare som fast text i paket-copy, priser-data och program; nu läser alla
 * ytor talet härifrån (spec-publikt-v2 del A avsnitt 6, ägarens beslut 5).
 */
export const JOB_MATCHES_PER_RUN = 25

/**
 * Hur många suddade rader gratisnivån ser efter de öppna, innan betalväggen.
 * Fem räcker för att visa att listan fortsätter, och det är inte fler än att
 * tummen når betalväggen utan att skrolla en gång till. Låg förut i
 * /api/jobs/redact; flyttad hit så att routen bara exporterar sina metoder
 * och sidans laddare kan använda samma tal.
 */
export const REDACTED_PREVIEW_COUNT = 5
