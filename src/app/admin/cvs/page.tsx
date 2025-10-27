'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { 
  FileText, 
  Search, 
  Filter,
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Download,
  Trash,
  Calendar,
  User,
  File,
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// Typdefinitioner
interface CVText {
  id: string;
  user_id: string;
  file_name: string;
  original_file_path: string | null;
  cv_text: string;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string | null;
}

interface CVStats {
  totalCVs: number;
  averageLength: number;
  todaysCVs: number;
  thisWeekCVs: number;
}

export default function AdminCVsPage() {
  // State för CV-listan och filtrering
  const [cvs, setCVs] = useState<CVText[]>([]);
  const [filteredCVs, setFilteredCVs] = useState<CVText[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State för paginering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State för sortering
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State för filtrering
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'today', 'week', 'month'
  
  // State för modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CVText | null>(null);
  
  // State för statistik
  const [stats, setStats] = useState<CVStats>({
    totalCVs: 0,
    averageLength: 0,
    todaysCVs: 0,
    thisWeekCVs: 0
  });
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabase = getSupabaseClient();

  // Funktion för att få filtrerade och sorterade CV:n
  const getFilteredAndSortedCVs = useCallback((cvList = cvs) => {
    let result = [...cvList];
    
    // Applicera sökning
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(cv => 
        (cv.file_name && cv.file_name.toLowerCase().includes(searchLower)) ||
        (cv.email && cv.email.toLowerCase().includes(searchLower)) ||
        (cv.full_name && cv.full_name.toLowerCase().includes(searchLower)) ||
        (cv.cv_text && cv.cv_text.toLowerCase().includes(searchLower))
      );
    }
    
    // Applicera datumfilter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      result = result.filter(cv => {
        const cvDate = new Date(cv.created_at);
        switch (dateFilter) {
          case 'today':
            return cvDate >= today;
          case 'week':
            return cvDate >= weekAgo;
          case 'month':
            return cvDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    // Applicera sortering
    result.sort((a, b) => {
      const valA = sortField === 'cv_length' ? a.cv_text.length :
                   sortField === 'file_size' ? a.cv_text.length :
                   a[sortField as keyof CVText];
      const valB = sortField === 'cv_length' ? b.cv_text.length :
                   sortField === 'file_size' ? b.cv_text.length :
                   b[sortField as keyof CVText];

      // Hantera null/undefined-värden
      if (valA == null && valB == null) return 0;
      if (valA == null) return sortDirection === 'asc' ? -1 : 1;
      if (valB == null) return sortDirection === 'asc' ? 1 : -1;

      // Sortera datum
      if (sortField === 'created_at' || sortField === 'updated_at') {
         const dateA = new Date(valA as string).getTime();
         const dateB = new Date(valB as string).getTime();
         return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Sortera strängar och nummer
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
    
    return result;
  }, [cvs, searchTerm, dateFilter, sortField, sortDirection]);

  // Hämta CV:n från databasen
  useEffect(() => {
    async function fetchCVs() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Hämta CV:n med användarprofiler
        const { data: cvsData, error: cvsError } = await supabase
          .from('cv_texts')
          .select(`
            *,
            profiles!fk_cv_texts_user_id (
              id,
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (cvsError) {
          throw cvsError;
        }

        // Transformera data
        const transformedData = (cvsData || []).map((cv: any) => {
          const profile = cv.profiles || {};
          
          return {
            id: cv.id,
            user_id: cv.user_id,
            file_name: cv.file_name || 'Namnlös fil',
            original_file_path: cv.original_file_path,
            cv_text: cv.cv_text || '',
            created_at: cv.created_at,
            updated_at: cv.updated_at,
            email: profile.email || 'Okänd e-post',
            full_name: profile.full_name || null
          };
        });
        
        setCVs(transformedData);
        calculateStats(transformedData);
        setLastUpdated(new Date());
        
      } catch (err: any) {
        console.error('Fel vid hämtning av CV:n:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av CV:n');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCVs();
  }, [supabase]);

  // Beräkna statistik
  const calculateStats = (data: CVText[]) => {
    if (!data.length) {
      setStats({
        totalCVs: 0,
        averageLength: 0,
        todaysCVs: 0,
        thisWeekCVs: 0
      });
      return;
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todaysCVs = data.filter(cv => new Date(cv.created_at) >= todayStart).length;
    const thisWeekCVs = data.filter(cv => new Date(cv.created_at) >= weekStart).length;
    
    const totalLength = data.reduce((sum, cv) => sum + cv.cv_text.length, 0);
    const averageLength = data.length > 0 ? Math.round(totalLength / data.length) : 0;

    setStats({
      totalCVs: data.length,
      averageLength,
      todaysCVs,
      thisWeekCVs
    });
  };

  // Uppdatera filtrerade CV:n
  useEffect(() => {
    const filteredResults = getFilteredAndSortedCVs();
    setFilteredCVs(filteredResults);
    
    // Beräkna totalt antal sidor
    const newTotalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
    setTotalPages(newTotalPages);
    
    // Justera currentPage om den är utanför giltigt intervall
    setCurrentPage(prev => Math.max(1, Math.min(prev, newTotalPages)));
  }, [getFilteredAndSortedCVs, pageSize]);

  // Hantera sortering
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Få sorteringsikon för kolumn
  const getSortIcon = (field: string) => {
    if (field !== sortField) return <ChevronDown className="w-4 h-4 text-gray-500 opacity-50" />;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-pink-400" /> 
      : <ChevronDown className="w-4 h-4 text-pink-400" />;
  };

  // Visa CV-förhandsvisning
  const showCVPreview = (cv: CVText) => {
    setSelectedCV(cv);
    setShowPreviewModal(true);
  };

  // Stäng modal
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedCV(null);
  };

  // Få de aktuella CV:na för den visade sidan
  const getCurrentPageCVs = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCVs.slice(startIndex, endIndex);
  };

  // Formatera datum
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error("Failed to format date:", dateStr, e);
      return '-';
    }
  };

  // Formatera filstorlek
  const formatFileSize = (text: string): string => {
    const bytes = new Blob([text]).size;
    const sizes = ['B', 'KB', 'MB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  // Förkorta text för förhandsvisning
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return 'Inget innehåll';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Hantera ändring av sidstorlek
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hantera CV:n</h1>
          <p className="text-gray-600">
            {filteredCVs.length} CV:n matchar filter
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 text-sm whitespace-nowrap">
            Uppdaterad: {lastUpdated ? lastUpdated.toLocaleTimeString('sv-SE') : '...'}
          </span>

          <button
            onClick={() => window.location.reload()}
            className="ml-2 text-pink-600 hover:text-pink-700"
            aria-label="Uppdatera data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600">Totalt antal CV:n</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.totalCVs}</h3>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600">Genomsnittlig längd</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.averageLength.toLocaleString()} tecken</h3>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600">Idag</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.todaysCVs}</h3>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600">Denna vecka</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.thisWeekCVs}</h3>
        </div>
      </div>
      
      {/* Sök och filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch flex-grow">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Sök filnamn, användare eller innehåll..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 h-full bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 h-full bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm"
          >
            <option value="all">Alla datum</option>
            <option value="today">Idag</option>
            <option value="week">Senaste veckan</option>
            <option value="month">Senaste månaden</option>
          </select>
        </div>
      </div>

      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-4" role="alert">
          <h2 className="text-lg font-semibold text-red-900 mb-1">Ett fel uppstod</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* CV-tabell */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Laddar CV:n...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('file_name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Filnamn</span>
                        {getSortIcon('file_name')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Användare</span>
                        {getSortIcon('full_name')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('cv_length')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Storlek</span>
                        {getSortIcon('cv_length')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      <span>Förhandsvisning</span>
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Skapad</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCVs.length === 0 ? (
                     <tr>
                       <td colSpan={6} className="px-6 py-12 text-center">
                         <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inga CV:n hittades</h3>
                          <p className="text-gray-600 text-sm">
                            {searchTerm || dateFilter !== 'all'
                              ? 'Inga CV:n matchar dina filter.'
                              : 'Det finns inga CV:n än.'}
                          </p>
                         </div>
                       </td>
                     </tr>
                  ) : (
                    getCurrentPageCVs().map((cv) => (
                      <tr key={cv.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center ring-1 ring-pink-200">
                              <File className="w-5 h-5 text-pink-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={cv.file_name}>
                                {cv.file_name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatFileSize(cv.cv_text)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-1 ring-gray-300">
                              <span className="text-xs font-medium text-gray-700">
                                {cv.full_name
                                  ? cv.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                  : cv.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={cv.full_name || 'Namnlös användare'}>
                                {cv.full_name || <span className="italic text-gray-500">Namnlös</span>}
                              </div>
                              <div className="text-xs text-gray-600 truncate max-w-[150px]" title={cv.email}>{cv.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {cv.cv_text.length.toLocaleString()} tecken
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4">
                          <div className="text-xs text-gray-600 max-w-xs">
                            {truncateText(cv.cv_text, 80)}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(cv.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => showCVPreview(cv)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                              aria-label={`Visa ${cv.file_name}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="text-gray-500 hover:text-pink-600 opacity-50 group-hover:opacity-100 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white transition-opacity"
                              aria-label={`Åtgärder för ${cv.file_name}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 gap-4">
                <div className="flex items-center gap-2">
                   <label htmlFor="pageSize" className="text-sm text-gray-600">Visa:</label>
                   <select
                     id="pageSize"
                     value={pageSize}
                     onChange={handlePageSizeChange}
                     className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                   >
                     <option value={10}>10</option>
                     <option value={25}>25</option>
                     <option value={50}>50</option>
                     <option value={100}>100</option>
                   </select>
                   <span className="text-sm text-gray-600">per sida</span>
                 </div>

                <div className="flex-1 flex justify-between sm:justify-end items-center w-full md:w-auto">
                  {/* Mobile Pagination */}
                  <div className="sm:hidden flex-1 flex justify-between">
                     <button
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       disabled={currentPage === 1}
                       className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Föreg.
                     </button>
                      <span className="text-sm text-gray-600 mx-2">
                        Sida {currentPage} av {totalPages}
                      </span>
                     <button
                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                       disabled={currentPage === totalPages}
                       className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Nästa
                     </button>
                   </div>

                   {/* Desktop Pagination */}
                   <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between md:justify-end">
                     <div>
                      <p className="text-sm text-gray-600">
                        Visar <span className="font-medium text-gray-900">{(currentPage - 1) * pageSize + 1}</span>
                        {' '}till{' '}
                        <span className="font-medium text-gray-900">{Math.min(currentPage * pageSize, filteredCVs.length)}</span>
                        {' '}av{' '}
                        <span className="font-medium text-gray-900">{filteredCVs.length}</span> resultat
                      </p>
                    </div>
                    <div className="ml-4">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          aria-label="Föregående sida"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                           const pageNum = i + 1;
                           const showPage = pageNum === 1 || pageNum === totalPages || pageNum === currentPage || Math.abs(pageNum - currentPage) <= 1;

                           if (showPage) {
                             return (
                               <button
                                 key={pageNum}
                                 onClick={() => setCurrentPage(pageNum)}
                                 aria-current={currentPage === pageNum ? 'page' : undefined}
                                 className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 ${
                                   currentPage === pageNum
                                     ? 'z-10 bg-pink-600 text-white border-pink-500'
                                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                 }`}
                               >
                                 {pageNum}
                               </button>
                             );
                           }
                           return null;
                          })}

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          aria-label="Nästa sida"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* CV Förhandsvisnings Modal */}
      {showPreviewModal && selectedCV && (
        <div
           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity p-4"
           onClick={closePreviewModal}
           role="dialog"
           aria-modal="true"
           aria-labelledby="modal-title"
        >
          <div
             className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] relative shadow-xl border border-gray-200 flex flex-col"
             onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 id="modal-title" className="text-xl font-semibold text-gray-900">{selectedCV.file_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCV.full_name || 'Namnlös användare'} • {selectedCV.email}
                </p>
              </div>
              <button
                onClick={closePreviewModal}
                className="text-gray-500 hover:text-gray-900 text-2xl leading-none"
                aria-label="Stäng modal"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto">
              {/* CV Info */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Storlek:</span>
                    <span className="ml-2 text-gray-900 font-medium">{formatFileSize(selectedCV.cv_text)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tecken:</span>
                    <span className="ml-2 text-gray-900 font-medium">{selectedCV.cv_text.length.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Skapad:</span>
                    <span className="ml-2 text-gray-900 font-medium">{formatDate(selectedCV.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* CV Content */}
              <div className="p-6">
                <div className="bg-gray-50 text-gray-800 rounded-md p-6 overflow-auto prose max-w-none border border-gray-200" style={{ maxHeight: '400px' }}>
                  {selectedCV.cv_text ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedCV.cv_text}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">Innehåll inte tillgängligt</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2 flex-shrink-0 bg-gray-50">
              <button
                onClick={closePreviewModal}
                className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Stäng
              </button>
              <Link
                href={`/admin/users/${selectedCV.user_id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                onClick={() => setShowPreviewModal(false)}
              >
                <User className="w-4 h-4 mr-1" />
                Visa användare
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}