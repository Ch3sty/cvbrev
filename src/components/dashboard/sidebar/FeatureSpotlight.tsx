'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useUnusedFeatures } from '@/hooks/useUnusedFeatures';

interface FeatureSpotlightProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function FeatureSpotlight({ isMobile, onLinkClick }: FeatureSpotlightProps) {
  const { feature, loading, dismiss } = useUnusedFeatures();

  if (loading || !feature) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss(feature.slug);
  };

  return (
    <div
      key={feature.slug}
      className="relative overflow-hidden rounded-xl text-white mx-2 bg-orange-600 motion-safe:animate-[slideUp_300ms_ease-out_both]"
    >
        {/* Prick-pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          aria-hidden="true"
        >
          <pattern
            id="spotlight-dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#spotlight-dots)" />
        </svg>

        {/* Skip-knapp */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm z-10"
          aria-label="Dölj förslag"
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
        </button>

        <Link
          href={feature.href}
          prefetch={true}
          onClick={() => isMobile && onLinkClick?.()}
          className="block relative p-4 group"
        >
          <div className="text-xs font-bold uppercase tracking-[0.18em] mb-1.5 opacity-90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" aria-hidden="true" />
            {feature.eyebrow}
          </div>

          <h3 className="font-bold text-base leading-tight mb-1.5 pr-6">
            {feature.title}
          </h3>

          <p className="text-xs opacity-95 leading-relaxed mb-3">
            {feature.description}
          </p>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1.5 group-hover:bg-white/25 transition-colors">
            {feature.cta}
            <ArrowRight
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </div>
        </Link>
    </div>
  );
}
