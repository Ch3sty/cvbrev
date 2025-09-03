// components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect, Fragment, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import { useProfile } from '@/hooks/use-profile'; // Importera useProfile

// --- Icon Imports (Lucide React) ---
import {
  User as UserIcon,
  LogOut,
  FileText, // För Mina Brev
  Edit3, // För Skapa Brev
  Menu as MenuIcon,
  X,
  SearchCheck, // För CV-Analys
  GraduationCap, // För Kompetensutveckling
  Palette, // För CV-Mallar
  Wrench,      // För Verktyg Dropdown
  Users,       // För Om Oss (mobil)
  HelpCircle,  // För Kontakt (mobil)
  LayoutGrid,  // För Funktioner
  Tag,         // För Priser
  Home,
  Lock, // Behålls för mobil
  Loader2,
  ChevronDown,
  Newspaper,
  LogIn // För CTA-knapp
} from 'lucide-react'

// --- Data Definition för Navigationslänkar ---
interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ElementType;
  requireLogin?: boolean;
  isSpecial?: boolean;
  isPrimaryDesktop?: boolean;
  isMobileOnly?: boolean;
}

// Uppdelade länkar för bättre struktur
const primaryNavLinks: NavLinkItem[] = [
  { href: '/', label: 'Hem', icon: Home, isPrimaryDesktop: true },
  { href: '/funktioner', label: 'Funktioner', icon: LayoutGrid, isPrimaryDesktop: true },
  { href: '/priser', label: 'Priser', icon: Tag, isPrimaryDesktop: true },
  { href: '/artiklar', label: 'Artiklar', icon: Newspaper, isPrimaryDesktop: true },
];

const toolLinks: NavLinkItem[] = [
  { href: '/create-letter', label: 'Skapa personligt brev', icon: Edit3, requireLogin: true, isSpecial: true },
  { href: '/cv-mallar', label: 'CV-Mallar', icon: Palette, requireLogin: false, isSpecial: true },
  { href: '/analysera-cv', label: 'CV-Analys', icon: SearchCheck, requireLogin: true, isSpecial: true },
  { href: '/kompetensutveckling', label: 'Kompetensutveckling', icon: GraduationCap, requireLogin: true, isSpecial: true },
];

const myLettersLink: NavLinkItem = { href: '/my-letters', label: 'Mina Brev', icon: FileText, requireLogin: true, isSpecial: true };

const mobileOnlyLinks: NavLinkItem[] = [
  { href: '/om-oss', label: 'Om Oss', icon: Users, isMobileOnly: true },
  { href: '/kontakt', label: 'Kontakt', icon: HelpCircle, isMobileOnly: true },
];

const loggedInUserProfileLinks = [
    { href: '/profile', label: 'Min Profil', icon: UserIcon },
];


// --- Navbar Component ---
export default function Navbar() {
  const [sessionUser, setSessionUser] = useState<SupabaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const {
      savedLettersCount,
      loading: profileLoading
  } = useProfile();

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const isLoading = isLoadingAuth || profileLoading;

  // ========================================================================
  // Effects
  // ========================================================================
  useEffect(() => {
    const getUserSession = async () => {
        setIsLoadingAuth(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSessionUser(session?.user ?? null);
        setIsLoadingAuth(false);
    }
    getUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoadingAuth(true);
        setSessionUser(session?.user ?? null);
        setIsLoadingAuth(false);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // ========================================================================
  // Funktioner
  // ========================================================================
  const handleSignOut = async () => {
    setIsLoadingAuth(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // --- Hjälpfunktion för att rendera EN navigeringslänk ---
  // UPPDATERAD: Tar emot savedLettersCount, tar bort onödig 'router' dependency
  const renderSingleNavLink = useCallback((
      link: NavLinkItem,
      isMobile = false,
      closeMobileMenu?: () => void,
      currentSavedLettersCount?: number | null
      ) => {
    const linkBaseClass = isMobile
      ? "flex items-center px-3 py-2.5 rounded-lg text-base font-medium"
      : "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
    const activeClass = isMobile ? "bg-navy-700/60 text-pink-400" : "text-pink-400";
    const inactiveClass = isMobile ? "text-gray-300 hover:bg-navy-700/50 hover:text-white" : "text-gray-300 hover:text-white";
    const specialActiveClass = isMobile ? "bg-navy-700/60 text-pink-300 font-semibold" : "text-pink-300 font-semibold";
    const specialInactiveClass = isMobile ? "text-pink-400 hover:bg-navy-700/50 hover:text-pink-300 font-medium" : "text-pink-400 hover:text-pink-300";
    const lockedInactiveClass = isMobile ? "text-gray-500 hover:bg-navy-700/50 hover:text-gray-400" : "text-gray-500 hover:text-gray-400";

    const iconSize = isMobile ? 18 : 16;
    const iconMargin = "mr-2.5";

    const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));
    const isUserLoggedIn = !!sessionUser;

    const isLinkActive = isActive(link.href);
    const needsLogin = !!link.requireLogin;
    const isLocked = needsLogin && !isUserLoggedIn;

    const effectiveHref = (isLocked && (isMobile || link.isPrimaryDesktop))
        ? `/register?redirect=${encodeURIComponent(link.href)}`
        : link.href;

    const title = (isLocked && (isMobile || link.isPrimaryDesktop))
        ? "Logga in eller skapa konto för att använda funktionen"
        : undefined;

    const lockIcon = (isLocked && (isMobile || link.isPrimaryDesktop))
        ? <Lock className="w-3 h-3 ml-1.5 text-gray-600 flex-shrink-0" />
        : null;

    const getIconColor = () => {
        if (isLocked && (isMobile || link.isPrimaryDesktop)) return 'text-gray-600';
        if (isLinkActive) return link.isSpecial ? 'text-pink-300' : 'text-pink-400';
        if (isMobile) return 'text-gray-400';
        if (link.isSpecial) return 'text-pink-400';
        return 'text-gray-400';
    };
    const iconColor = getIconColor();

    let linkClasses = linkBaseClass;
    if (isLinkActive && !isLocked) {
        linkClasses += ` ${link.isSpecial ? specialActiveClass : activeClass}`;
    } else if (isLocked && (isMobile || link.isPrimaryDesktop)) {
        linkClasses += ` ${lockedInactiveClass}`;
        if (!isMobile && link.isPrimaryDesktop) { linkClasses += ' cursor-not-allowed'; }
    } else {
        if (link.isSpecial && isUserLoggedIn) { linkClasses += ` ${specialInactiveClass}`; }
        else if (link.isSpecial && !isUserLoggedIn && !isMobile){ linkClasses += ` ${inactiveClass}`; }
        else { linkClasses += ` ${inactiveClass}`; }
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
       if (closeMobileMenu) { closeMobileMenu(); }
    };

    return (
      <Link
        key={link.href}
        href={effectiveHref}
        className={linkClasses}
        onClick={handleClick}
        aria-current={isLinkActive && !isLocked ? 'page' : undefined}
        title={title}
        aria-disabled={(isLocked && (isMobile || link.isPrimaryDesktop)) || undefined}
      >
        <link.icon size={iconSize} className={`${iconMargin} flex-shrink-0 ${iconColor}`} aria-hidden="true" />
        <span className="flex-grow">{link.label}</span>

        {link.href === '/my-letters' && isMobile && isUserLoggedIn && currentSavedLettersCount !== null && (
            <span className="ml-auto text-xs bg-pink-800/80 text-pink-200 rounded-full px-2 py-0.5 font-medium">
                {currentSavedLettersCount}
            </span>
        )}
        {lockIcon}
      </Link>
    );
  // <<<--- ESLint Fix: 'router' borttagen från dependencies ---<<<
  }, [pathname, sessionUser]);


  // ========================================================================
  // JSX Render
  // ========================================================================
  return (
    <Disclosure as="nav" className="bg-navy-950/80 backdrop-blur-lg border-b border-navy-700/50 sticky top-0 z-50 shadow-md">
      {({ open: mobileMenuIsOpen, close: closeMobileMenu }) => (
        <>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logotyp */}
              <Link href="/" className="flex-shrink-0 flex items-center space-x-px" onClick={() => { if (mobileMenuIsOpen) closeMobileMenu(); }}>
                 <span className="text-2xl font-bold text-white hover:opacity-90 transition-opacity">Jobbcoach</span>
                 <span className="text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-1.5 py-0.5 ml-1 leading-tight hover:opacity-90 transition-opacity shadow-sm">.ai</span>
              </Link>

              {/* --- Desktop Nav (Med Dropdown) --- */}
              <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                {/* Primära länkar */}
                {primaryNavLinks.map((link) => renderSingleNavLink(link, false))}

                {/* Verktyg Dropdown */}
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      {/* ... Menu.Button oförändrad ... */}
                      <Menu.Button className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 group ${open ? 'text-pink-400' : 'text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950'}`}> <Wrench size={16} className="mr-1.5 text-pink-400 group-hover:text-pink-300 transition-colors" aria-hidden="true" /> Verktyg <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${open ? 'transform rotate-180 text-pink-300' : 'text-gray-400'}`} aria-hidden="true" /> </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        {/* Verktygsdropdown */}
                        <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-left rounded-xl shadow-lg bg-navy-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-navy-700/50 py-1 z-50">
                          {!isLoading && sessionUser && (
                            <>
                              {/* Skapa personligt brev */}
                              {toolLinks.find(link => link.href === '/create-letter') && (
                                <Menu.Item key={toolLinks.find(link => link.href === '/create-letter')!.href}>
                                  {/* Använder INTE render prop här för att undvika typfel, stylar Link direkt */}
                                  <Link href={toolLinks.find(l => l.href === '/create-letter')!.href} className="flex items-center w-full px-4 py-2.5 text-sm text-left rounded-md mx-1 transition-colors duration-100 text-gray-300 ui-active:bg-navy-700/60 ui-active:text-white hover:bg-navy-700/50 hover:text-white">
                                    <Edit3 size={16} className="mr-2.5 flex-shrink-0 text-gray-400 ui-active:text-white" aria-hidden="true" />
                                    <span className="flex-grow">{toolLinks.find(l => l.href === '/create-letter')!.label}</span>
                                  </Link>
                                </Menu.Item>
                              )}

                              {/* Mina Brev med antal */}
                              <Menu.Item key={myLettersLink.href}>
                                {/* Använder INTE render prop här */}
                                <Link href={myLettersLink.href} className="flex items-center w-full px-4 py-2.5 text-sm text-left rounded-md mx-1 transition-colors duration-100 text-gray-300 ui-active:bg-navy-700/60 ui-active:text-white hover:bg-navy-700/50 hover:text-white">
                                    <FileText size={16} className="mr-2.5 flex-shrink-0 text-gray-400 ui-active:text-white" aria-hidden="true" />
                                    <span className="flex-grow">{myLettersLink.label}</span>
                                    {!profileLoading && savedLettersCount !== null && (
                                        <span className={`ml-auto text-xs rounded-full px-2 py-0.5 font-medium bg-pink-800/80 text-pink-200 ui-active:bg-pink-600/90 ui-active:text-white`}>
                                            {savedLettersCount}
                                        </span>
                                    )}
                                     {profileLoading && ( <Loader2 className="w-3 h-3 ml-auto text-pink-400 animate-spin" /> )}
                                </Link>
                              </Menu.Item>

                              {/* Divider */}
                              {toolLinks.filter(link => link.href !== '/create-letter').length > 0 && (
                                <div className="my-1 px-1"> <hr className="border-t border-navy-700/50" /> </div>
                              )}

                              {/* Övriga verktyg */}
                              {toolLinks.filter(link => link.href !== '/create-letter').map((toolLink) => (
                                <Menu.Item key={toolLink.href}>
                                   {/* Använder INTE render prop här */}
                                  <Link href={toolLink.href} className="flex items-center w-full px-4 py-2.5 text-sm text-left rounded-md mx-1 transition-colors duration-100 text-gray-300 ui-active:bg-navy-700/60 ui-active:text-white hover:bg-navy-700/50 hover:text-white">
                                    <toolLink.icon size={16} className="mr-2.5 flex-shrink-0 text-gray-400 ui-active:text-white" aria-hidden="true" />
                                    <span className="flex-grow">{toolLink.label}</span>
                                  </Link>
                                </Menu.Item>
                              ))}
                            </>
                          )}

                          {/* CTA om inte inloggad */}
                          {!isLoading && !sessionUser && ( <> {/* ... CTA oförändrad ... */} <div className="px-4 py-3 text-sm text-gray-400">Logga in eller skapa konto för att komma åt verktygen.</div> <div className="my-1 px-1"> <hr className="border-t border-navy-700/50" /> </div> <div className="px-2 pt-2 pb-3"> <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-lg text-center"> <p className="text-sm text-purple-100 font-medium mb-3"> Bli medlem för att använda verktygen! </p> <Link href="/register" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-white/20 rounded-md hover:bg-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-700"> <LogIn size={16} className="mr-2" /> Skapa konto gratis </Link> </div> </div> </> )}
                          {/* Global laddningsindikator */}
                          {isLoading && ( <div className="flex items-center justify-center p-4"> <Loader2 className="w-5 h-5 text-pink-500 animate-spin" /> </div> )}
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>

              {/* --- Desktop User/Auth Area --- */}
              <div className="hidden md:flex items-center space-x-3">
                {isLoading ? ( <div className="flex items-center justify-center w-8 h-8"><Loader2 className="w-5 h-5 text-pink-500 animate-spin" /></div> )
                : sessionUser ? (
                  <Menu as="div" className="relative">
                    <div> <Menu.Button className="flex items-center text-sm rounded-full text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 focus:ring-pink-500 transition"> <span className="sr-only">Öppna användarmeny</span> <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-gradient-to-br from-pink-600 to-purple-600 rounded-full ring-2 ring-navy-700"> {sessionUser.email?.charAt(0).toUpperCase() ?? '?'} </span> <span className="hidden lg:inline ml-2 text-xs">{sessionUser.email}</span> <ChevronDown className="w-4 h-4 ml-1 text-gray-400 hidden lg:inline" /> </Menu.Button> </div>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                      {/* <<<--- TYPFIX: Använder INTE render prop för profil-länkarna ---<<< */}
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl shadow-lg bg-navy-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-navy-700/50 py-1 z-50">
                        <div className="px-4 py-2 border-b border-navy-700/50 mb-1"> <p className="text-xs text-gray-400">Inloggad som:</p> <p className="text-sm font-medium text-gray-100 truncate">{sessionUser.email}</p> </div>
                        {loggedInUserProfileLinks.map(item => (
                            <Menu.Item key={item.href}>
                              {/* Placera Link direkt som barn */}
                              <Link
                                href={item.href}
                                className="flex items-center px-4 py-2 text-sm w-full rounded-md mx-1 text-gray-300 ui-active:bg-navy-700/50 ui-active:text-white hover:bg-navy-700/50 hover:text-white transition-colors duration-100"
                              >
                                <item.icon className="w-4 h-4 mr-2.5 text-gray-400 ui-active:text-white" aria-hidden="true" />
                                {item.label}
                              </Link>
                            </Menu.Item>
                        ))}
                        <div className="my-1 px-1"><hr className="border-t border-navy-700/50" /></div>
                        <Menu.Item>
                          {/* För knappar är render prop oftast ok, men vi kan använda ui-attribut här också om vi vill vara konsekventa */}
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`flex items-center w-full px-4 py-2 text-sm rounded-md mx-1 transition-colors duration-100 ${ active ? 'bg-navy-700/50 text-red-300' : 'text-red-400' } hover:bg-navy-700/50 hover:text-red-300`}
                            >
                              <LogOut className="w-4 h-4 mr-2.5" aria-hidden="true" /> Logga ut
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  // Logga in / Skapa konto knappar
                  <> <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-300 bg-navy-800 border border-navy-700 rounded-lg hover:bg-navy-700 hover:text-white transition-colors shadow-sm"> Logga in </Link> <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"> Skapa konto </Link> </>
                )}
              </div>

              {/* --- Mobilmenyknapp --- */}
              <div className="flex items-center md:hidden"> <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 transition"> <span className="sr-only">Öppna huvudmeny</span> {mobileMenuIsOpen ? ( <X className="block h-6 w-6" aria-hidden="true" /> ) : ( <MenuIcon className="block h-6 w-6" aria-hidden="true" /> )} </Disclosure.Button> </div>

            </div>
          </div>

          {/* --- Mobilmeny Panel --- */}
          <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
            <Disclosure.Panel className="md:hidden border-t border-navy-700/50 bg-navy-900 shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {/* Primära länkar */}
                {primaryNavLinks.map(link => renderSingleNavLink(link, true, closeMobileMenu))}

                {/* Mobil Verktyg */}
                <div className="pt-2">
                    <h3 className="px-3 text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1">Verktyg</h3>
                    {toolLinks.find(link => link.href === '/create-letter') && renderSingleNavLink(toolLinks.find(link => link.href === '/create-letter')!, true, closeMobileMenu)}
                    {/* Skicka med savedLettersCount till Mina Brev */}
                    {renderSingleNavLink(myLettersLink, true, closeMobileMenu, savedLettersCount)}
                    {toolLinks.filter(link => link.href !== '/create-letter').map(link => renderSingleNavLink(link, true, closeMobileMenu))}
                </div>

                {/* Mobil-specifika info */}
                 <div className="pt-2 border-t border-navy-700/30 mt-2"> {mobileOnlyLinks.map(link => renderSingleNavLink(link, true, closeMobileMenu))} </div>
              </div>
              {/* Mobil User/Auth Area */}
              <div className="pt-4 pb-3 border-t border-navy-700/50">
                 {isLoading ? ( <div className="flex items-center px-5"><div className="h-8 w-8 bg-navy-800 rounded-full animate-pulse mr-3 flex-shrink-0"></div><div className="h-5 w-32 bg-navy-800 rounded animate-pulse"></div></div> )
                 : sessionUser ? (
                  <div className="px-5 space-y-3"> <div className="flex items-center"> <span className="flex items-center justify-center w-9 h-9 text-base font-semibold text-white bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex-shrink-0 ring-2 ring-navy-700"> {sessionUser.email?.charAt(0).toUpperCase() ?? '?'} </span> <div className="ml-3 min-w-0"> <div className="text-sm font-medium text-gray-200 truncate">{sessionUser.email}</div> </div> </div> <div className="mt-3 space-y-1 border-t border-navy-700/50 pt-3"> {loggedInUserProfileLinks.map(item => ( <Link key={item.href} href={item.href} className="flex items-center px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-navy-700/50 hover:text-white" onClick={() => closeMobileMenu()} > <item.icon className="w-5 h-5 mr-3 text-gray-400" aria-hidden="true"/> {item.label} </Link> ))} <div className="my-1"><hr className="border-t border-navy-700/30" /></div> <button onClick={() => { handleSignOut(); closeMobileMenu(); }} className="flex items-center w-full px-3 py-2 text-base font-medium text-red-400 rounded-md hover:bg-navy-700/50 hover:text-red-300" > <LogOut className="w-5 h-5 mr-3" aria-hidden="true"/> Logga ut </button> </div> </div>
                 ) : (
                  <div className="px-2 space-y-2 sm:px-3"> <Link href="/login" onClick={() => closeMobileMenu()} className="block w-full text-center px-4 py-2 text-base font-medium text-gray-300 bg-navy-800 border border-navy-700 rounded-lg hover:bg-navy-700 hover:text-white transition-colors"> Logga in </Link> <Link href="/register" onClick={() => closeMobileMenu()} className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"> Skapa konto </Link> </div>
                 )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}