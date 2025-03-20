'use client'

import { useProfile } from '@/hooks/use-profile'
import { FileText, Trash, ExternalLink } from 'lucide-react'

interface CVListProps {
  onDeleteClick?: () => void;
  maxSlots?: number;
}

export default function CVList({ onDeleteClick, maxSlots = 5 }: CVListProps) {
  const { cv, loading } = useProfile()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }
  
  // Renderar alla CV-platser, fyllda och tomma
  const renderSlots = () => {
    const slots = []
    
    // Om CV finns, lägg till det som första slot
    if (cv && cv.url) {
      slots.push(
        <div 
          key="current-cv" 
          className="border border-gray-700 bg-navy-800 rounded-lg p-4 mb-4 transition-all hover:border-pink-500 hover:shadow-lg"
        >
          <div className="flex items-start">
            <div className="p-2 bg-pink-600 rounded-md mr-4 flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium mb-1 text-white">{cv.name}</h3>
              
              {cv.lastUpdated && (
                <p className="text-xs text-gray-400 mb-3">
                  Uppdaterad: {new Date(cv.lastUpdated).toLocaleDateString('sv-SE')}
                </p>
              )}
              
              <div className="flex space-x-3 mt-2">
                <a
                  href={cv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visa CV
                </a>
                <button
                  onClick={onDeleteClick}
                  className="inline-flex items-center px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Ta bort
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // Lägg till tomma slots upp till maxSlots
    const emptySlots = maxSlots - slots.length
    for (let i = 0; i < emptySlots; i++) {
      slots.push(
        <div 
          key={`empty-slot-${i}`} 
          className="border border-gray-700 border-dashed rounded-lg p-4 mb-4 bg-navy-900/50"
        >
          <div className="flex flex-col items-center justify-center h-20 text-gray-400">
            <div className="text-2xl mb-2">📄</div>
            <p className="text-sm">
              {slots.length === 0 && i === 0 ? 
                "Ingen CV uppladdad" : 
                `Tom CV-plats ${slots.length + i + 1}/5`
              }
            </p>
          </div>
        </div>
      )
    }
    
    return slots
  }
  
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <FileText className="w-5 h-5 mr-2 text-pink-500" />
        Dina CV:n ({cv ? 1 : 0}/5)
      </h2>
      
      {renderSlots()}
    </div>
  )
}