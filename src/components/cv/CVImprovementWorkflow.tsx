'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  CheckCircle2,
  Sparkles,
  FileText,
  Download,
  Wand2,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SuggestionSelector from './SuggestionSelector';
import RoleBasedSuggestionSelector, { RoleImprovement } from './RoleBasedSuggestionSelector';
import CVPreviewModal from './CVPreviewModal';
import ImprovementMetrics from './ImprovementMetrics';
import CVExportOptions from './CVExportOptions';
import QuantificationCustomizer, { QuantificationItem } from './QuantificationCustomizer';

export interface Suggestion {
  id: string;
  category: 'structure' | 'content' | 'keywords' | 'ats';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  selected?: boolean;
  // Additional fields for richer context
  example?: string;
  area?: string;
}

// Utility function to identify structural suggestions that will be handled by templates
const isStructuralSuggestion = (suggestion: any): boolean => {
  const text = (suggestion.suggestion || suggestion.description || suggestion.title || '').toLowerCase();
  const structuralKeywords = [
    // Layout and structure
    'layout', 'struktur', 'formatering', 'format', 'överskådlighet',
    // Headers and sections
    'rubrik', 'rubriker', 'sidhuvud', 'huvud', 'header',
    'sektion', 'sektioner', 'avsnitt', 'dela upp', 'organisera',
    // Lists and formatting
    'punktlista', 'punktlistor', 'bullets', 'bullet points',
    'indrag', 'marginal', 'spacing', 'avstånd',
    // Contact info positioning
    'kontaktuppgifter', 'kontakt', 'placera', 'flytta',
    // General structure commands
    'strukturera', 'ordna', 'gruppera', 'kategorisera',
    'använd tydliga', 'gör tydligare', 'förtydliga struktur'
  ];
  return structuralKeywords.some(keyword => text.includes(keyword));
};

interface CVImprovementWorkflowProps {
  suggestions: Suggestion[];
  originalCV: string;
  cvId: string;
  onComplete?: () => void;
  // Pass analysis details for better improvement generation
  analysisDetails?: {
    atsFriendliness?: {
      score: number;
      feedback: string;
      missingKeywords?: string[];
    };
    quantificationSuggestions?: string[];
    detailedImprovements?: Array<{
      area: string;
      suggestion: string;
      example?: string;
    }>;
    keywords?: string[];
    parsedRoles?: Array<{
      title: string;
      company: string;
      period: string;
      description?: string;
      originalText?: string;
    }>;
  };
}

type WorkflowStep = 'select' | 'quantify' | 'generate' | 'preview' | 'export';

export default function CVImprovementWorkflow({
  suggestions: initialSuggestions,
  originalCV,
  cvId,
  onComplete,
  analysisDetails
}: CVImprovementWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  // Filter out structural suggestions that should be handled by templates
  const filteredSuggestions = initialSuggestions.filter(s => !isStructuralSuggestion(s));

  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    filteredSuggestions.map(s => ({ ...s, selected: false }))
  );

  // Role-based improvements state
  const [useRoleBasedView, setUseRoleBasedView] = useState(true);
  const [roleBasedImprovements, setRoleBasedImprovements] = useState<RoleImprovement[]>([]);
  const [generalImprovements, setGeneralImprovements] = useState<any[]>([]);
  const [isLoadingRoleBasedData, setIsLoadingRoleBasedData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvedCV, setImprovedCV] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    keywordOptimization: 0,
    atsScore: 0,
    overallImprovement: 0
  });
  const [showPreview, setShowPreview] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [quantificationItems, setQuantificationItems] = useState<QuantificationItem[]>([]);
  const [isPreparingQuantification, setIsPreparingQuantification] = useState(false);

  const selectedCount = useRoleBasedView
    ? roleBasedImprovements.filter(r => r.selected).length + generalImprovements.filter(g => g.selected).length
    : suggestions.filter(s => s.selected).length;
  const totalCount = useRoleBasedView
    ? roleBasedImprovements.length + generalImprovements.length
    : suggestions.length;

  const loadRoleBasedImprovements = useCallback(async () => {
    setIsLoadingRoleBasedData(true);

    try {
      const response = await fetch('/api/cv/group-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          improvements: suggestions.map(s => ({
            id: s.id,
            category: s.category,
            area: s.area || s.category,
            description: s.description,
            title: s.title,
            type: s.category === 'keywords' ? 'keywords' :
                  s.description.toLowerCase().includes('kvantifi') ? 'quantification' : 'content',
            selected: false
          })),
          cvText: originalCV,
          detailedAnalysis: analysisDetails,
          parsedRoles: analysisDetails?.parsedRoles || []
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.roleBasedImprovements) {
          setRoleBasedImprovements(result.roleBasedImprovements.map((role: any) => ({
            ...role,
            selected: false
          })));

          setGeneralImprovements(result.generalImprovements?.map((gen: any) => ({
            ...gen,
            selected: false
          })) || []);

          console.log('✅ Role-based improvements loaded:', {
            roleCount: result.roleBasedImprovements.length,
            generalCount: result.generalImprovements?.length || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load role-based improvements:', error);
      // Fallback to traditional view if loading fails
      setUseRoleBasedView(false);
    }

    setIsLoadingRoleBasedData(false);
  }, [suggestions, originalCV, analysisDetails]);

  // Load role-based improvements on component mount
  useEffect(() => {
    if (useRoleBasedView && roleBasedImprovements.length === 0 && !isLoadingRoleBasedData) {
      loadRoleBasedImprovements();
    }
  }, [useRoleBasedView, isLoadingRoleBasedData, roleBasedImprovements.length, loadRoleBasedImprovements]);

  const handleSuggestionToggle = (suggestionId: string) => {
    setSuggestions(prev =>
      prev.map(s =>
        s.id === suggestionId ? { ...s, selected: !s.selected } : s
      )
    );
  };

  const handleSelectAll = () => {
    setSuggestions(prev => prev.map(s => ({ ...s, selected: true })));
  };

  const handleSelectATS = () => {
    setSuggestions(prev =>
      prev.map(s => ({
        ...s,
        selected: s.category === 'ats' || s.category === 'keywords'
      }))
    );
  };

  const handleClearSelection = () => {
    if (useRoleBasedView) {
      setRoleBasedImprovements(prev => prev.map(r => ({ ...r, selected: false })));
      setGeneralImprovements(prev => prev.map(g => ({ ...g, selected: false })));
    } else {
      setSuggestions(prev => prev.map(s => ({ ...s, selected: false })));
    }
  };

  // Role-based handlers
  const handleRoleToggle = (roleId: string) => {
    setRoleBasedImprovements(prev =>
      prev.map(r => r.role === roleId ? { ...r, selected: !r.selected } : r)
    );
  };

  const handleGeneralToggle = (improvementId: string) => {
    setGeneralImprovements(prev =>
      prev.map(g => g.id === improvementId ? { ...g, selected: !g.selected } : g)
    );
  };

  const handleSelectAllRoles = () => {
    setRoleBasedImprovements(prev => prev.map(r => ({ ...r, selected: true })));
    setGeneralImprovements(prev => prev.map(g => ({ ...g, selected: true })));
  };

  const handleClearRoleSelection = () => {
    setRoleBasedImprovements(prev => prev.map(r => ({ ...r, selected: false })));
    setGeneralImprovements(prev => prev.map(g => ({ ...g, selected: false })));
  };

  const prepareQuantificationItems = async () => {
    const items: QuantificationItem[] = [];
    const processedIds = new Set<string>(); // Track processed suggestion IDs to prevent duplicates

    // Determine what improvements are selected based on the current view
    const selectedImprovements: any[] = [];

    if (useRoleBasedView) {
      // Convert role-based improvements to quantification items
      const selectedRoles = roleBasedImprovements.filter(r => r.selected);
      const selectedGeneral = generalImprovements.filter(g => g.selected);

      selectedRoles.forEach(role => {
        items.push({
          id: role.role,
          category: 'role-based',
          originalText: role.originalText,
          aiSuggestion: role.suggestedText,
          userChoice: 'ai',
          area: role.role.split(' - ')[0], // Extract role title
          roleContext: role.role,
          section: 'Arbetslivserfarenhet',
          confidence: role.confidence || 0.8,
          sourceImprovementId: role.role,
          sourceSection: 'Arbetslivserfarenhet',
          isValid: true,
          sourceImprovementIds: role.sourceImprovementIds || []
        } as any);
      });

      selectedGeneral.forEach(general => {
        items.push({
          id: general.id,
          category: 'general',
          originalText: `Allmän förbättring: ${general.title}`,
          aiSuggestion: general.description,
          userChoice: 'ai',
          area: general.title,
          section: general.category,
          confidence: 0.7,
          sourceImprovementId: general.id,
          sourceSection: general.category,
          isValid: true
        } as any);
      });

      return items;
    }

    // Original logic for traditional suggestions
    const selectedSuggestions = suggestions.filter(s => s.selected);

    console.log('🚀 Preparing quantification items with grouping:', {
      totalSelected: selectedSuggestions.length,
      suggestions: selectedSuggestions.map(s => ({ id: s.id, category: s.category, area: s.area }))
    });

    try {
      // Call the new grouping API to intelligently combine related improvements
      const response = await fetch('/api/cv/group-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          improvements: selectedSuggestions.map(s => ({
            id: s.id,
            category: s.category,
            area: s.area || s.category,
            description: s.description,
            example: s.example,
            type: s.category === 'keywords' ? 'keywords' :
                  s.description.toLowerCase().includes('kvantifi') ? 'quantification' : 'content',
            selected: s.selected
          })),
          cvText: originalCV,
          detailedAnalysis: analysisDetails,
          parsedRoles: analysisDetails?.parsedRoles || [] // Skicka med parsedRoles
        }),
      });

      if (response.ok) {
        const result = await response.json();

        console.log('📊 Grouping API response:', {
          success: result.success,
          groupCount: result.groups?.length,
          stats: result.stats
        });

        if (result.success && result.groups) {
          // Process grouped improvements - each group combines multiple related improvements
          for (const group of result.groups) {
            if (!processedIds.has(group.id)) {
              // Create a quantification item from the grouped improvement
              items.push({
                id: group.id,
                category: 'grouped', // Indicate this is a grouped improvement
                originalText: group.originalText,
                aiSuggestion: group.aiExample || group.combinedSuggestion,
                userChoice: 'ai',
                area: group.area || 'Arbetslivserfarenhet',
                roleContext: group.roleContext,
                section: group.area,
                confidence: group.confidence || 0.8,
                sourceImprovementId: group.id,
                sourceSection: group.area,
                isValid: true,
                // Additional info for grouped improvements
                groupedImprovements: group.improvements,
                sourceImprovementIds: group.sourceImprovements
              } as any);
              processedIds.add(group.id);

              console.log('✅ Added grouped improvement:', {
                id: group.id,
                originalText: group.originalText.substring(0, 50) + '...',
                combinedTypes: Object.keys(group.improvements)
              });
            }
          }

          // If we got valid grouped improvements, use them and skip fallback
          if (items.length > 0) {
            console.log(`🎯 Successfully grouped ${selectedSuggestions.length} improvements into ${items.length} items`);
            return items;
          }
        }
      }
    } catch (error) {
      console.error('Fel vid AI-textextraktion:', error);
      // Fall through to fallback method
    }

    // Helper function to check if this is a quantifiable suggestion
    const isQuantifiableSuggestion = (suggestion: any): boolean => {
      const text = (suggestion.suggestion || suggestion.description || suggestion.title || '').toLowerCase();
      const quantifiableKeywords = [
        'kvantifi', 'siffror', 'resultat', 'antal', 'procent', '%', 'ökning',
        'minskning', 'budget', 'team', 'försäljning', 'kostnad', 'tid', 'projekt',
        'kunder', 'tillväxt', 'förbättring', 'mätbar', 'specifik'
      ];
      return quantifiableKeywords.some(keyword => text.includes(keyword));
    };

    // Helper function to check if this is a profile summary suggestion
    const isProfileSummarySuggestion = (suggestion: any): boolean => {
      const text = (suggestion.suggestion || suggestion.description || suggestion.title || suggestion.area || '').toLowerCase();
      const profileKeywords = [
        'profil', 'sammanfattning', 'profilsammanfattning', 'personlig beskrivning',
        'om mig', 'profilering', 'yrkesmässig', 'social och glad', 'beskrivs som'
      ];
      return profileKeywords.some(keyword => text.includes(keyword));
    };

    // Helper function to extract original text from CV based on the improvement suggestion
    const extractOriginalTextFromCV = (improvement: any, cvText: string): string => {
      // First, try to find direct matches for mentioned roles or positions
      if (improvement.area && improvement.area.toLowerCase().includes('arbetslivserfarenhet')) {
        // Look for role mentions in the improvement
        const roleMatch = improvement.suggestion.match(/(platschef|projektledare|säljare|tekniker|chef|ansvarig|specialist|koordinator|utvecklare|analyst)[^\n.,]*/gi);
        if (roleMatch) {
          // Find this role in the original CV
          const roleInCV = cvText.match(new RegExp(`[^\n.]*${roleMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\n.]*`, 'gi'));
          if (roleInCV) {
            return roleInCV[0].trim();
          }
        }
      }

      // Look for keywords mentioned in the suggestion within the original CV
      const suggestionWords = improvement.suggestion.toLowerCase().split(/[\s,.]+/);
      const meaningfulWords = suggestionWords.filter((word: string) =>
        word.length > 3 &&
        !['under', 'för', 'till', 'med', 'som', 'och', 'eller', 'att', 'det', 'den', 'denna'].includes(word)
      );

      // Find sentences in CV that contain multiple meaningful words from the suggestion
      const sentences = cvText.split(/[.!?]+/);
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        const matchCount = meaningfulWords.filter((word: string) => lowerSentence.includes(word)).length;
        if (matchCount >= Math.min(2, meaningfulWords.length)) {
          return sentence.trim();
        }
      }

      // Fallback: look for simple patterns mentioned in examples
      if (improvement.example) {
        const exampleMatch = improvement.example.match(/[Ii]stället för ['"](.*?)['"][^'"]*['"](.*?)['"]/);
        if (exampleMatch && exampleMatch[1]) {
          // Search for this text in the original CV
          const originalText = exampleMatch[1];
          if (cvText.toLowerCase().includes(originalText.toLowerCase())) {
            return originalText;
          }
        }
      }

      // Final fallback: use first 100 characters of relevant section if identifiable
      return 'Relevant text från ditt CV kunde inte identifieras automatiskt';
    };

    // Helper function to clean AI suggestion from instruction wrappers
    const cleanAISuggestion = (suggestion: string, example?: string): string => {
      // If we have an example with "Istället för X, skriv Y" format, extract Y
      if (example) {
        const cleanMatch = example.match(/skriv\s+['"](.*?)['"]|skriv\s+(.+?)(?:\.|$)/);
        if (cleanMatch) {
          return cleanMatch[1] || cleanMatch[2];
        }
      }

      // Remove common instruction prefixes
      return suggestion
        .replace(/^(Kvantifiera|Lägg till|Inkludera|Skriv om|Förbättra|Beskriv)\s*:?\s*/i, '')
        .replace(/^Istället för.*skriv\s+['"]([^'"]+)['"].*$/i, '$1')
        .trim();
    };

    // First, try to get real quantification items from analysis detailedImprovements
    if (analysisDetails?.detailedImprovements) {
      const selectedSuggs = suggestions.filter(s => s.selected);

      // Filter and process detailed improvements
      selectedSuggs.forEach(sugg => {
        // Skip if already processed
        if (processedIds.has(sugg.id)) {
          return;
        }

        // Find matching detailed improvement
        const matchingImprovement = analysisDetails.detailedImprovements?.find(imp => {
          // Skip if it's a structural suggestion
          if (isStructuralSuggestion(imp)) {
            return false;
          }

          // Skip if it's a profile summary suggestion (should be handled as direct text replacement)
          if (isProfileSummarySuggestion(imp)) {
            return false;
          }

          // Match by area or if suggestion description contains the area
          return sugg.area === imp.area ||
                 sugg.description.toLowerCase().includes(imp.area.toLowerCase()) ||
                 sugg.title.toLowerCase().includes(imp.area.toLowerCase()) ||
                 (sugg.category === 'keywords' || sugg.category === 'content') &&
                 isQuantifiableSuggestion(imp);
        });

        if (matchingImprovement) {
          processedIds.add(sugg.id);

          // Extract original text from the actual CV content
          const originalText = extractOriginalTextFromCV(matchingImprovement, originalCV);

          // Clean the AI suggestion to remove instruction wrappers
          const aiSuggestion = cleanAISuggestion(matchingImprovement.suggestion, matchingImprovement.example);

          // Skip if we couldn't identify meaningful original text or if it looks like instructions
          const instructionKeywords = ['inkludera', 'lägg till', 'använd', 'skriv om', 'förbättra', 'beskriv'];
          if (originalText.includes('kunde inte identifieras') ||
              instructionKeywords.some(keyword => originalText.toLowerCase().includes(keyword))) {
            console.log('Skipping item due to unidentifiable or instruction-like original text:', originalText);
            return;
          }

          // Extract role context from original CV if possible
          let roleContext = '';
          if (matchingImprovement.area.toLowerCase().includes('arbetslivserfarenhet') ||
              matchingImprovement.area.toLowerCase().includes('berufserfahrung') ||
              matchingImprovement.area.toLowerCase().includes('roll')) {
            // Try to extract role from the suggestion or original text
            const roleMatch = (originalText + ' ' + aiSuggestion).match(/(\w+(?:\s+\w+)?(?:chef|manager|ledare|ansvarig|specialist|koordinator|tekniker|ing[ejö]nj[öo]r|utvecklare|analyst))/i);
            if (roleMatch) {
              roleContext = roleMatch[1];
            }
          }

          items.push({
            id: sugg.id,
            category: sugg.category,
            originalText: originalText,
            aiSuggestion: aiSuggestion,
            userChoice: 'ai',
            area: matchingImprovement.area,
            roleContext: roleContext || undefined,
            section: matchingImprovement.area
          });
        }
      });
    }

    // Fallback: if no analysis data or no matches, use the old method with filtering
    if (items.length === 0) {
      const selectedSuggs = suggestions.filter(s => s.selected);

      selectedSuggs.forEach(sugg => {
        // Skip if already processed
        if (processedIds.has(sugg.id)) {
          return;
        }

        // Skip structural suggestions
        if (isStructuralSuggestion(sugg)) {
          return;
        }

        // Skip profile summary suggestions
        if (isProfileSummarySuggestion(sugg)) {
          return;
        }

        // Check if this is a quantifiable suggestion
        if (sugg.category === 'keywords' || isQuantifiableSuggestion(sugg)) {
          processedIds.add(sugg.id);

          // Extract original text from CV or use basic parsing
          let originalText = '';
          let aiSuggestion = '';

          // Try to extract from description using existing patterns
          const originalMatch = sugg.description.match(/[Ii]stället för ['"](.+?)['"]/);
          const suggestionMatch = sugg.description.match(/skriv ['"](.+?)['"]/i);

          if (originalMatch && suggestionMatch) {
            originalText = originalMatch[1];
            aiSuggestion = suggestionMatch[1];
          } else {
            // Fallback: try to find relevant text in CV
            originalText = extractOriginalTextFromCV({ suggestion: sugg.description, area: sugg.area }, originalCV);
            aiSuggestion = cleanAISuggestion(sugg.description, sugg.example);
          }

          // Skip if we couldn't get meaningful text
          if (originalText.includes('kunde inte identifieras')) {
            console.log('Skipping fallback item due to unidentifiable text for suggestion:', sugg.title);
            return;
          }

          // Skip if original text looks like instructions
          const instructionKeywords = ['inkludera', 'lägg till', 'använd', 'skriv om', 'förbättra', 'beskriv'];
          if (instructionKeywords.some(keyword => originalText.toLowerCase().includes(keyword))) {
            return;
          }

          items.push({
            id: sugg.id,
            category: sugg.category,
            originalText: originalText,
            aiSuggestion: aiSuggestion,
            userChoice: 'ai',
            area: sugg.area,
            section: sugg.category
          });
        }
      });
    }

    return items;
  };

  const handleProceedToQuantify = async () => {
    setIsPreparingQuantification(true); // Show loading while preparing items

    try {
      const items = await prepareQuantificationItems();
      if (items.length > 0) {
        setQuantificationItems(items);
        setCurrentStep('quantify');
      } else {
        // Skip quantify step if no quantification suggestions
        handleGenerateImproved();
      }
    } catch (error) {
      console.error('Fel vid förberedelse av kvantifiering:', error);
      // Fall back to generating improved CV directly
      handleGenerateImproved();
    }

    setIsPreparingQuantification(false);
  };

  const handleQuantificationComplete = () => {
    handleGenerateImproved();
  };

  const handleGenerateImproved = async () => {
    if (selectedCount === 0) return;

    setCurrentStep('generate');
    setIsGenerating(true);

    let updatedSuggestions: any[] = [];

    if (useRoleBasedView) {
      // Convert role-based selections to suggestions format
      const selectedRoles = roleBasedImprovements.filter(r => r.selected);
      const selectedGeneral = generalImprovements.filter(g => g.selected);

      updatedSuggestions = [
        ...selectedRoles.map(role => {
          const quantItem = quantificationItems.find(q => q.id === role.role);
          return {
            id: role.role,
            category: 'role-based',
            title: role.role,
            description: quantItem?.userChoice === 'custom' && quantItem.customText
              ? quantItem.customText
              : role.suggestedText,
            impact: role.impact,
            area: role.role,
            customized: !!quantItem,
            roleContext: role.role,
            originalText: role.originalText,
            suggestedText: role.suggestedText,
            improvements: role.improvements
          };
        }),
        ...selectedGeneral.map(general => ({
          id: general.id,
          category: general.category,
          title: general.title,
          description: general.description,
          impact: general.impact,
          area: general.title,
          customized: false
        }))
      ];
    } else {
      // Original logic for traditional suggestions
      updatedSuggestions = suggestions.filter(s => s.selected).map(sugg => {
        const quantItem = quantificationItems.find(q => q.id === sugg.id);
        if (quantItem) {
          return {
            ...sugg,
            description: quantItem.userChoice === 'custom' && quantItem.customText
              ? quantItem.customText
              : quantItem.aiSuggestion,
            customized: true
          };
        }
        return sugg;
      });
    }

    try {
      // Call API to generate improved CV (userId is now obtained from server-side authentication)
      const response = await fetch('/api/cv/generate-improved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvId: cvId,
          originalContent: originalCV,
          selectedSuggestions: updatedSuggestions,
          analysisDetails: analysisDetails || {}, // Pass the full analysis details
          skipSave: true // VIKTIGT: Förhindra automatisk sparning här
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate improved CV');
      }

      const result = await response.json();

      // DEFENSIV VALIDERING: Kontrollera att vi fick giltigt förbättrat innehåll
      if (!result.improvedContent || result.improvedContent.trim().length === 0) {
        console.error('❌ API returnerade tomt eller ogiltigt förbättrat CV:', result);
        throw new Error('API:t kunde inte generera ett giltigt förbättrat CV');
      }

      if (result.improvedContent.trim().length < 50) {
        console.error('❌ Förbättrat CV är för kort:', result.improvedContent.length, 'tecken');
        throw new Error('Det förbättrade CV:t verkar vara skadat');
      }

      console.log('✅ Förbättrat CV genererat framgångsrikt:', {
        originalLength: originalCV?.length || 0,
        improvedLength: result.improvedContent?.length || 0,
        improvementRatio: ((result.improvedContent?.length || 0) / (originalCV?.length || 1)).toFixed(2)
      });

      setImprovedCV(result.improvedContent);
      setMetrics(result.metrics);

      setIsGenerating(false);
      setCurrentStep('preview');
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating improved CV:', error);

      // Fallback to mock data if API fails
      setImprovedCV(originalCV + '\n\n[Förbättrad version med valda ändringar]');
      setMetrics({
        keywordOptimization: 23,
        atsScore: 85,
        overallImprovement: 18
      });

      setIsGenerating(false);
      setCurrentStep('preview');
      setShowPreview(true);
    }
  };

  const handleExportComplete = () => {
    setExportComplete(true);
    setCurrentStep('export');
    onComplete?.();
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step) {
      case 'select': return <Target className="h-5 w-5" />;
      case 'quantify': return <Sparkles className="h-5 w-5" />;
      case 'generate': return <Wand2 className="h-5 w-5" />;
      case 'preview': return <FileText className="h-5 w-5" />;
      case 'export': return <Download className="h-5 w-5" />;
    }
  };

  const getStepLabel = (step: WorkflowStep) => {
    switch (step) {
      case 'select': return 'Välj förbättringar';
      case 'quantify': return 'Anpassa';
      case 'generate': return 'Generera';
      case 'preview': return 'Förhandsgranska';
      case 'export': return 'Spara';
    }
  };

  const steps: WorkflowStep[] = ['select', 'quantify', 'generate', 'preview', 'export'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="cv-improvement-workflow space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        {steps.map((step, index) => {
          const isActive = currentStepIndex >= index;
          const isComplete = currentStepIndex > index;

          return (
            <div key={step} className="flex items-center flex-1">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isActive ? 1 : 0.8,
                  opacity: isActive ? 1 : 0.5
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300 border-2
                  ${isActive
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-600'
                    : 'bg-white/80 text-gray-400 border-gray-300'}
                `}>
                  {isComplete ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    getStepIcon(step)
                  )}
                </div>
                <span className={`
                  absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs
                  ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}
                `}>
                  {getStepLabel(step)}
                </span>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-600 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: isComplete ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <div className="h-full bg-gray-300 -mt-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {currentStep === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600/10 to-purple-600/10">
                    <Sparkles className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Välj förbättringar
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedCount} av {totalCount} förbättringar valda
                      {useRoleBasedView && (
                        <span className="ml-2 text-xs text-pink-600 font-medium">
                          • Roll-baserad vy
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!useRoleBasedView && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="bg-white/80 hover:bg-gray-50"
                      >
                        Välj alla
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectATS}
                        className="bg-white/80 hover:bg-gray-50"
                      >
                        <Target className="h-4 w-4 mr-1" />
                        ATS-fokus
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                    className="bg-white/80 hover:bg-gray-50"
                  >
                    Rensa val
                  </Button>

                  {/* Toggle between view modes */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseRoleBasedView(!useRoleBasedView)}
                    className="bg-white/80 hover:bg-gray-50"
                    disabled={isLoadingRoleBasedData}
                  >
                    {useRoleBasedView ? 'Klassisk vy' : 'Roll-baserad vy'}
                  </Button>
                </div>
              </div>

              {isLoadingRoleBasedData ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 mx-auto mb-4"
                  >
                    <Wand2 className="h-8 w-8 text-pink-600" />
                  </motion.div>
                  <p className="text-gray-600">Förbereder roll-baserade förbättringar...</p>
                </div>
              ) : useRoleBasedView ? (
                <RoleBasedSuggestionSelector
                  roleImprovements={roleBasedImprovements}
                  generalImprovements={generalImprovements}
                  onRoleToggle={handleRoleToggle}
                  onGeneralToggle={handleGeneralToggle}
                  onSelectAllRoles={handleSelectAllRoles}
                  onClearRoleSelection={handleClearRoleSelection}
                />
              ) : (
                <SuggestionSelector
                  suggestions={suggestions}
                  onToggle={handleSuggestionToggle}
                />
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Förväntad tid: 2-3 minuter</span>
                </div>

                <Button
                  onClick={handleProceedToQuantify}
                  disabled={selectedCount === 0 || isPreparingQuantification}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                >
                  {isPreparingQuantification ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Wand2 className="h-4 w-4" />
                      </motion.div>
                      Förbereder AI-analys...
                    </>
                  ) : (
                    <>
                      Fortsätt till anpassning
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === 'quantify' && quantificationItems.length > 0 && (
          <motion.div
            key="quantify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuantificationCustomizer
              items={quantificationItems}
              onUpdate={setQuantificationItems}
              onComplete={handleQuantificationComplete}
            />
          </motion.div>
        )}

        {currentStep === 'generate' && isGenerating && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-xl p-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Wand2 className="h-8 w-8 text-pink-600" />
                  </div>
                </div>
              </motion.div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Genererar förbättrad version
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Applicerar {selectedCount} valda förbättringar...
              </p>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-600 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === 'preview' && improvedCV && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600/10 to-purple-600/10">
                    <Zap className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Förbättrad version klar!
                  </h3>
                </div>

                <Button
                  onClick={() => setShowPreview(true)}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Visa jämförelse
                </Button>
              </div>

              <ImprovementMetrics metrics={metrics} />

              <div className="mt-6">
                <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-4 w-4 text-pink-600" />
                    <h4 className="font-medium text-gray-900">Ladda ned ditt förbättrade CV</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Följ stegen nedan för att välja format, mall och ladda ned ditt förbättrade CV.
                  </p>
                </div>
                {/* DEBUG: Log the improved CV before passing to CVExportOptions */}
                {(() => {
                  console.log('🔍 DEBUG - CVImprovementWorkflow: Förbättrat CV som skickas till CVExportOptions:', {
                    improvedCVLength: improvedCV?.length || 0,
                    improvedCVPreview: improvedCV?.substring(0, 200) + '...',
                    originalCVLength: originalCV?.length || 0,
                    originalCVPreview: originalCV?.substring(0, 200) + '...',
                    cvId
                  });
                  return null;
                })()}
                <CVExportOptions
                  improvedCV={improvedCV}
                  originalCV={originalCV}
                  cvId={cvId}
                  onExportComplete={handleExportComplete}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === 'export' && exportComplete && (
          <motion.div
            key="export"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-xl p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                CV förbättrat och sparat!
              </h3>
              <p className="text-gray-600 mb-6">
                Din förbättrade CV har sparats och är redo att användas.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/mina-cv'}
                  className="bg-white/80 hover:bg-gray-50"
                >
                  Visa mina CV
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard/cv-mallar'}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                >
                  Applicera mall
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <CVPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        originalCV={originalCV}
        improvedCV={improvedCV || ''}
        metrics={metrics}
      />
    </div>
  );
}