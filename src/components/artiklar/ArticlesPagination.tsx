import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticlesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  itemsPerPage: number;
  tag?: string;
}

export default function ArticlesPagination({
  currentPage,
  totalPages,
  totalPosts,
  itemsPerPage,
  tag,
}: ArticlesPaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (tag) params.set('tag', tag);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `/artiklar?${qs}` : '/artiklar';
  };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalPosts);

  // Beräkna vilka sidor att visa (max 5 + ellipsis)
  const pages: (number | 'ellipsis')[] = [];
  const range = 1; // hur många sidor att visa runt current
  const minPage = Math.max(2, currentPage - range);
  const maxPage = Math.min(totalPages - 1, currentPage + range);

  pages.push(1);
  if (minPage > 2) pages.push('ellipsis');
  for (let i = minPage; i <= maxPage; i++) pages.push(i);
  if (maxPage < totalPages - 1) pages.push('ellipsis');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="space-y-4">
      {/* Visar X-Y av Z */}
      <div className="text-center text-xs sm:text-sm text-slate-600">
        Visar <span className="font-bold text-slate-900 tabular-nums">{start}–{end}</span>{' '}
        av <span className="font-bold text-slate-900 tabular-nums">{totalPosts}</span> artiklar
      </div>

      {/* Pagination-kontroller */}
      <nav className="flex items-center justify-center gap-1.5 sm:gap-2" aria-label="Paginering">
        {/* Föregående */}
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors touch-manipulation"
            aria-label="Föregående sida"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        ) : (
          <span
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            aria-disabled="true"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </span>
        )}

        {/* Sid-nummer */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((page, idx) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex items-center justify-center w-8 h-10 text-slate-400 text-sm"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <Link
                key={page}
                href={buildHref(page)}
                className={`inline-flex items-center justify-center min-w-[40px] sm:min-w-[44px] h-10 sm:h-11 px-2 rounded-xl font-bold text-sm tabular-nums transition-colors touch-manipulation ${
                  isActive
                    ? 'text-white'
                    : 'border border-orange-200 bg-white text-slate-700 hover:bg-orange-50 hover:border-orange-300'
                }`}
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.4)',
                      }
                    : undefined
                }
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Sida ${page}`}
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* Nästa */}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors touch-manipulation"
            aria-label="Nästa sida"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        ) : (
          <span
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            aria-disabled="true"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </span>
        )}
      </nav>
    </div>
  );
}
