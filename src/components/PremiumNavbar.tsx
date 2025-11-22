'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import {
  ChevronDown,
  FileText,
  Home,
  LayoutGrid,
  Tag,
  Newspaper,
  Wrench,
  Edit3,
  SearchCheck,
  GraduationCap,
  Palette,
  Menu,
  X,
  MessageCircle,
  User as UserIcon,
  LogOut,
  LogIn,
  Zap,
  Lock,
  Linkedin,
  Target,
  Brain
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  description: string
  gradient: string
  requireLogin?: boolean
}

interface NavDropdown {
  name: string
  icon: React.ElementType
  items: NavItem[]
}

export default function PremiumNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [sessionUser, setSessionUser] = useState<SupabaseUser | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const pathname = usePathname()
  const supabase = createClient()

  // Track scroll for navbar effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auth state management
  useEffect(() => {
    const getUserSession = async () => {
      setIsLoadingAuth(true)
      const { data: { session } } = await supabase.auth.getSession()
      setSessionUser(session?.user ?? null)
      setIsLoadingAuth(false)
    }
    getUserSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoadingAuth(true)
        setSessionUser(session?.user ?? null)
        setIsLoadingAuth(false)
      }
    )
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    setIsLoadingAuth(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Navigation structure matching the existing navbar exactly
  const navigationDropdowns: NavDropdown[] = [
    {
      name: 'Verktyg',
      icon: Wrench,
      items: [
        {
          name: 'CV-Mallar',
          href: '/verktyg/cv-mallar',
          icon: Palette,
          description: 'Ladda ner professionella CV-mallar direkt',
          gradient: 'from-green-500 to-teal-500',
          requireLogin: false
        },
        {
          name: 'CV-Analys',
          href: '/verktyg/cv-analys',
          icon: SearchCheck,
          description: 'Få konkret feedback som förbättrar ditt CV',
          gradient: 'from-orange-500 to-red-500',
          requireLogin: false
        },
        {
          name: 'Personligt brev',
          href: '/verktyg/personligt-brev',
          icon: FileText,
          description: 'Skapa personliga brev som går igenom systemen',
          gradient: 'from-purple-600 to-blue-600',
          requireLogin: false
        },
        {
          name: 'Jobbcoachen',
          href: '/verktyg/jobbcoachen',
          icon: MessageCircle,
          description: 'Diskutera karriär, lön och jobbval med din coach',
          gradient: 'from-blue-600 to-indigo-600',
          requireLogin: false
        },
        {
          name: 'LinkedIn-optimering',
          href: '/verktyg/linkedin-optimering',
          icon: Linkedin,
          description: 'Gör din LinkedIn-profil mer attraktiv för rekryterare',
          gradient: 'from-blue-600 to-indigo-600',
          requireLogin: false
        },
        {
          name: 'Jobbmatchning',
          href: '/verktyg/jobbmatchning',
          icon: Target,
          description: 'Hitta lediga jobb som passar just dig',
          gradient: 'from-pink-500 to-rose-500',
          requireLogin: false
        },
        {
          name: 'Rekryteringstester',
          href: '/verktyg/rekryteringstester',
          icon: Brain,
          description: 'Öva på tester som används vid rekrytering',
          gradient: 'from-purple-600 to-indigo-600',
          requireLogin: false
        }
      ]
    }
  ]

  const directLinks = [
    { name: 'Hem', href: '/', icon: Home },
    { name: 'Funktioner', href: '/funktioner', icon: LayoutGrid },
    { name: 'Priser', href: '/priser', icon: Tag },
    { name: 'Exempel', href: '/personligt-brev-exempel', icon: FileText },
    { name: 'Artiklar', href: '/artiklar', icon: Newspaper },
    { name: 'Om oss', href: '/om-oss', icon: UserIcon }
  ]

  const handleDropdownClick = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName)
  }

  const closeAllDropdowns = () => {
    setActiveDropdown(null)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 0
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-lg'
          : 'bg-white/90 backdrop-blur-lg border-b border-gray-100/60 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Premium Logo with Enhanced Design */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center text-xl font-bold transition-all duration-300 hover:scale-105"
              onClick={closeAllDropdowns}
            >
              <span className="text-xl sm:text-2xl font-bold text-gray-900 hover:opacity-90 transition-opacity">
                Jobbcoach
              </span>
              <div className="relative">
                <span className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-1.5 py-0.5 ml-1 leading-tight hover:opacity-90 transition-opacity shadow-sm">
                  .ai
                </span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Direct Links First */}
            {directLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeAllDropdowns}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'text-pink-600 bg-pink-50/80 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Dropdown Menus */}
            {navigationDropdowns.map((dropdown) => (
              <div key={dropdown.name} className="relative group">
                <button
                  onClick={() => handleDropdownClick(dropdown.name)}
                  onMouseEnter={() => setActiveDropdown(dropdown.name)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                    activeDropdown === dropdown.name
                      ? 'text-pink-600 bg-pink-50/80 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <dropdown.icon className="w-4 h-4" />
                  {dropdown.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-gray-600 ${
                      activeDropdown === dropdown.name ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Premium Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === dropdown.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 pt-3"
                    >
                      <div className="bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-xl shadow-2xl p-4 min-w-[320px]">
                        <div className="space-y-2">
                          {dropdown.items.map((item) => {
                            const isLocked = item.requireLogin && !sessionUser
                            const effectiveHref = isLocked
                              ? `/register?redirect=${encodeURIComponent(item.href)}`
                              : item.href

                            return (
                              <Link
                                key={item.name}
                                href={effectiveHref}
                                onClick={closeAllDropdowns}
                                className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                                  isLocked
                                    ? 'opacity-60 hover:bg-gray-100/50'
                                    : 'hover:bg-gray-100/80 hover:scale-[1.02] hover:shadow-sm'
                                }`}
                                title={isLocked ? 'Logga in för att använda denna funktion' : undefined}
                              >
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                  <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                                      {item.name}
                                    </span>
                                    {isLocked && (
                                      <Lock className="w-3 h-3 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                                    {item.description}
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Remaining Direct Links */}
            {directLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeAllDropdowns}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'text-pink-600 bg-pink-50/80 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {!isLoadingAuth && (
              <>
                {sessionUser ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard/profil"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {sessionUser.email?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span className="hidden xl:inline text-gray-700">{sessionUser.email}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Logga in
                    </Link>
                    <Link
                      href="/register"
                      className="group relative px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/25 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Skapa konto
                      </span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/80"
          >
            <div className="container mx-auto px-4 py-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-6">

                {/* Mobile Direct Links */}
                <div className="space-y-2">
                  {directLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                          ? 'text-pink-600 bg-pink-50/80'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Dropdowns */}
                {navigationDropdowns.map((dropdown) => (
                  <div key={dropdown.name}>
                    <div className="font-medium text-pink-600 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                      <dropdown.icon className="w-4 h-4" />
                      {dropdown.name}
                    </div>
                    <div className="space-y-2 ml-4">
                      {dropdown.items.map((item) => {
                        const isLocked = item.requireLogin && !sessionUser
                        const effectiveHref = isLocked
                          ? `/register?redirect=${encodeURIComponent(item.href)}`
                          : item.href

                        return (
                          <Link
                            key={item.name}
                            href={effectiveHref}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg transition-all ${
                              isLocked
                                ? 'text-gray-500 hover:text-gray-600 hover:bg-gray-100/50'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                            }`}
                          >
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center ${
                              isLocked ? 'opacity-60' : ''
                            }`}>
                              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                {isLocked && (
                                  <Lock className="w-3 h-3 text-gray-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-600">{item.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}


                {/* Mobile CTA */}
                <div className="pt-4 border-t border-gray-200/80 space-y-3">
                  {!isLoadingAuth && (
                    <>
                      {sessionUser ? (
                        <div className="space-y-3">
                          <Link
                            href="/dashboard/profil"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100/80 rounded-lg transition-all"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {sessionUser.email?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700 truncate">
                                {sessionUser.email}
                              </div>
                              <div className="text-xs text-gray-500">Visa profil</div>
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              handleSignOut()
                              setMobileMenuOpen(false)
                            }}
                            className="w-full px-4 py-3 text-center text-red-500 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition-all font-medium"
                          >
                            Logga ut
                          </button>
                        </div>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block w-full px-4 py-3 text-center text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all"
                          >
                            Logga in
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block w-full px-4 py-3 text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                          >
                            Skapa konto
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}