'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertTriangle, FileText, Clock, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { use } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function ViewCVPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cvData, setCvData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Unwrap params med React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Ref för att förhindra dubbla anrop
  const initialLoadRef = useRef(false);

  // Funktion för att formatera datum
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Okänt datum';

    try {
      const date = new Date(dateString);

      // Kontrollera om datumet är giltigt
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

  // Hämta CV-data från databasen
  useEffect(() => {
    async function fetchCVData() {
      if (!initialLoadRef.current) {
        try {
          setLoading(true);
          setError(null);

          // Hämta aktuell användarsession
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            router.push('/login');
            return;
          }

          // Hämta CV-data
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

  const handleBack = () => {
    router.push('/dashboard/profil/cv');
  };

  // Öppna CV i nytt fönster
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
              <div>${cvData.cv_text ? cvData.cv_text.replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'}</div>
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
        >
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Fel</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="emerald" />

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
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {cvData?.file_name || 'CV'}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">Förhandsgranska ditt CV</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <motion.button
                  onClick={openCVInNewWindow}
                  className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[48px]"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Öppna i nytt fönster
                </motion.button>

                <Link
                  href={`/dashboard/profil/cv/${id}/edit`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Redigera
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CV Content */}
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

          {/* CV Text Display */}
          <div className="p-6 sm:p-8 bg-white rounded-xl shadow-sm border border-emerald-100">
            <div
              className="prose max-w-none text-slate-800 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: cvData.cv_text.replace(/\n/g, '<br />') }}
            />
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between gap-3 mt-6"
        >
          <Link
            href="/dashboard/profil/cv"
            className="px-6 py-3 text-slate-700 bg-white/80 backdrop-blur-xl border border-emerald-200/50 rounded-xl hover:bg-white transition-all font-medium text-center min-h-[48px] flex items-center justify-center"
          >
            Tillbaka till Mina CV:n
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={`/dashboard/profil/cv/${id}/edit`}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl min-h-[48px] flex items-center justify-center"
            >
              Redigera CV
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
