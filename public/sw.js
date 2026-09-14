/*
 * Service worker för Jobbcoach (docs/plan-pwa.md, avsnitt 6).
 *
 * Den här filen cachar ingenting. Den finns av ett enda skäl: Chrome kräver
 * en registrerad service worker med en fetch-hanterare innan den erbjuder
 * installation. Allt annat den skulle kunna göra är i det här läget en risk
 * utan motsvarande nytta.
 *
 * Varför ingen cache:
 *
 *   HTML   Sidorna är inloggade och personliga. En cachad sida kan visa en
 *          annan användares namn efter ett kontobyte, eller en betalvägg som
 *          togs bort när betalningen gick igenom.
 *   API    Kvoter, brev, matchningar och testresultat ändras hela tiden. Ett
 *          cachat svar här är ett fel som ser ut som en bugg i data.
 *   Assets Next lägger redan innehållshashar på allt under /_next/static och
 *          sätter immutable, så webbläsarens egen cache gör jobbet.
 *
 * fetch-hanteraren släpper därför igenom allt orört. Vi anropar inte ens
 * respondWith: gör man det tas begäran över av service workern, och då
 * förlorar den bland annat webbläsarens egen förhandshämtning.
 */

// Installera direkt, vänta inte på att gamla flikar stängs.
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Ta över öppna flikar, och städa bort cachar som en tidigare version av
// den här filen kan ha lämnat efter sig.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.caches) {
        const namn = await self.caches.keys()
        await Promise.all(namn.map((n) => self.caches.delete(n)))
      }
      await self.clients.claim()
    })()
  )
})

// Fetch-hanteraren måste finnas för att installationen ska erbjudas, men
// den ska inte göra något. Utan respondWith går begäran sin vanliga väg.
self.addEventListener('fetch', () => {})
