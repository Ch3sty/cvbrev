/**
 * Keyboard shortcuts for answer selection
 * Supports A-F, 1-6, and arrow keys
 */

import { useEffect } from 'react';

export function useAnswerShortcuts(
  max: number,
  currentSelection: number | null,
  onPick: (i: number) => void
) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't interfere with inputs
      if (
        target?.tagName?.toLowerCase() === 'input' ||
        target?.tagName?.toLowerCase() === 'textarea' ||
        target?.isContentEditable
      ) {
        return;
      }

      const k = e.key.toLowerCase();

      // A-F keys (a=0, b=1, ..., f=5)
      if (k >= 'a' && k <= 'f') {
        const index = k.charCodeAt(0) - 97;
        if (index < max) {
          onPick(index);
          e.preventDefault();
        }
        return;
      }

      // 1-6 keys (1=0, 2=1, ..., 6=5)
      if (/^[1-6]$/.test(k)) {
        const index = parseInt(k, 10) - 1;
        if (index < max) {
          onPick(index);
          e.preventDefault();
        }
        return;
      }

      // Arrow keys
      const current = currentSelection ?? -1;
      if (k === 'arrowright' || k === 'arrowdown') {
        const next = Math.min(current + 1, max - 1);
        if (next >= 0) {
          onPick(next);
          e.preventDefault();
        }
        return;
      }
      if (k === 'arrowleft' || k === 'arrowup') {
        const prev = Math.max(current - 1, 0);
        if (prev >= 0 && current >= 0) {
          onPick(prev);
          e.preventDefault();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [max, currentSelection, onPick]);
}
