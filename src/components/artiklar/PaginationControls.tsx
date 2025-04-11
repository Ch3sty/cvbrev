// src/components/artiklar/PaginationControls.tsx
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  tag?: string; // Optional tag för att bevara filter
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  tag,
}) => {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Funktion för att bygga URL med sidnummer och eventuell tagg
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

  // Stil för aktiva/inaktiva länkar
  const linkClass = "flex items-center justify-center px-4 py-2 border border-navy-600 rounded-md bg-navy-800 text-gray-300 hover:bg-navy-700 hover:border-pink-500/50 hover:text-pink-400 transition-colors duration-200";
  const disabledLinkClass = "flex items-center justify-center px-4 py-2 border border-navy-700 rounded-md bg-navy-800/50 text-gray-600 cursor-not-allowed";

  return (
    <nav className="flex items-center justify-between mt-8 pt-8 border-t border-navy-700/50" aria-label="Paginering">
      {/* Föregående knapp */}
      {hasPrevPage ? (
        <Link href={prevPageUrl} className={linkClass} aria-label="Föregående sida">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Föregående
        </Link>
      ) : (
        <span className={disabledLinkClass} aria-disabled="true">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Föregående
        </span>
      )}

      {/* Sidinformation */}
      <span className="text-sm text-gray-400">
        Sida <span className="font-medium text-white">{currentPage}</span> av <span className="font-medium text-white">{totalPages}</span>
      </span>

      {/* Nästa knapp */}
      {hasNextPage ? (
        <Link href={nextPageUrl} className={linkClass} aria-label="Nästa sida">
          Nästa
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      ) : (
        <span className={disabledLinkClass} aria-disabled="true">
          Nästa
          <ArrowRight className="w-4 h-4 ml-2" />
        </span>
      )}
    </nav>
  );
};

export default PaginationControls;