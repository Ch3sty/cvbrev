// Var en inloggad användare ska landa när hon vill köpa eller se Premium.
//
// Publika /priser är en marknadsföringsyta med hero och SEO-schema. Den som
// redan har konto ska i stället till prenumerationssidan, som visar hennes
// faktiska tillstånd (dagar kvar, kvoter, historik) och samma fyra produkter.
// Att skicka en inloggad till /priser är en död väg: hon möter en säljpitch
// för något hon kanske redan har.

/** Den inloggade prissidan. */
export const PREMIUM_HREF = '/dashboard/profil/prenumeration'

/** Publika prissidan, bara för utloggade. */
export const PUBLIC_PRICING_HREF = '/priser'

/**
 * Väljer rätt prisyta. `isLoggedIn` undefined betyder "vet inte ännu", och
 * då pekar vi på den inloggade sidan: den är rätt i dashboard-sammanhang,
 * där alla komponenter som anropar det här redan kräver session.
 */
export function premiumHref(isLoggedIn?: boolean): string {
  return isLoggedIn === false ? PUBLIC_PRICING_HREF : PREMIUM_HREF
}
