'use client'

import { useState, useRef } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { FileText, Upload, Info } from 'lucide-react'
import CVCounter from '@/components/cv/cv-counter'
import { useNotification } from '@/context/notificationcontext' // Lägg till denna import

interface CVUploaderProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  // Ta bort showNotification prop eftersom vi nu använder useNotification-hook
}

export default function CVUploader({ onSuccess, onError }: CVUploaderProps) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Använd notifikationskontext istället för prop
  const {
    loading: notificationLoading,
    success,
    error: showError,
    loadingWithActivity,
    successWithActivity,
    successWithMascotAndActivity,
    errorWithActivity
  } = useNotification()
  
  const { 
    uploadCV, 
    gdprConsent, 
    setGdprConsent, 
    loading, 
    cvCount,
    maxCvCount,
    hasReachedCvLimit
  } = useProfile()
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Kontrollera filtyp
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!validTypes.includes(selectedFile.type)) {
        showError('Endast PDF, DOCX och TXT-filer stöds');
        return
      }
      
      // Kontrollera filstorlek (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        showError('Filen är för stor. Maximal filstorlek är 5MB');
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
        showError('Endast PDF, DOCX och TXT-filer stöds');
        return
      }
      
      if (droppedFile.size > 5 * 1024 * 1024) {
        showError('Filen är för stor. Maximal filstorlek är 5MB');
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
      showError('Välj en CV-fil först');
      return;
    }
    
    if (!gdprConsent) {
      showError('Du måste godkänna GDPR-samtycket för att ladda upp CV');
      return;
    }
    
    try {
      // Visa loading-notifikation och logga att uppladdningen startas
      loadingWithActivity(
        'Laddar upp ditt CV...',
        'cv_uploaded',
        'påbörjade uppladdning av CV',
        {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          title: title
        }
      );
      
      const success = await uploadCV(file, title)
      
      if (success) {
        // Återställ formuläret
        setTitle('')
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Visa success-notifikation med maskot och logga framgångsrik uppladdning
        successWithMascotAndActivity(
          'Tack, vi har sparat ditt CV.',
          'cv-uploaded',
          'cv_uploaded',
          'laddade upp ett CV',
          {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            title: title
          },
          4000,
          true
        );
        
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('CV upload error:', error)
      
      // Visa error-notifikation och logga felet
      errorWithActivity(
        error.message || 'Ett fel uppstod vid uppladdning',
        'cv_uploaded',
        'fick ett fel vid uppladdning av CV',
        {
          file_name: file?.name,
          error_message: error.message,
          error_type: error.name || 'UnknownError'
        }
      );
      
      onError?.(error instanceof Error ? error : new Error(error.message || 'Ett fel uppstod vid uppladdning'))
    }
  }
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  // Om maximalt antal CV har uppnåtts visar vi en annan vy
  if (hasReachedCvLimit) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 mr-3">
            <Upload className="w-6 h-6 text-white" />
          </div>
          CV-utrymme
        </h2>

        {/* CV räknare för att visa status */}
        <div className="mb-6">
          <CVCounter current={cvCount} max={maxCvCount} />
        </div>

        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800">
              Du har nått maxgränsen på {maxCvCount} CV:n. För att ladda upp ett nytt CV, ta först bort ett befintligt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 flex items-center">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mr-3">
          <Upload className="w-6 h-6 text-white" />
        </div>
        Ladda upp CV
      </h2>

      {/* CV räknare för att visa status */}
      <div className="mb-6">
        <CVCounter current={cvCount} max={maxCvCount} />
      </div>

      {/* Titel input */}
      <div className="mb-4">
        <label htmlFor="cv-title" className="block mb-2 text-sm font-semibold text-gray-700">
          Titel
        </label>
        <input
          id="cv-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ge ditt CV ett namn..."
          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
        />
      </div>

      {/* GDPR info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-sm rounded-r-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800">
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
        className={`flex flex-col items-center justify-center p-10 mb-4 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging
            ? 'border-pink-500 bg-pink-50/50'
            : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/30'
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
            <p className="mb-1 font-semibold text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-600">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <div className="mb-2 text-2xl">⬆️</div>
            <p className="mb-1 font-semibold text-gray-900">Välj en fil att ladda upp</p>
            <p className="text-sm text-gray-600">
              Dra och släpp eller klicka för att bläddra
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Endast .pdf, .docx, .txt (max 5MB)
            </p>
          </>
        )}
      </div>

      {/* GDPR-samtycke */}
      <div className="flex items-start mb-6 space-x-2">
        <div className="flex items-center h-5 mt-1">
          <input
            id="gdpr-consent"
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            className="w-4 h-4 border border-gray-300 rounded bg-white focus:ring-pink-500 text-pink-600"
          />
        </div>
        <label htmlFor="gdpr-consent" className="text-sm text-gray-700">
          Jag bekräftar att mitt CV inte innehåller personliga uppgifter såsom hemadress,
          personlig e-post eller telefonnummer (GDPR-samtycke).
        </label>
      </div>

      {/* Uppladdningsknapp */}
      <button
        onClick={handleUpload}
        disabled={loading || !file || !gdprConsent}
        className="w-full py-4 font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
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