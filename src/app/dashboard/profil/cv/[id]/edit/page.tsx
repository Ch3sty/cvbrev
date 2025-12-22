'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Save, AlertTriangle, FileText, Clock, Edit3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { use } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function CVEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvData, setCvData] = useState<any>(null);
  const [cvText, setCvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const supabase = createClient();

  // Unwrap params med React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Ref för att förhindra dubbla anrop
  const initialLoadRef = useRef(false);

  // Function to format date
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Okänt datum';

    try {
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Ogiltigt datum';
      }

      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

    } catch (error) {
      console.error('Fel vid formatering av datum:', error);
      return 'Okänt datum';
    }
  };

  // Fetch CV data from the database
  useEffect(() => {
    async function fetchCVData() {
      if (!initialLoadRef.current) {
        try {
          setLoading(true);
          setError(null);

          // Get current user session
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            router.push('/login');
            return;
          }

          // Fetch CV data
          const { data, error } = await supabase
            .from('cv_texts')
            .select('*')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();

          if (error) {
            console.error('Fel vid hämtning av CV:', error);
            setError('Kunde inte hitta det begärda CV:t');
            return;
          }

          if (data) {
            setCvData(data);
            setCvText(data.cv_text || '');
          } else {
            setError('Inget CV hittades');
          }
        } catch (error) {
          console.error('Fel vid hämtning av CV:', error);
          setError('Ett fel uppstod vid hämtning av CV');
        } finally {
          setLoading(false);
        }

        initialLoadRef.current = true;
      }
    }

    fetchCVData();
  }, [id, router, supabase]);

  // Save updated CV text
  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setError(null);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Använd API-rutten för att uppdatera CV-texten
      const response = await fetch('/api/cv/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          cv_text: cvText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte uppdatera CV-texten');
      }

      const result = await response.json();

      if (result.success) {
        setCvData(result.data);
        setSuccessMessage('CV-texten har sparats');

        // Hide message after a few seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error('Kunde inte uppdatera CV-texten');
      }
    } catch (error: any) {
      setError('Ett fel uppstod: ' + (error.message || 'Okänt fel'));
      console.error('Fel vid uppdatering av CV:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/profil/cv');
  };

  // Öppna CV i nytt fönster (samma som i Mina CV:n)
  const openCVInNewWindow = () => {
    if (!cvData) return;

    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${cvData.file_name || 'CV'}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 40px;
                line-height: 1.6;
                background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
                color: #1f2937;
              }
              .cv-container {
                max-width: 800px;
                margin: 0 auto;
                white-space: pre-line;
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              }
              h1 {
                color: #111827;
                margin-bottom: 12px;
              }
              .meta {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 32px;
                padding-bottom: 16px;
                border-bottom: 2px solid #f3f4f6;
              }
            </style>
          </head>
          <body>
            <div class="cv-container">
              <h1>${cvData.file_name || 'CV'}</h1>
              <div class="meta">
                📅 Uppladdad: ${cvData.created_at ? new Date(cvData.created_at).toLocaleDateString('sv-SE') : 'okänt datum'}
                ${cvData.updated_at && cvData.updated_at !== cvData.created_at
                  ? `<br>🔄 Uppdaterad: ${new Date(cvData.updated_at).toLocaleDateString('sv-SE')}`
                  : ''}
              </div>
              <div>${cvText ? cvText.replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'}</div>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <motion.div
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="emerald" />

      {/* Success notification */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-xl z-50"
        >
          <p className="text-emerald-800 font-medium">{successMessage}</p>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
        >
          {/* Dekorativ orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-12 translate-x-12" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center px-4 py-2 bg-white/80 hover:bg-white rounded-xl text-slate-700 transition-all shadow-sm hover:shadow-md min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tillbaka
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Redigera {cvData?.file_name || 'CV'}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">Uppdatera ditt CV-innehåll</p>
                  </div>
                </div>
              </div>

              {cvData && (
                <motion.button
                  onClick={openCVInNewWindow}
                  className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[48px]"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visa CV
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50/80 backdrop-blur-xl border border-red-200 p-4 rounded-xl sm:rounded-2xl"
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Fel</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit form */}
        {cvData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-emerald-200/50 shadow-xl"
          >
            {/* Metadata */}
            <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/50">
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                <span>
                  Uppladdad: {formatDate(cvData.created_at)}
                  {cvData.updated_at && cvData.updated_at !== cvData.created_at &&
                    <> • Uppdaterad: {formatDate(cvData.updated_at)}</>
                  }
                </span>
              </div>
            </div>

            {/* CV Text Editor */}
            <div className="mb-6">
              <label htmlFor="cv-text" className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                CV-text
              </label>
              <textarea
                id="cv-text"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="w-full min-h-[500px] px-4 py-3 rounded-xl bg-white text-slate-900 border-2 border-emerald-200/50 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 resize-y transition-all font-mono text-sm"
                placeholder="Skriv eller klistra in ditt CV här..."
              />
              <p className="mt-2 text-xs text-slate-500">
                Redigera texten direkt i fältet ovan. Alla ändringar sparas till ditt CV.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-emerald-200/50">
              <Link
                href="/dashboard/profil/cv"
                className="w-full sm:w-auto px-6 py-3 text-slate-700 bg-white border border-emerald-200/50 rounded-xl hover:bg-emerald-50 transition-all font-medium text-center min-h-[48px] flex items-center justify-center"
              >
                Avbryt
              </Link>

              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl min-h-[48px]"
                whileHover={!saving ? { scale: 1.02, y: -2 } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
              >
                {saving ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Sparar ändringar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Spara ändringar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
