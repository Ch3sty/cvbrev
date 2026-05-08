'use client';

import { ReactNode } from 'react';

interface CvMallarLayoutProps {
  children: ReactNode;
}

export default function CvMallarLayout({ children }: CvMallarLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto py-2 sm:py-6 pb-32 sm:pb-20 space-y-6 sm:space-y-8 px-1 sm:px-0">
      {children}
    </div>
  );
}
