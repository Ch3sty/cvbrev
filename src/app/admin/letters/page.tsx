'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  FileText, Clock, Search, ChevronDown, Eye, MoreHorizontal, Filter,
  RefreshCw, CreditCard, AlertTriangle, Check, Bot, Scale, Building2,
  Sparkles, Lightbulb, Trophy, TrendingUp, DollarSign
} from 'lucide-react';
import LetterGenerationChart from '@/components/admin/charts/LetterGenerationChart';
import LetterCostChart from '@/components/admin/charts/LetterCostChart';

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
  content: string;
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

const TonalityIcon = ({ tonality }: { tonality: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    professional: <Building2 className="w-4 h-4 text-blue-500" />,
    enthusiastic: <Sparkles className="w-4 h-4 text-pink-500" />,
    creative: <Lightbulb className="w-4 h-4 text-yellow-500" />,
    confident: <Trophy className="w-4 h-4 text-amber-500" />,
    balanced: <Scale className="w-4 h-4 text-emerald-500" />,
    auto: <Bot className="w-4 h-4 text-purple-500" />
  };
  return icons[tonality] || <FileText className="w-4 h-4 text-gray-500" />;
};

const formatCost = (cost: number | null | undefined): string => {
  if (cost === null || cost === undefined) return '-';
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
  const [dateRange, setDateRange] = useState<number>(30);
  const [filters, setFilters] = useState({
    saved: 'all',
    language: 'all',
    tonality: 'all'
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [letterGrowthData, setLetterGrowthData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [openAICosts, setOpenAICosts] = useState<any>(null);

  const [stats, setStats] = useState({
    totalLetters: 0,
    savedLetters: 0,
    totalCost: 0,
    averageCost: 0,
    svLetters: 0,
    enLetters: 0,
    actualCost: 0,
    costDifference: 0
  });

  const supabase = getSupabaseClient();

  const calculateGraphData = (lettersData: Letter[]) => {
    const now = new Date();
    const startDate = new Date();
    if (dateRange === 9999) {
      if (lettersData.length > 0) {
        const oldestDate = new Date(lettersData[lettersData.length - 1].created_at);
        startDate.setTime(oldestDate.getTime());
      } else {
        startDate.setDate(now.getDate() - 30);
      }
    } else {
      startDate.setDate(now.getDate() - dateRange);
    }
    startDate.setHours(0, 0, 0, 0);

    const dataMap = new Map<string, { new_letters: number; total_letters: number; daily_cost_usd: number; cumulative_cost_usd: number; }>();

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dataMap.set(dateStr, {
        new_letters: 0,
        total_letters: 0,
        daily_cost_usd: 0,
        cumulative_cost_usd: 0
      });
    }

    let totalCount = 0;
    let cumulativeCost = 0;

    lettersData.forEach(letter => {
      const letterDate = new Date(letter.created_at);
      if (letterDate >= startDate) {
        const dateStr = letterDate.toISOString().split('T')[0];
        const data = dataMap.get(dateStr);
        if (data) {
          data.new_letters++;
          const cost = letter.ai_cost || letter.metadata?.cost || 0;
          data.daily_cost_usd += cost;
        }
      }
    });

    const sortedDates = Array.from(dataMap.keys()).sort();
    sortedDates.forEach(dateStr => {
      const data = dataMap.get(dateStr)!;
      totalCount += data.new_letters;
      cumulativeCost += data.daily_cost_usd;
      data.total_letters = totalCount;
      data.cumulative_cost_usd = cumulativeCost;
    });

    const growthData = sortedDates.map(date => ({
      date,
      new_letters: dataMap.get(date)!.new_letters,
      total_letters: dataMap.get(date)!.total_letters
    }));

    const costChartData = sortedDates.map(date => {
      const data = dataMap.get(date)!;
      return {
        date,
        daily_cost_usd: data.daily_cost_usd,
        daily_cost_sek: data.daily_cost_usd * 10.5,
        cumulative_cost_usd: data.cumulative_cost_usd,
        cumulative_cost_sek: data.cumulative_cost_usd * 10.5
      };
    });

    setLetterGrowthData(growthData);
    setCostData(costChartData);
  };

  const fetchLetters = async () => {
    setIsLoading(true);
    try {
      const { data: lettersData, error: lettersError } = await supabase
        .from('letters')
        .select(`*, profiles!fk_letters_user_id (id, email, full_name)`)
        .order('created_at', { ascending: false });

      if (lettersError) throw new Error('Kunde inte hämta brevdata');

      const transformedData = (lettersData || []).map((letter: any) => ({
        id: letter.id,
        user_id: letter.user_id,
        email: letter.profiles?.email || 'Okänd e-post',
        full_name: letter.profiles?.full_name || null,
        title: letter.title || 'Namnlöst brev',
        company: letter.company || null,
        job_title: letter.job_title || null,
        created_at: letter.created_at,
        updated_at: letter.updated_at,
        is_saved: letter.is_saved || false,
        tonality: letter.tonality || 'balanced',
        language: letter.language || 'sv',
        content: letter.content || '',
        ai_model: letter.ai_model || null,
        ai_tokens: letter.ai_tokens || null,
        ai_cost: letter.ai_cost || null,
        generation_time_ms: letter.generation_time_ms || null,
        metadata: {
          cost: letter.ai_cost || null,
          model: letter.ai_model || 'unknown',
          tokens: letter.ai_tokens || null
        }
      }));

      setLetters(transformedData);
      setFilteredLetters(transformedData);
      calculateStats(transformedData);
      calculateGraphData(transformedData);
      setLastUpdated(new Date());

      try {
        const response = await fetch(`/api/admin/openai-usage?days=${dateRange}`);
        if (response.ok) {
          const data = await response.json();
          setOpenAICosts(data);
        }
      } catch (err) {
        console.error('Could not fetch OpenAI costs:', err);
      }

    } catch (err: any) {
      console.error('Fel vid hämtning av brev:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av brev');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Letter[]) => {
    if (!data.length) {
      setStats({
        totalLetters: 0, savedLetters: 0, totalCost: 0, averageCost: 0,
        svLetters: 0, enLetters: 0, actualCost: 0, costDifference: 0
      });
      return;
    }

    const savedLetters = data.filter(letter => letter.is_saved).length;
    let totalCost = 0;
    let lettersWithCost = 0;

    data.forEach(letter => {
      const cost = letter.ai_cost !== null && letter.ai_cost !== undefined
        ? letter.ai_cost : letter.metadata?.cost;
      if (cost !== null && cost !== undefined) {
        totalCost += cost;
        lettersWithCost++;
      }
    });

    const averageCost = lettersWithCost > 0 ? totalCost / lettersWithCost : 0;
    const actualCost = openAICosts?.data?.totalCost || 0;
    const costDifference = actualCost - totalCost;

    setStats({
      totalLetters: data.length,
      savedLetters,
      totalCost,
      averageCost,
      svLetters: data.filter(letter => letter.language === 'sv').length,
      enLetters: data.filter(letter => letter.language === 'en').length,
      actualCost,
      costDifference
    });
  };

  const sortData = (data: Letter[], field: string, direction: 'asc' | 'desc'): Letter[] => {
    return [...data].sort((a, b) => {
      if (field === 'cost') {
        const costA = a.ai_cost ?? a.metadata?.cost ?? 0;
        const costB = b.ai_cost ?? b.metadata?.cost ?? 0;
        return direction === 'asc' ? costA - costB : costB - costA;
      }

      let valA = a[field as keyof Letter];
      let valB = b[field as keyof Letter];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (field === 'created_at' || field === 'updated_at') {
        return direction === 'asc'
          ? new Date(valA as string).getTime() - new Date(valB as string).getTime()
          : new Date(valB as string).getTime() - new Date(valA as string).getTime();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const updateSorting = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filterLetters = () => {
    let result = [...letters];

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

    if (filters.saved !== 'all') {
      const isSaved = filters.saved === 'saved';
      result = result.filter(letter => letter.is_saved === isSaved);
    }

    if (filters.language !== 'all') {
      result = result.filter(letter => letter.language === filters.language);
    }

    if (filters.tonality !== 'all') {
      result = result.filter(letter => letter.tonality === filters.tonality);
    }

    return sortData(result, sortField, sortDirection);
  };

  useEffect(() => {
    fetchLetters();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const filtered = filterLetters();
    setFilteredLetters(filtered);
    calculateStats(filtered);
  }, [searchTerm, filters, sortField, sortDirection, letters, openAICosts]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just nu';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min sedan`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} tim sedan`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dag${diffInDays !== 1 ? 'ar' : ''} sedan`;

    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  const formatLanguage = (lang: string): string => {
    switch(lang) {
      case 'sv': return '🇸🇪 Svenska';
      case 'en': return '🇬🇧 Engelska';
      default: return lang;
    }
  };

  const formatTonality = (tonality: string): string => {
    const map: { [key: string]: string } = {
      professional: 'Professionell', enthusiastic: 'Entusiastisk',
      creative: 'Kreativ', confident: 'Självsäker',
      balanced: 'Balanserad', auto: 'AI-val'
    };
    return map[tonality] || tonality;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Laddar brev...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-4">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Ett fel uppstod</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchLetters}
          className="mt-4 px-4 py-2 bg-pink-600 rounded-md text-white hover:bg-pink-700"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alla brev</h1>
          <p className="text-gray-600 mt-1">Hantera och analysera alla genererade brev i systemet</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value={30}>30 dagar</option>
            <option value={90}>3 månader</option>
            <option value={180}>6 månader</option>
            <option value={365}>12 månader</option>
            <option value={9999}>Från början</option>
          </select>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-200">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm whitespace-nowrap">
              {lastUpdated ? lastUpdated.toLocaleTimeString('sv-SE') : '...'}
            </span>
            <button
              onClick={fetchLetters}
              className="ml-2 text-pink-500 hover:text-pink-600"
              aria-label="Uppdatera data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Totalt antal brev</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.totalLetters}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Sparade brev</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.savedLetters}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Svenska brev</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.svLetters}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Engelska brev</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.enLetters}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Estimerad kostnad</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCost(stats.totalCost)}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Genomsnittskostnad</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCost(stats.averageCost)}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Faktisk kostnad (OpenAI)</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCost(stats.actualCost)}</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">Kostnadsdifferens</p>
          <h3 className={`text-xl font-bold mt-1 ${stats.costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.costDifference > 0 ? '+' : ''}{formatCost(Math.abs(stats.costDifference))}
          </h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LetterGenerationChart data={letterGrowthData} isLoading={false} />
        <LetterCostChart data={costData} isLoading={false} showCurrency="SEK" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Sök efter titel, företag eller användare..."
              className="bg-gray-50 border border-gray-200 text-gray-900 px-10 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 rounded-md"
              value={filters.saved}
              onChange={(e) => setFilters({...filters, saved: e.target.value})}
            >
              <option value="all">Alla brev</option>
              <option value="saved">Sparade brev</option>
              <option value="unsaved">Osparade brev</option>
            </select>

            <select
              className="bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 rounded-md"
              value={filters.language}
              onChange={(e) => setFilters({...filters, language: e.target.value})}
            >
              <option value="all">Alla språk</option>
              <option value="sv">Svenska</option>
              <option value="en">Engelska</option>
            </select>

            <select
              className="bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 rounded-md"
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => updateSorting('created_at')}
                >
                  <div className="flex items-center">
                    Skapat
                    {sortField === 'created_at' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Språk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tonalitet
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => updateSorting('cost')}
                >
                  <div className="flex items-center">
                    Kostnad
                    {sortField === 'cost' && (
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p>Inga brev hittades</p>
                    <p className="text-sm mt-1">Ändra dina sökfilter eller ladda upp mer innehåll</p>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-pink-50">
                          <FileText className="h-5 w-5 text-pink-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{letter.title}</div>
                          {letter.company && (
                            <div className="text-xs text-gray-500">Företag: {letter.company}</div>
                          )}
                          {letter.job_title && (
                            <div className="text-xs text-gray-500">Tjänst: {letter.job_title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{letter.full_name || "Namnlös användare"}</div>
                      <div className="text-xs text-gray-500">{letter.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatTimeAgo(letter.created_at)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(letter.created_at).toLocaleDateString('sv-SE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {formatLanguage(letter.language)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TonalityIcon tonality={letter.tonality} />
                        <span className="ml-1.5 text-sm text-gray-900">
                          {formatTonality(letter.tonality)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-pink-500 mr-1.5" />
                        <span className="text-sm text-gray-900">
                          {letter.ai_cost ? formatCost(letter.ai_cost) : (letter.metadata?.cost ? formatCost(letter.metadata.cost) : '-')}
                        </span>
                      </div>
                      {(letter.ai_model || letter.metadata?.model) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {letter.ai_model || letter.metadata?.model} {letter.ai_tokens || letter.metadata?.tokens ? `(${letter.ai_tokens || letter.metadata?.tokens} tokens)` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {letter.is_saved ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Sparat
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
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
                        className="text-blue-500 hover:text-blue-700 mr-3"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
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

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Visar {filteredLetters.length} av {letters.length} brev
        </div>
      </div>

      {/* Modal */}
      {isPreviewOpen && selectedLetter && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">
                {selectedLetter.title}
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Information</h4>
                  <div className="bg-gray-50 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Användare:</span>
                      <span className="text-gray-900 font-medium">{selectedLetter.full_name || "Namnlös"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Språk:</span>
                      <span className="text-gray-900 font-medium">{formatLanguage(selectedLetter.language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tonalitet:</span>
                      <span className="text-gray-900 font-medium">{formatTonality(selectedLetter.tonality)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sparat:</span>
                      <span className="text-gray-900 font-medium">{selectedLetter.is_saved ? 'Ja' : 'Nej'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI-information</h4>
                  <div className="bg-gray-50 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modell:</span>
                      <span className="text-gray-900 font-medium">{selectedLetter.ai_model || 'Okänd'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokens:</span>
                      <span className="text-gray-900 font-medium">{selectedLetter.ai_tokens || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kostnad (USD):</span>
                      <span className="text-gray-900 font-medium">
                        ${(selectedLetter.ai_cost || 0).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kostnad (SEK):</span>
                      <span className="text-gray-900 font-medium">
                        {formatCost(selectedLetter.ai_cost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">Brevinnehåll</h4>
              <div className="bg-gray-50 text-gray-800 rounded-md p-6 overflow-auto prose max-w-none">
                {selectedLetter.content ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedLetter.content.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-gray-500 italic">Innehåll inte tillgängligt</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
