'use client'

/**
 * Stänger en svävande meny i toppraden på samma sätt överallt: klick eller
 * tryck utanför menyn och knappen, och Escape. Vid Escape går fokus tillbaka
 * till knappen som öppnade menyn, så att tangentbordet inte tappar platsen.
 * Används av klockan (NotificationBell), meddelanderutan
 * (MessagesHeaderButton) och profilmenyn (ProfileMenu); menyerna ritas i body
 * (useAnkratLage), därför räknas både knappens behållare och menyn som inne.
 */

import { useEffect, useRef, type RefObject } from 'react'

export function useStangMeny(
  oppen: boolean,
  stang: () => void,
  ytor: ReadonlyArray<RefObject<HTMLElement | null>>,
  knapp: () => HTMLElement | null | undefined
): void {
  // Senaste stang, ytor och knapp utan att lyssnarna sätts om vid varje ritning.
  const senaste = useRef({ stang, ytor, knapp })
  senaste.current = { stang, ytor, knapp }

  useEffect(() => {
    if (!oppen) return
    const utanfor = (e: MouseEvent | TouchEvent) => {
      const mal = e.target as Node | null
      if (!mal) return
      if (senaste.current.ytor.some((r) => r.current?.contains(mal))) return
      senaste.current.stang()
    }
    const tangent = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      senaste.current.stang()
      senaste.current.knapp()?.focus({ preventScroll: true })
    }
    document.addEventListener('mousedown', utanfor)
    document.addEventListener('touchstart', utanfor)
    document.addEventListener('keydown', tangent)
    return () => {
      document.removeEventListener('mousedown', utanfor)
      document.removeEventListener('touchstart', utanfor)
      document.removeEventListener('keydown', tangent)
    }
  }, [oppen])
}
