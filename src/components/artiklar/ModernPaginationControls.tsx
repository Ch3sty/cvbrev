import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ModernPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  tag?: string;
}

const ModernPaginationControls: React.FC<ModernPaginationControlsProps> = ({
  currentPage,
  totalPages,
  tag,
}) => {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Build URL with page number and optional tag
  const buildPageUrl = (page: number): string => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (tag) {
      params.set('tag', tag);
    }
    return `/artiklar?${params.toString()}`;
  };

  const prevPageUrl = hasPrevPage ? buildPageUrl(currentPage - 1) : '#';
  const nextPageUrl = hasNextPage ? buildPageUrl(currentPage + 1) : '#';

  // Generate page numbers to show
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page range, and last page
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-200"
      aria-label="Paginering"
    >
      {/* Previous Button */}
      <div className="order-2 sm:order-1">
        {hasPrevPage ? (
          <Link
            href={prevPageUrl}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-pink-600 hover:border-pink-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Föregående sida"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Föregående
          </Link>
        ) : (
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Föregående
          </span>
        )}
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={buildPageUrl(pageNum)}
              className={`
                inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                ${isCurrentPage
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300'
                }
              `}
              aria-label={`Gå till sida ${pageNum}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      <div className="order-3">
        {hasNextPage ? (
          <Link
            href={nextPageUrl}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-pink-600 hover:border-pink-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Nästa sida"
          >
            Nästa
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        ) : (
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
            Nästa
            <ArrowRight className="w-4 h-4 ml-2" />
          </span>
        )}
      </div>

      {/* Page Info - Mobile Only */}
      <div className="order-4 sm:hidden text-center">
        <span className="text-sm text-gray-500">
          Sida <span className="font-medium text-gray-900">{currentPage}</span> av <span className="font-medium text-gray-900">{totalPages}</span>
        </span>
      </div>
    </nav>
  );
};

export default ModernPaginationControls;