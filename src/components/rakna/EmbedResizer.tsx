'use client'

import { useEffect } from 'react'

/**
 * Rapporterar embed-sidans höjd till värdsidan via postMessage så att
 * iframen kan växa och krympa med innehållet (t.ex. när jämförelseläget
 * fälls ut). Höjden är inte känslig, därför wildcard-target.
 */
export default function EmbedResizer({ verktyg }: { verktyg: string }) {
  useEffect(() => {
    const posta = () => {
      window.parent?.postMessage(
        { jbcVerktyg: verktyg, jbcHeight: document.documentElement.scrollHeight },
        '*'
      )
    }
    posta()
    const observer = new ResizeObserver(posta)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [verktyg])
  return null
}
