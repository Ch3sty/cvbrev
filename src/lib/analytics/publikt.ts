'use client'

/**
 * Mätningen av produktvideon och Jobbkartan på de publika sidorna
 * (ägarens beslut 2026-10-13: sidvisningar och videons effekt ska gå att
 * läsa i PostHog). Allt går genom capture() i events.ts, alltså via kön:
 * ett anrop före PostHogs init tappas inte utan skickas när klienten är
 * uppe. Inget här kastar.
 *
 * Video, en mätare per videoelement:
 *
 *   const matare = useMemo(
 *     () => videoMatare({ page: '/verktyg/rekryteringstester', position: 'hero', variant: '169' }),
 *     []
 *   )
 *   // i synlighetsobservern:    matare.visad()
 *   // <video onPlay={() => matare.startad()}
 *   //        onTimeUpdate={(e) => matare.tid(e.currentTarget.currentTime, e.currentTarget.duration)}
 *   //        onEnded={() => matare.klar()}
 *   //        onVolumeChange={(e) => { if (!e.currentTarget.muted) matare.ljudPa() }} />
 *   // knappen under videon:     onClick={() => matare.ctaKlick()}
 *
 * Mätaren skickar varje händelse högst en gång per montering (en loopande
 * video räknas inte om varje varv), räknar ut watched_pct och device själv.
 *
 * Jobbkartan: jobbkartanEvent('jobbkartan_teaser_shown', { page: '/' }) och
 * så vidare, typerna står i AnalyticsEvents.
 */

import {
  capture,
  type JobbkartanEventName,
  type AnalyticsEvents,
  type VideoEgenskaper,
  type VideoEventName,
  type VideoEnhet,
} from './events'

/** mobil under 768 px bredd (Tailwinds md), annars desktop. */
export function enhet(): VideoEnhet {
  if (typeof window === 'undefined') return 'desktop'
  try {
    return window.matchMedia('(max-width: 767px)').matches ? 'mobil' : 'desktop'
  } catch {
    return 'desktop'
  }
}

/**
 * Skickar en videohändelse. device fylls i om den saknas. För en video som
 * spelas används hellre videoMatare, som håller reda på vad som redan
 * skickats.
 */
export function videoEvent(
  event: VideoEventName,
  props: Omit<VideoEgenskaper, 'device'> & { device?: VideoEnhet }
): void {
  capture(event, { ...props, device: props.device ?? enhet() })
}

/** Skickar en Jobbkartan-händelse. Typerna styr vilka egenskaper som krävs. */
export function jobbkartanEvent<E extends JobbkartanEventName>(
  event: E,
  props: AnalyticsEvents[E]
): void {
  capture(event, props)
}

export interface VideoMatare {
  /** Videon syntes i bild (skicka från en IntersectionObserver). */
  visad(): void
  /** Uppspelningen startade (onPlay). */
  startad(): void
  /** Spelpositionen ändrades (onTimeUpdate). Skickar 25, 50 och 75 procent. */
  tid(currentTime: number, duration: number): void
  /** Videon spelades till slutet (onEnded, eller sista varvet i en loop). */
  klar(): void
  /** Besökaren slog på ljudet. */
  ljudPa(): void
  /** Knappen vid videon klickades. Skickas varje gång. */
  ctaKlick(): void
}

const STEG: Array<[number, VideoEventName]> = [
  [25, 'video_watched_25'],
  [50, 'video_watched_50'],
  [75, 'video_watched_75'],
]

export function videoMatare(bas: {
  page: string
  position: string
  variant: VideoEgenskaper['variant']
}): VideoMatare {
  const skickade = new Set<VideoEventName>()
  let pct = 0

  const en = (event: VideoEventName) => {
    if (skickade.has(event)) return
    skickade.add(event)
    videoEvent(event, { ...bas, watched_pct: pct })
  }

  return {
    visad: () => en('video_shown'),
    startad: () => en('video_started'),
    tid(currentTime, duration) {
      if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return
      const nu = Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)))
      if (nu > pct) pct = nu
      for (const [grans, event] of STEG) if (pct >= grans) en(event)
      // timeupdate kommer med ungefär 250 ms mellanrum, så en loopande video
      // når sällan exakt 100. Sista halvsekunden räknas som slutet.
      if (duration - currentTime <= 0.5) {
        pct = 100
        en('video_completed')
      }
    },
    klar() {
      pct = 100
      for (const [, event] of STEG) en(event)
      en('video_completed')
    },
    ljudPa: () => en('video_sound_on'),
    ctaKlick: () => videoEvent('video_cta_clicked', { ...bas, watched_pct: pct }),
  }
}
