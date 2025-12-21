'use client';

import { ReactNode, useEffect, useState } from 'react';

/**
 * PageTransition - Subtil fade-in animation för sidor
 *
 * Design specs enligt plan:
 * - Typ: Crossfade (opacity only) - ingen transform/slide för snabb känsla
 * - Duration: 150ms
 * - Easing: ease-out
 * - Implementering: CSS (inte Framer Motion för prestanda)
 *
 * Användning:
 * ```tsx
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 150ms ease-out',
      }}
    >
      {children}
    </div>
  );
}
