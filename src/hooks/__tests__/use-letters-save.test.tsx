/**
 * saveLetter: sparandet är sparandet, listan är en bekvämlighet.
 *
 * Buggen i produktion ("Brevet kunde inte sparas: Failed to fetch" samtidigt
 * som "Brevet är sparat") hade två delar. Den här filen täcker hooken:
 * ett tappat POST ska ge ett tyst nytt försök, en trasig listhämtning efter
 * ett lyckat POST ska inte se ut som ett misslyckat sparande, och ett riktigt
 * serverfel ska fortfarande kastas.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const fetchLettersMock = vi.fn(async () => {});

vi.mock('@/store/letter-store', () => {
  const state = {
    letters: [],
    currentLetter: null,
    isLoading: false,
    isGenerating: false,
    error: null,
    fetchLetters: (...args: any[]) => fetchLettersMock(...(args as [])),
    fetchLetter: vi.fn(),
    generateLetter: vi.fn(),
    updateLetter: vi.fn(),
    deleteLetter: vi.fn(),
  };
  const useLetterStore: any = () => state;
  useLetterStore.getState = () => state;
  return { useLetterStore };
});

import { useLetters } from '@/hooks/use-letters';

const ok = (data: any) =>
  ({ ok: true, status: 200, json: async () => ({ success: true, data }) }) as any;

describe('useLetters.saveLetter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchLettersMock.mockReset();
    fetchLettersMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('gör ett nytt försök när nätverket tappar POST och lyckas då', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(ok({ id: 'brev-1', is_saved: true }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLetters({ skipInitialFetch: true }));

    let sparat: any;
    await act(async () => {
      const p = result.current.saveLetter({ id: 'brev-1', content: 'hej' });
      await vi.advanceTimersByTimeAsync(900);
      sparat = await p;
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Samma id i båda försöken: servern uppdaterar raden i stället för att
    // skapa en dubblett.
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).id).toBe('brev-1');
    expect(sparat).toEqual({ id: 'brev-1', is_saved: true });
  });

  it('kastar inte när listhämtningen misslyckas efter ett lyckat POST', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ id: 'brev-2' })));
    fetchLettersMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useLetters({ skipInitialFetch: true }));

    let sparat: any;
    await act(async () => {
      sparat = await result.current.saveLetter({ id: 'brev-2', content: 'hej' });
    });

    expect(sparat).toEqual({ id: 'brev-2' });
  });

  it('kastar utan nytt försök när servern svarar med ett fel', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Du måste verifiera din e-post' }),
    } as any);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLetters({ skipInitialFetch: true }));

    await act(async () => {
      await expect(
        result.current.saveLetter({ id: 'brev-3', content: 'hej' })
      ).rejects.toThrow('Du måste verifiera din e-post');
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('kastar efter två tappade försök', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLetters({ skipInitialFetch: true }));

    await act(async () => {
      const p = result.current.saveLetter({ id: 'brev-4', content: 'hej' });
      const forvantan = expect(p).rejects.toMatchObject({ code: 'network_error' });
      await vi.advanceTimersByTimeAsync(900);
      await forvantan;
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
