'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '@/api';

export default function LetterCard({ letter, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Formatera datum
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Hantera borttagning av brev
  const handleDelete = async () => {
    if (window.confirm('Är du säker på att du vill ta bort detta brev?')) {
      setIsDeleting(true);
      try {
        await api.letters.delete(letter.id);
        toast.success('Brevet har tagits bort');
        if (onDelete) onDelete(letter.id);
      } catch (error) {
        console.error('Error deleting letter:', error);
        toast.error('Kunde inte ta bort brevet');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Tonaliteter på svenska
  const tonalityLabels = {
    professional: 'Professionell',
    enthusiastic: 'Entusiastisk',
    creative: 'Kreativ',
    confident: 'Självsäker',
    balanced: 'Balanserad'
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
              {letter.title || letter.jobTitle || 'Namnlöst brev'}
            </h3>
            {letter.company && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {letter.company}
              </p>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md z-10 border border-gray-200 dark:border-gray-700">
                <ul className="py-1">
                  <li>
                    <Link 
                      href={`/letters/${letter.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowMenu(false)}
                    >
                      Visa och redigera
                    </Link>
                  </li>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 h-16">
          {letter.content?.substring(0, 150)}...
        </div>

        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center space-x-2">
            {letter.tonality && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {tonalityLabels[letter.tonality] || letter.tonality}
              </span>
            )}
          </div>
          
          <div className="text-gray-500 dark:text-gray-400">
            {formatDate(letter.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}