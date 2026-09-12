import posthog from 'posthog-js'

/**
 * PostHog initieras efter att sidan blivit interaktiv.
 *
 * Init:en kördes tidigare synkront i den här modulen, alltså före hydrering,
 * och konkurrerade om huvudtråden precis när den behövs som mest. Inget i
 * första vyn beror på PostHog, så den får vänta tills webbläsaren är ledig.
 * Autocapture och pageviews fungerar som förut, den första pageview-händelsen
 * skickas när init:en väl kört.
 */
function start() {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-01-30',
    // Ladda inte rrweb-recorder (~52 KiB) och surveys (~32 KiB) vid sidstart.
    // De blockerar initial render utan att användas. Autocapture + pageviews
    // behålls. Vill vi spela in sessioner senare: posthog.startSessionRecording().
    disable_session_recording: true,
    disable_surveys: true,
  })
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    // Taket på två sekunder gör att händelser inte tappas på en sida som
    // aldrig blir riktigt ledig.
    window.requestIdleCallback(start, { timeout: 2000 })
  } else {
    setTimeout(start, 1200)
  }
}
