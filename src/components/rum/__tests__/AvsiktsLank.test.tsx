import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'

const prefetch = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch }),
}))

// next/link ersätts av en ren länk som visar vilket prefetch-värde den fick.
vi.mock('next/link', async () => {
  const React = await import('react')
  const Link = React.forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: unknown }>(
    function Link({ href, prefetch: p, children, ...rest }, ref) {
      return (
        <a ref={ref} href={href} data-prefetch={String(p)} {...rest}>
          {children}
        </a>
      )
    }
  )
  return { default: Link }
})

import AvsiktsLank from '../AvsiktsLank'

afterEach(() => {
  cleanup()
  prefetch.mockClear()
})

describe('AvsiktsLank', () => {
  it('stänger av förladdningen när länken bara syns', () => {
    render(<AvsiktsLank href="/dashboard/tester">Tester</AvsiktsLank>)
    const a = screen.getByRole('link', { name: 'Tester' })
    expect(a.getAttribute('data-prefetch')).toBe('false')
    expect(a.getAttribute('href')).toBe('/dashboard/tester')
    expect(prefetch).not.toHaveBeenCalled()
  })

  it('förladdar en gång på avsikt: pekaren, fokus och touch räknas som samma', () => {
    render(<AvsiktsLank href="/dashboard/mina-brev">Brev</AvsiktsLank>)
    const a = screen.getByRole('link', { name: 'Brev' })
    fireEvent.mouseEnter(a)
    fireEvent.mouseEnter(a)
    fireEvent.focus(a)
    fireEvent.touchStart(a)
    expect(prefetch).toHaveBeenCalledTimes(1)
    expect(prefetch).toHaveBeenCalledWith('/dashboard/mina-brev')
  })

  it('förladdar igen när adressen byts, och anropar sidans egna händelser', () => {
    const onMouseEnter = vi.fn()
    const onFocus = vi.fn()
    const { rerender } = render(
      <AvsiktsLank href="/dashboard/profil/cv?cv=a" onMouseEnter={onMouseEnter} onFocus={onFocus}>
        CV
      </AvsiktsLank>
    )
    const a = screen.getByRole('link', { name: 'CV' })
    fireEvent.mouseEnter(a)
    fireEvent.focus(a)
    expect(onMouseEnter).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalledTimes(1)
    rerender(
      <AvsiktsLank href="/dashboard/profil/cv?cv=b" onMouseEnter={onMouseEnter} onFocus={onFocus}>
        CV
      </AvsiktsLank>
    )
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'CV' }))
    expect(prefetch.mock.calls.map((c) => c[0])).toEqual(['/dashboard/profil/cv?cv=a', '/dashboard/profil/cv?cv=b'])
  })
})
