import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Brödsmulor"
      className="border-b border-orange-100/70 bg-white/80 backdrop-blur-sm"
    >
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-6xl">
        <ol className="flex items-center gap-1.5 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight
                    className="w-3.5 h-3.5 text-orange-300 flex-shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-orange-700 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? 'text-slate-900 font-bold'
                        : 'text-slate-600 font-medium'
                    }
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
