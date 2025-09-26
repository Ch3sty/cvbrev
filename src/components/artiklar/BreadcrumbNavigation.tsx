'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbNavigationProps {
  articleTitle: string;
  articleSlug: string;
}

export default function BreadcrumbNavigation({ articleTitle, articleSlug }: BreadcrumbNavigationProps) {
  const breadcrumbs = [
    { name: 'Hem', href: '/', icon: Home },
    { name: 'Artiklar', href: '/artiklar' },
    { name: articleTitle, href: `/artiklar/${articleSlug}`, current: true }
  ];

  // Schema.org BreadcrumbList markup
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.current ? undefined : `https://jobbcoach.ai${item.href}`
    }))
  };

  return (
    <>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6"
      >
        <motion.ol
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2 text-sm"
        >
          {breadcrumbs.map((item, index) => (
            <li key={item.name} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
              )}

              {item.current ? (
                <span
                  className="font-medium text-gray-700 truncate max-w-xs"
                  aria-current="page"
                  title={item.name}
                >
                  {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="group flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors duration-200"
                >
                  {item.icon && (
                    <item.icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <span className="group-hover:underline underline-offset-2">
                    {item.name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </motion.ol>
      </nav>

      {/* Mobile-optimized breadcrumb */}
      <nav
        aria-label="Breadcrumb mobile"
        className="md:hidden mb-4"
      >
        <Link
          href="/artiklar"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Tillbaka till artiklar</span>
        </Link>
      </nav>
    </>
  );
}