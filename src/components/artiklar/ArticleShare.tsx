'use client';

import { useState } from 'react';
import { Linkedin, Twitter, Facebook, Check, Link2 } from 'lucide-react';

interface ArticleShareProps {
  title: string;
  url: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const NETWORKS = [
  {
    id: 'linkedin' as const,
    label: 'LinkedIn',
    Icon: Linkedin,
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter' as const,
    label: 'X / Twitter',
    Icon: Twitter,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'facebook' as const,
    label: 'Facebook',
    Icon: Facebook,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export default function ArticleShare({ title, url, size = 'md', showLabel = true }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (network: (typeof NETWORKS)[number]) => {
    const shareUrl = network.href(url, title);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback om clipboard inte är tillgängligt
    }
  };

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {showLabel && (
        <span className="text-xs sm:text-sm font-medium text-slate-500 mr-1 hidden sm:inline">
          Dela:
        </span>
      )}
      {NETWORKS.map((network) => (
        <button
          key={network.id}
          onClick={() => handleShare(network)}
          className={`${buttonSize} rounded-xl flex items-center justify-center text-slate-600 bg-orange-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-600 hover:text-white border border-orange-100 hover:border-transparent transition-all duration-200 touch-manipulation`}
          aria-label={`Dela på ${network.label}`}
        >
          <network.Icon className={iconSize} strokeWidth={2.2} />
        </button>
      ))}
      <button
        onClick={handleCopy}
        className={`${buttonSize} rounded-xl flex items-center justify-center text-slate-600 bg-orange-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-600 hover:text-white border border-orange-100 hover:border-transparent transition-all duration-200 touch-manipulation`}
        aria-label={copied ? 'Länken kopierad!' : 'Kopiera länken'}
      >
        {copied ? (
          <Check className={iconSize} strokeWidth={2.5} />
        ) : (
          <Link2 className={iconSize} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
