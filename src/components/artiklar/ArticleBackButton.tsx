'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ArticleShare from './ArticleShare';

interface ArticleBackButtonProps {
  shareTitle: string;
  shareUrl: string;
}

export default function ArticleBackButton({ shareTitle, shareUrl }: ArticleBackButtonProps) {
  return (
    <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-orange-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <Link
          href="/artiklar"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-orange-700 hover:text-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-600 bg-orange-50 border border-orange-100 hover:border-transparent transition-all duration-200 font-semibold text-sm group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
          Tillbaka till alla artiklar
        </Link>

        <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
            Hjälpte artikeln?
          </span>
          <ArticleShare
            title={shareTitle}
            url={shareUrl}
            size="sm"
            showLabel={false}
          />
        </div>
      </div>
    </div>
  );
}
