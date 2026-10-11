/**
 * Hur många träffar gratisnivån ser per natt.
 *
 * Bor här och inte i rutten, så att menyn ("Tre träffar per natt") kan läsa
 * samma tal som suddningen använder utan att dra in en serverrutt i
 * klientpaketet. Ändras talet ändras det på ett ställe.
 */
export const FREE_TIER_JOB_LIMIT = 3
