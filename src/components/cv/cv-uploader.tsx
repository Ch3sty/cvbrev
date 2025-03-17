'use client'

import { useState, useRef } from 'react'
import { useCVStore } from '@/store/cv-store'

export default function CVUploader() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { uploadCV, isLoading, error } = useCVStore()
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Kontrollera filtyp
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!validTypes.includes(selectedFile.type)) {
        alert('Endast PDF, DOCX och TXT-filer stöds')
        return
      }
      
      // Kontrollera filstorlek (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Filen är för stor. Maximal filstorlek är 5MB')
        return
      }
      
      setFile(selectedFile)
      
      // Om ingen titel har angetts, använd filnamnet (utan filändelse)
      if (!title) {
        const fileName = selectedFile.name.split('.').slice(0, -1).join('.')
        setTitle(fileName)
      }
    }
  }
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      
      // Samma kontroller som i handleFileChange
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!validTypes.includes(droppedFile.type)) {
        alert('Endast PDF, DOCX och TXT-filer stöds')
        return
      }
      
      if (droppedFile.size > 5 * 1024 * 1024) {
        alert('Filen är för stor. Maximal filstorlek är 5MB')
        return
      }
      
      setFile(droppedFile)
      
      if (!title) {
        const fileName = droppedFile.name.split('.').slice(0, -1).join('.')
        setTitle(fileName)
      }
    }
  }
  
  const handleUpload = async () => {
    if (!file) return
    
    const success = await uploadCV(file, title)
    
    if (success) {
      // Återställ formuläret
      setTitle('')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  return (
    <div className="p-6 bg-navy-800 rounded-lg">
      <h2 className="mb-4 text-xl font-semibold text-white">Lägg till nytt CV</h2>
      
      {/* Titel input */}
      <div className="mb-4">
        <label htmlFor="cv-title" className="block mb-1 text-sm text-gray-300">
          Titel
        </label>
        <input
          id="cv-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ge ditt CV ett namn..."
          className="w-full p-2 text-white bg-navy-700 border border-gray-700 rounded-md"
        />
      </div>
      
      {/* Fil-dropp area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`flex flex-col items-center justify-center p-10 mb-4 text-center border-2 border-dashed rounded-md cursor-pointer ${
          isDragging 
            ? 'border-pink-500 bg-navy-700' 
            : 'border-gray-700 hover:border-gray-500 hover:bg-navy-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.txt"
        />
        
        {file ? (
          <>
            <div className="mb-2 text-2xl">📄</div>
            <p className="mb-1 font-medium text-white">{file.name}</p>
            <p className="text-sm text-gray-400">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <div className="mb-2 text-2xl">⬆️</div>
            <p className="mb-1 font-medium text-white">Välj en fil att ladda upp</p>
            <p className="text-sm text-gray-400">
              Dra och släpp eller klicka för att bläddra
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Endast .pdf, .docx, .txt (max 5MB)
            </p>
          </>
        )}
      </div>
      
      {/* Felmeddelande */}
      {error && (
        <div className="p-3 mb-4 text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}
      
      {/* Uppladdningsknapp */}
      <button
        onClick={handleUpload}
        disabled={isLoading || !file}
        className="w-full py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Laddar upp...' : 'Spara CV'}
      </button>
    </div>
  )
}