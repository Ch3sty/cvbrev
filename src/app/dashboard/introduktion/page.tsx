/**
 * Introduktionssidan är borttagen (ägarens beslut 2026-11-21, BYGGSPEC 2.4).
 * Gamla länkar och bokmärken landar permanent på Jobbsökets översikt.
 */

import { permanentRedirect } from 'next/navigation'

export default function IntroduktionPage(): never {
  permanentRedirect('/dashboard')
}
