'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Search,
  ChevronDown,
  Download,
  Eye,
  MoreHorizontal,
  Filter,
  RefreshCw,
  CreditCard,
  AlertTriangle,
  Check,
  Bot,
  Scale,
  Building2,
  Sparkles,
  Lightbulb,
  Trophy
} from 'lucide-react';

// Typdefinitioner för brev
interface Letter {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string | null;
  title: string;
  company: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string | null;
  is_saved: boolean;
  tonality: string;
  language: string;
  content: string; // Vi använder det fullständiga innehållet 
  // Nya AI-metadata fält
  ai_model?: string | null;
  ai_tokens?: number | null;
  ai_cost?: number | null;
  generation_time_ms?: number | null;
  metadata?: {
    cost?: number | null;
    model?: string;
    tokens?: number;
  } | null;
}

// Funktion för att visa tonalitetsikon
const TonalityIcon = ({ tonality }: { tonality: string }) => {
  switch (tonality) {
    case 'professional':
      return <Building2 className="w-4 h-4 text-blue-400" />;
    case 'enthusiastic':
      return <Sparkles className="w-4 h-4 text-pink-400" />;
    case 'creative':
      return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    case 'confident':
      return <Trophy className="w-4 h-4 text-amber-400" />;
    case 'balanced':
      return <Scale className="w-4 h-4 text-emerald-400" />;
    case 'auto':
      return <Bot className="w-4 h-4 text-purple-400" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

// Formatera kostnad från dollar till kronor med rätt precision
const formatCost = (cost: number | null | undefined): string => {
  if (cost === null || cost === undefined) return '-';
  // Antag en växelkurs på 10.5 SEK per USD
  const costInSEK = cost * 10.5;
  return costInSEK.toFixed(2) + ' kr';
};

export default function AdminLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    saved: 'all', // 'all', 'saved', 'unsaved'
    language: 'all', // 'all', 'sv', 'en'
    tonality: 'all' // 'all', 'professional', 'enthusiastic', etc.
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Statistik
  const [stats, setStats] = useState({
    totalLetters: 0,
    savedLetters: 0,
    totalCost: 0,
    averageCost: 0,
    svLetters: 0,
    enLetters: 0
  });

  const supabase = getSupabaseClient();

  // Hämta brev från backend
  const fetchLetters = async () => {
    setIsLoading(true);
    try {
      // Först behöver vi hämta alla users och deras profiler
      // för att vi kan länka med breven senare
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) {
        console.error('Fel vid hämtning av profiler:', profilesError);
        throw new Error('Kunde inte hämta användarinformation');
      }
      
      // Skapa en lookup-tabell för profiler
      const profileLookup = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Nu hämtar vi alla brev
      const { data: lettersData, error: lettersError } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false });

      if (lettersError) {
        console.error('Fel vid hämtning av brev:', lettersError);
        throw new Error('Kunde inte hämta brevdata');
      }

      // Hämta även användaraktiviteter för att få kostnadsinformation
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .in('activity_type', ['letter_created', 'letter_generation_started'])
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.warn('Kunde inte hämta aktivitetsdata för kostnader:', activitiesError);
      }

      // Skapa en lookup-tabell för kostnader från aktivitetsloggen
      const costLookup = {} as Record<string, any>;
      
      if (activities && activities.length > 0) {
        activities.forEach(activity => {
          if (activity.metadata && activity.metadata.cv_id) {
            // Använd cv_id som en nyckel för att hitta kostnadsdata
            // eftersom vi inte har letter_id i aktivitetsloggning
            const key = `${activity.user_id}_${activity.metadata.cv_id}_${activity.created_at.split('T')[0]}`;
            
            if (activity.activity_type === 'letter_created' && 
                activity.metadata.cost !== undefined) {
              costLookup[key] = {
                cost: activity.metadata.cost,
                model: activity.metadata.model || 'unknown',
                tokens: activity.metadata.tokens || null
              };
            }
          }
        });
      }

      // Transformera brevdata med användarinformation
      const transformedData = (lettersData || []).map((letter: any) => {
        // Försök hitta matchande kostnadsinformation från aktivitetsloggen som fallback
        const dateStr = new Date(letter.created_at).toISOString().split('T')[0];
        const costKey = `${letter.user_id}_${letter.cv_id}_${dateStr}`;
        const costInfo = costLookup[costKey] || {};
        
        // Hämta profilinformation
        const profile = profileLookup[letter.user_id] || {};
        
        return {
          id: letter.id,
          user_id: letter.user_id,
          email: profile.email || 'Okänd e-post',
          full_name: profile.full_name || null,
          title: letter.title || 'Namnlöst brev',
          company: letter.company || null,
          job_title: letter.job_title || null,
          created_at: letter.created_at,
          updated_at: letter.updated_at,
          is_saved: letter.is_saved || false,
          tonality: letter.tonality || 'balanced',
          language: letter.language || 'sv',
          content: letter.content || '',
          // Använd de nya direkt lagrade fälten
          ai_model: letter.ai_model || null,
          ai_tokens: letter.ai_tokens || null,
          ai_cost: letter.ai_cost || null,
          generation_time_ms: letter.generation_time_ms || null,
          // Kostnadsdata från aktivitetsloggen som fallback
          metadata: {
            cost: letter.ai_cost || costInfo.cost || null,
            model: letter.ai_model || costInfo.model || 'unknown',
            tokens: letter.ai_tokens || costInfo.tokens || null
          }
        };
      });
      
      // Sortera data enligt nuvarande sortering
      const sortedData = sortData(transformedData, sortField, sortDirection);
      
      setLetters(sortedData);
      setFilteredLetters(sortedData);
      calculateStats(sortedData);
      setLastUpdated(new Date());
      
    } catch (err: any) {
      console.error('Fel vid hämtning av brev:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av brev');
    } finally {
      setIsLoading(false);
    }
  };

  // Beräkna statistik
  const calculateStats = (data: Letter[]) => {
    if (!data.length) {
      setStats({
        totalLetters: 0,
        savedLetters: 0,
        totalCost: 0,
        averageCost: 0,
        svLetters: 0,
        enLetters: 0
      });
      return;
    }
    
    const savedLetters = data.filter(letter => letter.is_saved).length;
    
    // Beräkna totalkostnad (endast för brev med kostnad)
    let totalCost = 0;
    let lettersWithCost = 0;
    
    data.forEach(letter => {
      // Prioritera det direkta ai_cost-fältet framför metadata
      const cost = letter.ai_cost !== null && letter.ai_cost !== undefined 
        ? letter.ai_cost 
        : letter.metadata?.cost;
        
      if (cost !== null && cost !== undefined) {
        totalCost += cost;
        lettersWithCost++;
      }
    });
    
    const averageCost = lettersWithCost > 0 ? totalCost / lettersWithCost : 0;
    
    setStats({
      totalLetters: data.length,
      savedLetters,
      totalCost,
      averageCost,
      svLetters: data.filter(letter => letter.language === 'sv').length,
      enLetters: data.filter(letter => letter.language === 'en').length
    });
  };

  // Sortera data
  const sortData = (data: Letter[], field: string, direction: 'asc' | 'desc'): Letter[] => {
    return [...data].sort((a, b) => {
      // För specialfält som är i metadata 
      if (field === 'cost') {
        // Prioritera ai_cost fältet, fallback till metadata
        const costA = a.ai_cost !== null && a.ai_cost !== undefined ? a.ai_cost : (a.metadata?.cost || 0);
        const costB = b.ai_cost !== null && b.ai_cost !== undefined ? b.ai_cost : (b.metadata?.cost || 0);
        return direction === 'asc' ? costA - costB : costB - costA;
      }
      
      if (field === 'tokens') {
        // Prioritera ai_tokens fältet, fallback till metadata
        const tokensA = a.ai_tokens !== null && a.ai_tokens !== undefined ? a.ai_tokens : (a.metadata?.tokens || 0);
        const tokensB = b.ai_tokens !== null && b.ai_tokens !== undefined ? b.ai_tokens : (b.metadata?.tokens || 0);
        return direction === 'asc' ? tokensA - tokensB : tokensB - tokensA;
      }
      
      let valA = a[field as keyof Letter];
      let valB = b[field as keyof Letter];
      
      // Hantera null/undefined värden
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';
      
      // Specialhantering för datum
      if (field === 'created_at' || field === 'updated_at') {
        return direction === 'asc' 
          ? new Date(valA as string).getTime() - new Date(valB as string).getTime()
          : new Date(valB as string).getTime() - new Date(valA as string).getTime();
      }
      
      // Standardjämförelse för strängar och andra typer
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Uppdatera sortering
  const updateSorting = (field: string) => {
    if (field === sortField) {
      // Växla sorteringsriktning om samma fält klickas igen
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sätt nytt fält och standardriktning
      setSortField(field);
      setSortDirection('desc'); // Nyare först som standard
    }
  };

  // Filtrera brev
  const filterLetters = () => {
    let result = [...letters];
    
    // Sökterm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(letter => 
        (letter.title && letter.title.toLowerCase().includes(searchLower)) ||
        (letter.company && letter.company.toLowerCase().includes(searchLower)) ||
        (letter.job_title && letter.job_title.toLowerCase().includes(searchLower)) ||
        (letter.email && letter.email.toLowerCase().includes(searchLower)) ||
        (letter.full_name && letter.full_name.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter för sparade/osparade
    if (filters.saved !== 'all') {
      const isSaved = filters.saved === 'saved';
      result = result.filter(letter => letter.is_saved === isSaved);
    }
    
    // Filter för språk
    if (filters.language !== 'all') {
      result = result.filter(letter => letter.language === filters.language);
    }
    
    // Filter för tonalitet
    if (filters.tonality !== 'all') {
      result = result.filter(letter => letter.tonality === filters.tonality);
    }
    
    // Sortera resultatet
    return sortData(result, sortField, sortDirection);
  };

  // Hämta brev när komponenten laddas
  useEffect(() => {
    fetchLetters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Uppdatera filtrerade brev när sökterm, filter eller sortering ändras
  useEffect(() => {
    const filtered = filterLetters();
    setFilteredLetters(filtered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, sortField, sortDirection, letters]);

  // Formatera tid "sedan"
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just nu';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min sedan`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} tim sedan`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} dag${diffInDays !== 1 ? 'ar' : ''} sedan`;
    }
    
    // För äldre datum, visa faktiskt datum
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Kort innehållsförhandsvisning
  const getContentPreview = (content: string | undefined, length: number = 100): string => {
    if (!content) return 'Inget innehåll';
    return content.length > length ? content.substring(0, length) + '...' : content;
  };

  // Formatera språk
  const formatLanguage = (lang: string): string => {
    switch(lang) {
      case 'sv': return '🇸🇪 Svenska';
      case 'en': return '🇬🇧 Engelska';
      default: return lang;
    }
  };

  // Formatera tonalitet
  const formatTonality = (tonality: string): string => {
    switch(tonality) {
      case 'professional': return 'Professionell';
      case 'enthusiastic': return 'Entusiastisk';
      case 'creative': return 'Kreativ';
      case 'confident': return 'Självsäker';
      case 'balanced': return 'Balanserad';
      case 'auto': return 'AI-val';
      default: return tonality;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Laddar brev...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">Ett fel uppstod</h2>
        <p className="text-red-200">{error}</p>
        <button 
          onClick={fetchLetters}
          className="mt-4 px-4 py-2 bg-pink-600 rounded-md text-white"
        >
          Försök igen
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Sidtiteln */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alla brev</h1>
          <p className="text-gray-400 mt-1">Hantera och analysera alla genererade brev i systemet</p>
        </div>

        <div className="flex items-center gap-2 bg-navy-800 px-3 py-1.5 rounded-md border border-gray-700 self-start sm:self-center">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm whitespace-nowrap">
            Uppdaterad: {lastUpdated ? lastUpdated.toLocaleTimeString('sv-SE') : '...'}
          </span>
          
          <button 
            onClick={fetchLetters}
            className="ml-2 text-pink-500 hover:text-pink-400"
            aria-label="Uppdatera data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistiköversikt */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Totalt antal brev */}
        <div className="bg-navy-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Totalt antal brev</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.totalLetters}</h3>
        </div>
        
        {/* Sparade brev */}
        <div className="bg-navy-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Sparade brev</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.savedLetters}</h3>
        </div>
        
        {/* Svenska brev */}
        <div className="bg-navy-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Svenska brev</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.svLetters}</h3>
        </div>
        
        {/* Engelska brev */}
        <div className="bg-navy-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Engelska brev</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.enLetters}</h3>
        </div>
        
        {/* Total kostnad */}
        <div className="bg-navy-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Total kostnad</p>
          <h3 className="text-xl font-bold text-white mt-1">{formatCost(stats.totalCost)}</h3>
        </div>
        
        {/* Genomsnittskostnad */}
        <div className="bg-navy-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400">Genomsnittskostnad</p>
          <h3 className="text-xl font-bold text-white mt-1">{formatCost(stats.averageCost)}</h3>
        </div>
      </div>

      {/* Sök- och filtersektion */}
      <div className="bg-navy-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sökfält */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Sök efter titel, företag eller användare..."
              className="bg-navy-700 border border-gray-600 text-white px-10 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter för sparade/osparade */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                className="bg-navy-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                value={filters.saved}
                onChange={(e) => setFilters({...filters, saved: e.target.value})}
              >
                <option value="all">Alla brev</option>
                <option value="saved">Sparade brev</option>
                <option value="unsaved">Osparade brev</option>
              </select>
            </div>
          </div>
          
          {/* Filter för språk */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                className="bg-navy-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                value={filters.language}
                onChange={(e) => setFilters({...filters, language: e.target.value})}
              >
                <option value="all">Alla språk</option>
                <option value="sv">Svenska</option>
                <option value="en">Engelska</option>
              </select>
            </div>
          </div>
          
          {/* Filter för tonalitet */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                className="bg-navy-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                value={filters.tonality}
                onChange={(e) => setFilters({...filters, tonality: e.target.value})}
              >
                <option value="all">Alla tonaliteter</option>
                <option value="professional">Professionell</option>
                <option value="enthusiastic">Entusiastisk</option>
                <option value="creative">Kreativ</option>
                <option value="confident">Självsäker</option>
                <option value="balanced">Balanserad</option>
                <option value="auto">AI-val</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Brevtabell */}
      <div className="bg-navy-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-navy-700">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => updateSorting('title')}
                >
                  <div className="flex items-center">
                    Titel
                    {sortField === 'title' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => updateSorting('full_name')}
                >
                  <div className="flex items-center">
                    Användare
                    {sortField === 'full_name' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => updateSorting('created_at')}
                >
                  <div className="flex items-center">
                    Skapat
                    {sortField === 'created_at' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => updateSorting('language')}
                >
                  <div className="flex items-center">
                    Språk
                    {sortField === 'language' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => updateSorting('tonality')}
                >
                  <div className="flex items-center">
                    Tonalitet
                    {sortField === 'tonality' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => updateSorting('cost')}
                >
                  <div className="flex items-center">
                    Kostnad
                    {sortField === 'cost' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-navy-800 divide-y divide-gray-700">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                    <p>Inga brev hittades</p>
                    <p className="text-sm mt-1">Ändra dina sökfilter eller ladda upp mer innehåll</p>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-navy-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-pink-500/10">
                          <FileText className="h-5 w-5 text-pink-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{letter.title || "Namnlöst brev"}</div>
                          {letter.company && (
                            <div className="text-xs text-gray-400">
                              Företag: {letter.company}
                            </div>
                          )}
                          {letter.job_title && (
                            <div className="text-xs text-gray-400">
                              Tjänst: {letter.job_title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{letter.full_name || "Namnlös användare"}</div>
                      <div className="text-xs text-gray-400">{letter.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatTimeAgo(letter.created_at)}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(letter.created_at).toLocaleDateString('sv-SE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-navy-700 text-white">
                        {formatLanguage(letter.language)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TonalityIcon tonality={letter.tonality} />
                        <span className="ml-1.5 text-sm text-white">
                          {formatTonality(letter.tonality)}
                        </span>
                        {letter.tonality === 'auto' && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-pink-400 mr-1.5" />
                        <span className="text-sm text-white">
                          {letter.ai_cost ? formatCost(letter.ai_cost) : (letter.metadata?.cost ? formatCost(letter.metadata.cost) : '-')}
                        </span>
                      </div>
                      {(letter.ai_model || letter.metadata?.model) && (
                        <div className="text-xs text-gray-400 mt-1">
                          {letter.ai_model || letter.metadata?.model} {letter.ai_tokens || letter.metadata?.tokens ? `(${letter.ai_tokens || letter.metadata?.tokens} tokens)` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {letter.is_saved ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400">
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Sparat
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-400">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                          Ej sparat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedLetter(letter);
                          setIsPreviewOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidnumrering - kan implementeras senare */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-400">
          Visar {filteredLetters.length} av {letters.length} brev
        </div>
        {/* Placehållare för sidnumrering */}
        <div></div>
      </div>

      {/* Modal för brevförhandsvisning */}
      {isPreviewOpen && selectedLetter && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-white">
                {selectedLetter.title || "Namnlöst brev"}
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-grow">
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Information</h4>
                  <div className="bg-navy-700 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Användare:</span>
                      <span className="text-white font-medium">{selectedLetter.full_name || "Namnlös användare"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Språk:</span>
                      <span className="text-white font-medium">{formatLanguage(selectedLetter.language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tonalitet:</span>
                      <span className="text-white font-medium flex items-center">
                        <TonalityIcon tonality={selectedLetter.tonality} />
                        <span className="ml-1">{formatTonality(selectedLetter.tonality)}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sparat:</span>
                      <span className="text-white font-medium">{selectedLetter.is_saved ? 'Ja' : 'Nej'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Skapat:</span>
                      <span className="text-white font-medium">
                        {new Date(selectedLetter.created_at).toLocaleString('sv-SE')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">AI-information</h4>
                  <div className="bg-navy-700 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Modell:</span>
                      <span className="text-white font-medium">{selectedLetter.ai_model || selectedLetter.metadata?.model || 'Okänd'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tokens:</span>
                      <span className="text-white font-medium">{selectedLetter.ai_tokens || selectedLetter.metadata?.tokens || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kostnad (USD):</span>
                      <span className="text-white font-medium">
                        ${(selectedLetter.ai_cost || selectedLetter.metadata?.cost || 0).toFixed(4) || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kostnad (SEK):</span>
                      <span className="text-white font-medium">
                        {formatCost(selectedLetter.ai_cost || selectedLetter.metadata?.cost)}
                      </span>
                    </div>
                    {selectedLetter.generation_time_ms && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Generingstid:</span>
                        <span className="text-white font-medium">{(selectedLetter.generation_time_ms / 1000).toFixed(2)} sek</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-300">Företag:</span>
                      <span className="text-white font-medium">{selectedLetter.company || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tjänst:</span>
                      <span className="text-white font-medium">{selectedLetter.job_title || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Brevinnehåll */}
              <h4 className="text-sm font-medium text-gray-400 mb-1">Brevinnehåll</h4>
              <div className="bg-white text-gray-800 rounded-md p-6 overflow-auto prose max-w-none">
                {selectedLetter.content ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedLetter.content.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-gray-500 italic">Innehåll inte tillgängligt</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-2"
              >
                Stäng
              </button>
              {/* Här skulle man kunna lägga till fler åtgärdsknappar vid behov */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}