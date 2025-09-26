'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, BookOpen, CheckCircle } from 'lucide-react';
import type { Author } from '@/lib/authors';

interface AuthorBoxProps {
  author: Author;
  readingTime?: number;
}

export default function AuthorBox({ author, readingTime }: AuthorBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 my-8"
    >
      <div className="flex items-start gap-4">
        {/* Författarbild */}
        <div className="relative flex-shrink-0">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
            <Image
              src={author.image}
              alt={`${author.name} - ${author.title}`}
              fill
              className="object-cover"
              sizes="80px"
              priority
              quality={90}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
            />
          </div>
          {/* Verifierad expert badge */}
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Författarinformation */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-900 text-lg">{author.name}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              <Award className="w-3 h-3" />
              Verifierad expert
            </span>
          </div>

          <p className="text-pink-600 font-medium text-sm mb-2">{author.title}</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {author.bio}
          </p>

          {/* Expertområden */}
          <div className="flex flex-wrap gap-2 mb-3">
            {author.expertise.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Statistik */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>
                {author.articleCount && author.articleCount > 0
                  ? `${author.articleCount} artiklar publicerade`
                  : 'Expert inom jobbcoach.ai'}
              </span>
            </div>
            {readingTime && (
              <>
                <span className="text-gray-300">•</span>
                <span>{readingTime} min läsning</span>
              </>
            )}
            <span className="text-gray-300">•</span>
            <span className="text-green-600 font-medium">
              Granskad av HR-experter
            </span>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">Del av</span>
            <span className="font-bold text-pink-600">jobbcoach.ai</span>
            <span>expertteam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                />
              ))}
            </div>
            <span className="text-gray-500">Kvalitetssäkrad artikel</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}