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
