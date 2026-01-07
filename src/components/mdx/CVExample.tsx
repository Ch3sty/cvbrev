'use client';

import React from 'react';

interface CVExampleProps {
  title?: string;
  description?: string;
  showCV?: boolean; // Ignoreras men tillåts för bakåtkompatibilitet
  children: React.ReactNode;
}

export default function CVExample({ title, description, children }: CVExampleProps) {
  return (
    <div className="my-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm not-prose">
      {(title || description) && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          {title && (
            <p className="text-sm font-medium text-slate-700">{title}</p>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="p-5 bg-white">
        <div className="prose prose-sm prose-slate max-w-none
          prose-headings:font-bold prose-headings:text-slate-900
          prose-h1:text-xl prose-h1:mb-2 prose-h1:mt-0
          prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-1
          prose-h3:text-base prose-h3:mb-1 prose-h3:mt-3
          prose-p:my-1 prose-p:text-slate-700
          prose-strong:text-slate-900 prose-strong:font-semibold
          prose-ul:my-2 prose-ul:pl-4
          prose-li:my-0.5 prose-li:text-slate-700
          prose-hr:my-3 prose-hr:border-slate-200
          [&>*:first-child]:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
