// src/lib/scheduleIdle.ts
//
// Kör något när webbläsaren är ledig, i stället för direkt vid mount.
//
// Skalets sidoanrop (notiser, rekryterarintressen) behövs inte för första
// målningen men konkurrerade om huvudtråden precis när den behövs som mest.
// Taket gör att ingenting tappas på en sida som aldrig blir riktigt ledig.

export function scheduleIdle(fn: () => void, timeout = 2000): () => void {
  if (typeof window === 'undefined') {
    fn();
    return () => {};
  }

  const w = window as Window &
    typeof globalThis & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }

  const id = w.setTimeout(fn, Math.min(timeout, 1200));
  return () => w.clearTimeout(id);
}
