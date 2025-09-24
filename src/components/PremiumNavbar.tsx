'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  Building2,
  Mail,
  Menu,
  X,
  Sparkles,
  Settings,
  User,
  Zap
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  description: string
  gradient: string
}

interface NavDropdown {
  name: string
  items: NavItem[]
}

export default function PremiumNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)

  // Track scroll for navbar effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation structure with ONLY real pages
  const navigationDropdowns: NavDropdown[] = [
    {
      name: 'Verktyg',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          description: 'Översikt över din karriärresa',
          gradient: 'from-blue-500 to-cyan-500'
        },
        {
          name: 'CV-mallar',
          href: '/cv-mallar',
          icon: FileText,
          description: 'Professionella CV-mallar för alla branscher',
          gradient: 'from-purple-500 to-pink-500'
        }
      ]
    },
    {
      name: 'Företaget',
      items: [
        {
          name: 'Om oss',
          href: '/om-oss',
          icon: Building2,
          description: 'Lär känna teamet bakom Jobbcoach.ai',
          gradient: 'from-green-500 to-teal-500'
        },
        {
          name: 'Kontakt',
          href: '/kontakt',
          icon: Mail,
          description: 'Hör av dig - vi hjälper gärna till',
          gradient: 'from-orange-500 to-red-500'
        }
      ]
    }
  ]

  const directLinks = [
    { name: 'Funktioner', href: '/funktioner' },
    { name: 'Priser', href: '/priser' }
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
          ? 'bg-navy-900/95 backdrop-blur-xl border-b border-navy-700/50 shadow-xl'
          : 'bg-navy-950/90 backdrop-blur-lg border-b border-navy-800/30'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Premium Logo with Enhanced Design */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xl font-bold transition-all duration-300 hover:scale-105"
              onClick={closeAllDropdowns}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-pink-500/25 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Jobbcoach.ai
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">

            {/* Dropdown Menus */}
            {navigationDropdowns.map((dropdown) => (
              <div key={dropdown.name} className="relative group">
                <button
                  onClick={() => handleDropdownClick(dropdown.name)}
                  onMouseEnter={() => setActiveDropdown(dropdown.name)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                    activeDropdown === dropdown.name
                      ? 'text-pink-400 bg-navy-800/50'
                      : 'text-gray-300 hover:text-white hover:bg-navy-800/30'
                  }`}
                >
                  {dropdown.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
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
                      <div className="bg-navy-800/95 backdrop-blur-xl border border-navy-700/50 rounded-xl shadow-2xl p-4 min-w-[320px]">
                        <div className="space-y-2">
                          {dropdown.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={closeAllDropdowns}
                              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-navy-700/50 transition-all duration-300 hover:scale-[1.02]"
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                <item.icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white group-hover:text-pink-300 transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Direct Links */}
            {directLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeAllDropdowns}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-navy-800/30 rounded-lg transition-all duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
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
                Starta gratis
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg transition-all"
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
            className="lg:hidden bg-navy-900/95 backdrop-blur-xl border-t border-navy-700/50"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-6">

                {/* Mobile Dropdowns */}
                {navigationDropdowns.map((dropdown) => (
                  <div key={dropdown.name}>
                    <div className="font-medium text-pink-400 mb-3 text-sm uppercase tracking-wide">
                      {dropdown.name}
                    </div>
                    <div className="space-y-2 ml-4">
                      {dropdown.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg transition-all"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Mobile Direct Links */}
                <div>
                  <div className="font-medium text-pink-400 mb-3 text-sm uppercase tracking-wide">
                    Snabblänkar
                  </div>
                  <div className="space-y-2 ml-4">
                    {directLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg transition-all"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile CTA */}
                <div className="pt-4 border-t border-navy-700/50 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg transition-all"
                  >
                    Logga in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Starta gratis
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}