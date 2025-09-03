'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
  isActive?: boolean;
}

interface TableOfContentsProps {
  toc?: TOCItem[];
  maxLevel?: number;
  title?: string;
}

/**
 * Komponent för att visa en automatisk innehållsförteckning för artiklar
 * Kan användas på två sätt:
 * 1. Med fördefinierad TOC genom props (från serverkomponent)
 * 2. Automatiskt genom att skanna sidan efter rubriker (i klientkomponent)
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  toc: propsToc, 
  maxLevel = 3, 
  title = "Innehåll" 
}) => {
  const [toc, setToc] = useState<TOCItem[]>(propsToc || []);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string>("");
  const pathname = usePathname();
  const observer = useRef<IntersectionObserver | null>(null);

  // Om ingen TOC ges via props, generera en genom att skanna sidan
  useEffect(() => {
    if (propsToc) {
      setToc(propsToc);
      return;
    }

    // Hitta alla h2-h4 i artikeln
    const articleElement = document.querySelector('article');
    if (!articleElement) return;
    
    const headings = Array.from(articleElement.querySelectorAll('h2, h3, h4')).filter(
      el => el.id && el.textContent
    );

    if (headings.length === 0) return;

    const extractedToc: TOCItem[] = headings.map((heading) => {
      const level = parseInt(heading.tagName.substring(1), 10);
      if (level > maxLevel) return null;

      return {
        id: heading.id,
        text: heading.textContent || '',
        level: level,
      };
    }).filter(Boolean) as TOCItem[];

    setToc(extractedToc);
  }, [propsToc, maxLevel, pathname]);

  // Spåra aktiv rubrik baserat på scroll-position
  useEffect(() => {
    if (toc.length === 0) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    // Skapa en IntersectionObserver för att spåra synliga rubriker
    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '0px 0px -80% 0px', // Trigga när rubriken är i övre delen av skärmen
      threshold: 0.1
    });

    // Observera alla rubriker
    const headingElements = toc.map(heading => 
      document.getElementById(heading.id)
    ).filter(Boolean);

    headingElements.forEach(el => {
      if (el) observer.current?.observe(el);
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [toc]);

  // Om ingen TOC att visa, visa ingenting
  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="table-of-contents bg-navy-900 rounded-lg border border-navy-700/70 shadow-md mb-8">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer border-b border-navy-700/70"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-semibold text-white flex items-center">
          <List className="w-5 h-5 mr-2 text-pink-500" />
          {title}
        </h4>
        <button 
          aria-label={isExpanded ? "Dölj innehåll" : "Visa innehåll"}
          className="text-gray-400 hover:text-pink-500 transition-colors"
        >
          {isExpanded ? 
            <ChevronUp className="w-5 h-5" /> : 
            <ChevronDown className="w-5 h-5" />
          }
        </button>
      </div>

      {isExpanded && (
        <nav className="p-4" aria-label="Innehållsförteckning" role="navigation">
          <ul className="space-y-2">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              // Beräkna indrag baserat på rubriknivå
              const indent = (item.level - 2) * 16; // h2=0, h3=16, h4=32px indrag
              
              return (
                <li 
                  key={item.id} 
                  style={{ marginLeft: `${indent}px` }}
                  className="transition-all duration-200"
                >
                  <Link
                    href={`#${item.id}`}
                    className={`
                      text-sm hover:text-pink-400 transition-colors duration-200
                      ${isActive 
                        ? 'text-pink-500 font-medium' 
                        : 'text-gray-300'
                      }
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        // Scroll till elementet med lite offset för navbar
                        const yOffset = -80; 
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                        setActiveId(item.id);
                      }
                    }}
                    aria-current={isActive ? "location" : undefined}
                  >
                    {item.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;