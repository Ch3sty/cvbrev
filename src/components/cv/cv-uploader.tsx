'use client'

import { useState, useRef } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { FileText, Upload, Info } from 'lucide-react'

interface CVUploaderProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showNotification?: (message: string, type: 'loading' | 'success' | 'error' | 'info', progress?: number) => void;
}

export default function CVUploader({ onSuccess, onError, showNotification }: CVUploaderProps) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { uploadCV, gdprConsent, setGdprConsent, loading } = useProfile()
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Kontrollera filtyp
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!validTypes.includes(selectedFile.type)) {
        showNotification?.('Endast PDF, DOCX och TXT-filer stöds', 'error');
        return
      }
      
      // Kontrollera filstorlek (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        showNotification?.('Filen är för stor. Maximal filstorlek är 5MB', 'error');
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
        showNotification?.('Endast PDF, DOCX och TXT-filer stöds', 'error');
        return
      }
      
      if (droppedFile.size > 5 * 1024 * 1024) {
        showNotification?.('Filen är för stor. Maximal filstorlek är 5MB', 'error');
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
    if (!file) {
      showNotification?.('Välj en CV-fil först', 'error');
      return;
    }
    
    if (!gdprConsent) {
      showNotification?.('Du måste godkänna GDPR-samtycket för att ladda upp CV', 'error');
      return;
    }
    
    try {
      showNotification?.('Laddar upp ditt CV...', 'loading');
      
      const success = await uploadCV(file, title)
      
      if (success) {
        // Återställ formuläret
        setTitle('')
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        showNotification?.('CV uppladdad framgångsrikt!', 'success');
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('CV upload error:', error)
      showNotification?.(error.message || 'Ett fel uppstod vid uppladdning', 'error');
      onError?.(error instanceof Error ? error : new Error(error.message || 'Ett fel uppstod vid uppladdning'))
    }
  }
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  return (
    <div className="p-6 bg-navy-800 rounded-lg">
      <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
        <Upload className="w-5 h-5 mr-2 text-pink-500" />
        Ladda upp CV
      </h2>
      
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
      
      {/* GDPR info */}
      <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-4 text-sm text-blue-200">
        <div className="flex items-start">
          <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>
            För bästa resultat, ladda upp en CV i PDF eller DOCX-format. 
            Vänligen se till att ditt CV inte innehåller personuppgifter så 
            som hemadress, personlig e-post eller telefonnummer.
          </p>
        </div>
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
      
      {/* GDPR-samtycke */}
      <div className="flex items-start mb-4 space-x-2">
        <div className="flex items-center h-5 mt-1">
          <input
            id="gdpr-consent"
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            className="w-4 h-4 border border-gray-600 rounded bg-navy-700 focus:ring-pink-500 text-pink-600"
          />
        </div>
        <label htmlFor="gdpr-consent" className="text-sm text-gray-300">
          Jag bekräftar att mitt CV inte innehåller personliga uppgifter såsom hemadress, 
          personlig e-post eller telefonnummer (GDPR-samtycke).
        </label>
      </div>
      
      {/* Uppladdningsknapp */}
      <button
        onClick={handleUpload}
        disabled={loading || !file || !gdprConsent}
        className="w-full py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            Laddar upp...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Spara CV
          </>
        )}
      </button>
    </div>
  )
}