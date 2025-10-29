'use client'

import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter, Github, Heart } from 'lucide-react'

export default function PremiumFooter() {
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-white border-t border-gray-200">
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Kolumn 1: Om Jobbcoach.ai */}
          <div className="lg:col-span-2">
            {/* Logotyp - matchar PremiumNavbar stil */}
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold text-gray-900">
                Jobbcoach
              </span>
              <span className="text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-1.5 py-0.5 ml-1 leading-tight shadow-sm">
                .ai
              </span>
            </Link>

            <p className="text-gray-600 mb-6 max-w-md">
              Din smarta karriärpartner för svenska arbetsmarknaden.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/CVbrev/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="w-5 h-5 text-gray-600 hover:text-pink-600" />
              </a>
              <a
                href="https://www.instagram.com/jobbcoach.ai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="w-5 h-5 text-gray-600 hover:text-pink-600" />
              </a>
              <a
                href="https://linkedin.com/company/jobbcoach-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5 text-gray-600 hover:text-pink-600" />
              </a>
            </div>
          </div>

          {/* Kolumn 2: Produkt */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Produkt</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/funktioner" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Funktioner
                </Link>
              </li>
              <li>
                <Link href="/priser" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Priser
                </Link>
              </li>
              <li>
                <Link href="/cv-mallar" className="text-gray-600 hover:text-pink-600 transition-colors">
                  CV-mallar
                </Link>
              </li>
              <li>
                <Link href="/integrationer" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Integrationer
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolumn 3: Företag */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Företag</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/om-oss" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/karriar" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Karriär
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolumn 4: Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/hjalpcenter" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Hjälpcenter
                </Link>
              </li>
              <li>
                <Link href="/integritetspolicy" className="text-gray-600 hover:text-pink-600 transition-colors">
                  GDPR
                </Link>
              </li>
              <li>
                <Link href="/anvandarvillkor" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Villkor
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-600 hover:text-pink-600 transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 mt-12 border-t border-gray-200 flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
          <p className="text-xs sm:text-sm text-gray-600 text-center md:text-left">
            © 2024 Jobbcoach.ai. Alla rättigheter förbehållna.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
            Utvecklad med <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> i Sverige
          </p>
        </div>
      </div>
    </footer>
  )
}