'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDistance } from 'date-fns'
import { sv } from 'date-fns/locale'

type Letter = {
  id: string
  title: string
  company: string
  job_title: string
  content: string
  created_at: string
  is_saved: boolean
}

export default function LetterHistoryList() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  
  useEffect(() => {
    fetchLetters()
  }, [])
  
  const fetchLetters = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      const { data, error } = await supabase
        .from('letters')
        .select('id, title, company, job_title, content, created_at, is_saved')
        .eq('user_id', user.id)
        .eq('is_saved', true)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      setLetters(data)
    } catch (error: any) {
      console.error('Error fetching letters:', error)
      setError('Kunde inte hämta dina brev. Försök igen senare.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    setDeleteId(id)
    setShowDeleteConfirm(true)
  }
  
  const confirmDelete = async () => {
    if (!deleteId) return
    
    try {
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', deleteId)
        
      if (error) throw error
      
      // Uppdatera listan
      setLetters(letters.filter(letter => letter.id !== deleteId))
      
    } catch (error: any) {
      console.error('Error deleting letter:', error)
      setError('Kunde inte ta bort brevet. Försök igen senare.')
    } finally {
      setShowDeleteConfirm(false)
      setDeleteId(null)
    }
  }
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteId(null)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistance(date, new Date(), {
      addSuffix: true,
      locale: sv
    })
  }
  
  const getPreview = (content: string) => {
    return content.substring(0, 150) + '...'
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-4 text-white bg-red-500 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchLetters}
          className="px-4 py-2 mt-2 font-medium text-red-500 bg-white rounded-md"
        >
          Försök igen
        </button>
      </div>
    )
  }
  
  if (letters.length === 0) {
    return (
      <div className="p-6 text-center bg-navy-800 rounded-lg">
        <p className="mb-4 text-lg text-gray-300">Du har inga sparade brev ännu.</p>
        <button
          onClick={() => router.push('/create-letter')}
          className="px-6 py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Skapa ditt första brev
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dina sparade brev</h2>
      
      {letters.map((letter) => (
        <div key={letter.id} className="p-6 bg-navy-800 rounded-lg">
          <div className="flex flex-col mb-4 md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="mb-1 text-xl font-semibold text-white">
                {letter.title || 'Ansökningsbrev'}
              </h3>
              <p className="text-sm text-gray-400">
                {letter.company ? `${letter.company} - ` : ''}
                {letter.job_title || 'Jobb'}
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-500 md:mt-0">
              Skapad {formatDate(letter.created_at)}
            </p>
          </div>
          
          <p className="mb-4 text-gray-300">
            {getPreview(letter.content)}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/my-letters/${letter.id}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Visa
            </button>
            <button
              onClick={() => router.push(`/my-letters/${letter.id}/edit`)}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Redigera
            </button>
            <button
              onClick={() => handleDelete(letter.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Ta bort
            </button>
          </div>
        </div>
      ))}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-navy-800 rounded-lg">
            <h3 className="mb-4 text-xl font-semibold text-white">Bekräfta borttagning</h3>
            <p className="mb-6 text-gray-300">
              Är du säker på att du vill ta bort detta brev? Detta kan inte ångras.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}