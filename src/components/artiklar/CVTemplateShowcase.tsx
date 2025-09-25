'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const CVTemplateShowcase: React.FC = () => {
  const popularTemplates = [
    {
      id: 'modern-professional',
      name: 'Modern Professional',
      description: 'Perfekt för tech och konsult',
      image: '/images/cv-templates/modern-professional-preview.jpg',
      badge: 'Heta just nu'
    },
    {
      id: 'classic-elegant',
      name: 'Classic Elegant',
      description: 'Traditionell och pålitlig',
      image: '/images/cv-templates/classic-elegant-preview.jpg',
      badge: 'Populärast'
    },
    {
      id: 'creative-bold',
      name: 'Creative Bold',
      description: 'För kreativa yrken',
      image: '/images/cv-templates/creative-bold-preview.jpg',
      badge: 'Trendigt'
    },
    {
      id: 'minimalist-clean',
      name: 'Minimalist Clean',
      description: 'Rent och professionellt',
      image: '/images/cv-templates/minimalist-clean-preview.jpg',
      badge: 'Rekommenderad'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="my-10 bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-gray-200 shadow-sm p-6 not-prose"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-pink-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Populära CV-mallar
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Professionella mallar som ökar dina chanser att få jobbet
          </p>
        </div>
        <TrendingUp className="w-6 h-6 text-pink-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {popularTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative"
          >
            <Link
              href={`/cv-mallar#${template.id}`}
              className="block bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200">
                  {template.badge}
                </span>
              </div>

              {/* Template Preview */}
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/20" />
                {/* Placeholder for template image */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-pink-600 rounded mx-auto mb-2"></div>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-300 rounded w-16 mx-auto"></div>
                      <div className="h-1 bg-gray-300 rounded w-12 mx-auto"></div>
                      <div className="h-1 bg-gray-300 rounded w-14 mx-auto"></div>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <ArrowRight className="w-4 h-4 text-pink-600" />
                  </div>
                </div>
              </div>

              {/* Template info */}
              <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-pink-600 transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {template.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">200+</span> professionella mallar att välja mellan
        </p>

        <Link
          href="/cv-mallar"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm group"
        >
          Visa alla mallar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  );
};

export default CVTemplateShowcase;