import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
  // Ladda inte rrweb-recorder (~52 KiB) och surveys (~32 KiB) vid sidstart.
  // De blockerar initial render utan att användas. Autocapture + pageviews
  // behålls. Vill vi spela in sessioner senare: posthog.startSessionRecording().
  disable_session_recording: true,
  disable_surveys: true,
})
