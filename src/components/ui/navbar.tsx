'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client' // Justera sökväg vid behov
import { useRouter, usePathname } from 'next/navigation'
import {
  User,
  LogOut,
  FileText,
  Edit3,
  Menu,
  X,
  // BookOpen, // Oanvänd
  SearchCheck
} from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Effekt för att hämta användare och lyssna på auth-ändringar
  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    getUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
            setIsUserDropdownOpen(false);
            setIsMobileMenuOpen(false);
        }
      }
    )
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

   // Effekt för att stänga dropdown vid klick utanför
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isUserDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, isUserDropdownOpen]);

  // Utloggningsfunktion
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsUserDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  // Funktion för att stänga båda menyerna
  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }

  // --- Funktion för att rendera navigeringslänkar ---
  const renderNavLinks = (isMobile = false) => {
    const linkBaseClass = isMobile
        ? "flex items-center px-3 py-2 rounded-md text-base font-medium"
        : "flex items-center text-sm font-medium transition-colors";

    const activeClass = isMobile
        ? "bg-navy-800 text-white font-semibold"
        : "text-pink-500 font-semibold";

    const inactiveClass = isMobile
        ? "text-gray-300 hover:bg-navy-700 hover:text-white"
        : "text-gray-300 hover:text-pink-400";

    const specialInactiveClass = isMobile
        ? "text-pink-400 hover:bg-navy-700 hover:text-pink-300 font-medium"
        : "text-pink-400 hover:text-pink-300 font-semibold";

    // --- ÄNDRING HÄR ---
    // Ikonstorlek och marginal (anpassad för mobil/desktop) - JUSTERAD STORLEK
    const iconSize = isMobile ? 20 : 16; // Ökade storleken (20px mobil, 16px desktop)
    const iconMargin = "mr-2"; // Ökade marginalen till 0.5rem (8px)
    // --- SLUT ÄNDRING ---

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
      <>
        {/* Statiska länkar */}
        <Link href="/" className={`${linkBaseClass} ${isActive('/') ? activeClass : inactiveClass}`} onClick={closeMenus}>Hem</Link>
        <Link href="/funktioner" className={`${linkBaseClass} ${isActive('/funktioner') ? activeClass : inactiveClass}`} onClick={closeMenus}>Funktioner</Link>
        <Link href="/priser" className={`${linkBaseClass} ${isActive('/priser') ? activeClass : inactiveClass}`} onClick={closeMenus}>Priser</Link>
        <Link href="/artiklar" className={`${linkBaseClass} ${isActive('/artiklar') ? activeClass : inactiveClass}`} onClick={closeMenus}>
          Artiklar
        </Link>

        {/* Länkar för inloggade användare */}
        {user && (
           <>
             {/* Skapa brev */}
             <Link
                href="/create-letter"
                className={`${linkBaseClass} ${isActive('/create-letter') ? activeClass : specialInactiveClass}`}
                onClick={closeMenus}
             >
               <Edit3 size={iconSize} className={`${iconMargin} text-current`} aria-hidden="true" />
               Skapa brev
             </Link>

             {/* Analysera CV */}
             <Link
               href="/analysera-cv"
               className={`${linkBaseClass} ${isActive('/analysera-cv') ? activeClass : specialInactiveClass}`}
               onClick={closeMenus}
             >
               <SearchCheck size={iconSize} className={`${iconMargin} text-current`} aria-hidden="true" />
               Analysera CV
             </Link>

             {/* Mina brev */}
             <Link
                href="/my-letters"
                className={`${linkBaseClass} ${isActive('/my-letters') ? activeClass : inactiveClass}`}
                onClick={closeMenus}
             >
               <FileText size={iconSize} className={`${iconMargin} text-current`} aria-hidden="true" />
               Mina brev
             </Link>
           </>
        )}
      </>
    );
  }
  // --- Slut på renderNavLinks ---

  return (
    <nav className="bg-navy-950 text-white shadow-md sticky top-0 z-40">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0" onClick={closeMenus}>
          <span className="text-xl font-bold">cv<span className="text-pink-500">brev</span></span>
          <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-pink-500 rounded-sm uppercase tracking-wider">BETA</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {renderNavLinks(false)}
        </div>

        {/* Desktop User/Auth Area */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
             <div className="h-8 w-24 bg-navy-800 rounded animate-pulse"></div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center text-sm font-medium text-gray-300 rounded-full hover:text-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-pink-500"
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
                id="user-menu-button"
              >
                <span className="sr-only">Öppna användarmeny</span>
                <span className="flex items-center justify-center w-8 h-8 text-base font-semibold text-white bg-pink-600 rounded-full">
                  {user.email?.charAt(0).toUpperCase() ?? '?'}
                </span>
                <span className="hidden lg:inline ml-2">{user.email}</span>
              </button>
              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 w-48 mt-2 origin-top-right bg-navy-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-navy-700 hover:text-white"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    <User className="w-4 h-4 mr-2" aria-hidden="true" />
                    Min profil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-navy-700 hover:text-red-300"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Logga ut
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors ${pathname === '/login' ? 'text-pink-500' : 'text-gray-300 hover:text-pink-400'}`}
                onClick={closeMenus}
              >
                Logga in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-pink-600 rounded-md shadow-sm hover:bg-pink-700"
                onClick={closeMenus}
              >
                Kom igång
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Öppna huvudmeny</span>
            {isMobileMenuOpen ? (
              <X className="block w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="block w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-navy-700" id="mobile-menu">
          {/* Mobile Nav Links */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}
          </div>
          {/* Mobile User/Auth Area */}
          <div className="pt-4 pb-3 border-t border-navy-700">
             {isLoading ? (
               <div className="px-5">
                 <div className="h-8 w-32 bg-navy-800 rounded animate-pulse"></div>
               </div>
             ) : user ? (
              <div className="px-5">
                <div className="flex items-center mb-3">
                   <span className="flex items-center justify-center w-8 h-8 text-base font-semibold text-white bg-pink-600 rounded-full flex-shrink-0">
                     {user.email?.charAt(0).toUpperCase() ?? '?'}
                   </span>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-white truncate">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                   <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-navy-700 hover:text-white"
                    onClick={closeMenus}
                  >
                     {/* Denna använder redan w-5 h-5 (20px), vilket är bra */}
                     <User className="w-5 h-5 mr-2" aria-hidden="true"/>
                    Min profil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-400 rounded-md hover:bg-navy-700 hover:text-red-300"
                  >
                     {/* Denna använder redan w-5 h-5 (20px), vilket är bra */}
                     <LogOut className="w-5 h-5 mr-2" aria-hidden="true"/>
                    Logga ut
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-2 space-y-1 sm:px-3">
                 <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-navy-700 hover:text-white"
                  onClick={closeMenus}
                >
                  Logga in
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-3 py-2 text-base font-medium text-center text-white transition-colors bg-pink-600 rounded-md shadow-sm hover:bg-pink-700"
                  onClick={closeMenus}
                >
                  Kom igång
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}