'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  PenLine,
  FileSearch,
  Compass,
  MessageCircle,
  Brain,
  Linkedin,
  Palette,
  FilePlus,
  LayoutGrid,
  Tag,
  FileText,
  Newspaper,
  User as UserIcon,
} from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
};

type ToolItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string;
};

const PRIMARY_LINKS: NavLink[] = [
  { label: 'Hem', href: '/' },
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Priser', href: '/priser' },
  { label: 'Inspiration', href: '/exempel' },
  { label: 'Artiklar', href: '/artiklar' },
];

const TOOLS: ToolItem[] = [
  {
    label: 'Personligt brev',
    href: '/verktyg/personligt-brev',
    icon: PenLine,
    description: 'Brev som matchar annonsen från ditt CV',
  },
  {
    label: 'CV-analys',
    href: '/verktyg/cv-analys',
    icon: FileSearch,
    description: 'Konkret feedback för att passera ATS',
  },
  {
    label: 'CV-mallar',
    href: '/verktyg/cv-mallar',
    icon: Palette,
    description: 'Professionella ATS-säkra mallar',
  },
  {
    label: 'Skapa CV',
    href: '/verktyg/skapa-cv',
    icon: FilePlus,
    description: 'Bygg ditt CV på minuter',
  },
  {
    label: 'Jobbmatchning',
    href: '/verktyg/jobbmatchning',
    icon: Compass,
    description: 'Lediga jobb som matchar ditt CV',
  },
  {
    label: 'Jobbcoachen',
    href: '/verktyg/jobbcoachen',
    icon: MessageCircle,
    description: 'Karriärchatt med riktiga svar',
  },
  {
    label: 'Rekryteringstester',
    href: '/verktyg/rekryteringstester',
    icon: Brain,
    description: 'Träna inför rekryteringstester',
  },
  {
    label: 'LinkedIn-optimering',
    href: '/verktyg/linkedin-optimering',
    icon: Linkedin,
    description: 'Profilen som rekryterare hittar',
  },
];

const PRIMARY_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Hem: LayoutGrid,
  Funktioner: LayoutGrid,
  Priser: Tag,
  Inspiration: FileText,
  Artiklar: Newspaper,
  'Om oss': UserIcon,
};

export default function LandingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stäng mobilmenyn vid pathname-byte
  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  // Lås body-scroll när mobilmenyn är öppen
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-orange-100'
            : 'bg-white/80 backdrop-blur-lg border-b border-transparent'
        }`}
        style={
          scrolled
            ? { boxShadow: '0 4px 20px -8px rgba(249, 115, 22, 0.12)' }
            : undefined
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo — samma stil som SidebarLogo */}
            <Link
              href="/"
              className="group flex items-center"
              aria-label="Jobbcoach.ai start"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:opacity-90 transition-opacity">
                Jobbcoach
              </span>
              <span className="relative ml-1">
                <span
                  className="inline-block text-xl sm:text-2xl font-black text-white rounded-md px-1.5 py-0.5 leading-tight transition-transform group-hover:scale-105"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    boxShadow:
                      '0 4px 12px -2px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  .ai
                </span>
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-400 animate-pulse"
                  aria-hidden="true"
                />
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-orange-700 bg-orange-50'
                      : 'text-slate-700 hover:text-orange-700 hover:bg-orange-50/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Verktyg-dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  aria-expanded={toolsOpen}
                  className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                    toolsOpen ||
                    pathname.startsWith('/verktyg')
                      ? 'text-orange-700 bg-orange-50'
                      : 'text-slate-700 hover:text-orange-700 hover:bg-orange-50/60'
                  }`}
                >
                  Vad vi erbjuder
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      toolsOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-[480px] rounded-2xl bg-white border border-orange-100 overflow-hidden"
                      style={{
                        boxShadow:
                          '0 24px 48px -16px rgba(249, 115, 22, 0.22)',
                      }}
                    >
                      <div className="p-2 grid grid-cols-2 gap-1">
                        {TOOLS.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-50/60 transition-colors"
                          >
                            <div
                              className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-700 group-hover:bg-orange-100 transition-colors"
                            >
                              <tool.icon
                                className="w-[18px] h-[18px]"
                                strokeWidth={2.2}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-slate-900 leading-tight">
                                {tool.label}
                              </div>
                              <div className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                                {tool.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Footer-CTA i dropdown */}
                      <div className="border-t border-orange-100 p-3 bg-orange-50/40">
                        <Link
                          href="/funktioner"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800"
                        >
                          Se alla funktioner
                          <ArrowRight
                            className="w-3 h-3"
                            strokeWidth={2.5}
                          />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/om-oss"
                className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                  isActive('/om-oss')
                    ? 'text-orange-700 bg-orange-50'
                    : 'text-slate-700 hover:text-orange-700 hover:bg-orange-50/60'
                }`}
              >
                Om oss
              </Link>
            </nav>

            {/* Höger: auth-knappar (desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-orange-700 transition-colors"
              >
                Logga in
              </Link>
              <Link
                href="/register"
                data-cta="navbar-signup"
                className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02]"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow:
                    '0 8px 18px -6px rgba(220, 38, 38, 0.4)',
                }}
              >
                Skapa konto
                <ArrowRight
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </div>

            {/* Mobile-knappar */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/register"
                data-cta="navbar-mobile-signup"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-white font-bold text-xs transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow:
                    '0 4px 12px -3px rgba(220, 38, 38, 0.4)',
                }}
              >
                Skapa konto
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-700 transition-colors"
                aria-label="Öppna meny"
              >
                <Menu className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobil drawer — full-screen, sidebar-stil */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[88%] max-w-sm bg-gradient-to-b from-orange-50/40 via-white to-orange-50/30 border-l border-orange-100 lg:hidden flex flex-col"
            >
              {/* Header med logo + stäng */}
              <div className="px-4 py-4 flex items-center justify-between border-b border-orange-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center"
                >
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    Jobbcoach
                  </span>
                  <span className="relative ml-1">
                    <span
                      className="inline-block text-xl font-black text-white rounded-md px-1.5 py-0.5 leading-tight"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                        boxShadow:
                          '0 4px 12px -2px rgba(220, 38, 38, 0.4)',
                      }}
                    >
                      .ai
                    </span>
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-400"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-700 transition-colors"
                  aria-label="Stäng meny"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Navigation */}
              <nav
                className="flex-1 px-2 py-4 space-y-5 overflow-y-auto"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
                {/* Huvudmeny */}
                <ul className="space-y-1 px-1">
                  {[
                    ...PRIMARY_LINKS,
                    { label: 'Om oss', href: '/om-oss' },
                  ].map((link) => {
                    const Icon = PRIMARY_ICONS[link.label] ?? LayoutGrid;
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 min-h-[56px] transition-colors touch-manipulation ${
                            active
                              ? 'bg-gradient-to-r from-orange-50 to-rose-50/60'
                              : 'hover:bg-orange-50/60'
                          }`}
                        >
                          {active && (
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                              style={{
                                background:
                                  'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                              }}
                            />
                          )}

                          <span
                            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              active
                                ? 'text-white'
                                : 'text-orange-700 bg-orange-50 group-hover:bg-orange-100'
                            }`}
                            style={
                              active
                                ? {
                                    background:
                                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                                    boxShadow:
                                      '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                                  }
                                : undefined
                            }
                          >
                            <Icon
                              className="w-[18px] h-[18px]"
                              strokeWidth={2.2}
                            />
                          </span>

                          <span
                            className={`text-sm font-bold ${
                              active ? 'text-orange-900' : 'text-slate-700'
                            }`}
                          >
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Verktyg-sektion med eyebrow */}
                <div>
                  <div className="px-3 mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
                    Vad vi erbjuder
                  </div>
                  <ul className="space-y-1 px-1">
                    {TOOLS.map((tool) => (
                      <li key={tool.href}>
                        <Link
                          href={tool.href}
                          onClick={() => setMobileOpen(false)}
                          className="group flex items-center gap-3 rounded-xl px-2.5 py-2 min-h-[56px] hover:bg-orange-50/60 transition-colors touch-manipulation"
                        >
                          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-700 transition-colors">
                            <tool.icon
                              className="w-[18px] h-[18px]"
                              strokeWidth={2.2}
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700 leading-tight">
                              {tool.label}
                            </div>
                            <div className="text-[11px] text-slate-500 leading-snug mt-0.5 truncate">
                              {tool.description}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              {/* Footer med CTA — som Sidebar */}
              <div
                className="border-t border-orange-100 px-3 pt-3 space-y-2 bg-white/60 backdrop-blur-sm flex-shrink-0"
                style={{
                  paddingBottom:
                    'max(env(safe-area-inset-bottom, 0px) + 16px, 32px)',
                }}
              >
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  data-cta="navbar-mobile-drawer-primary"
                  className="relative overflow-hidden flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.01] group"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    boxShadow:
                      '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  Skapa konto
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.5}
                  />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-3 min-h-[48px] rounded-xl text-slate-700 hover:text-orange-700 hover:bg-orange-50/60 transition-colors text-sm font-bold"
                >
                  Logga in
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
