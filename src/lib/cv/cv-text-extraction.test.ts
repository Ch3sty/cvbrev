/**
 * Test cases for CV text extraction functionality
 * These tests validate that the AI-driven text matching works correctly
 */

import { extractOriginalTextWithAI, generateContextSpecificSuggestion, validateExtractionQuality, type ExtractionContext } from './cv-text-extraction';

// Mock CV content for testing
const mockCVContent = `
John Doe
john.doe@email.com
+46 70 123 45 67

PROFILSAMMANFATTNING
Erfaren projektledare med 8 års erfarenhet av att leda komplexa IT-projekt.

ARBETSLIVSERFARENHET

Projektledare - TechCorp AB (2020-2024)
• Ledde utvecklingsprojekt för e-handelsplattform
• Ansvarade för budget på 2,5 miljoner SEK
• Genomförde 15 framgångsrika projekt

Systemanalytiker - DataSolutions (2018-2020)
• Analyserade affärskrav och tekniska lösningar
• Arbetade med team på 8 utvecklare
• Förbättrade systemeffektivitet

UTBILDNING
Civilingenjör Datateknik - KTH (2014-2018)
`;

// Test cases to validate functionality
const testCases = [
  {
    name: 'Kvantifiering av projektledningserfarenhet',
    context: {
      cvContent: mockCVContent,
      improvementSuggestion: 'Kvantifiera projektledarrollen med specifika siffror om antal projekt och budget',
      improvementArea: 'Arbetslivserfarenhet',
      improvementExample: 'Istället för "Ledde utvecklingsprojekt", skriv "Ledde 15 utvecklingsprojekt med en total budget på 2,5 miljoner SEK"'
    },
    expectedOriginalText: 'Ledde utvecklingsprojekt för e-handelsplattform',
    expectedRoleContext: 'Projektledare - TechCorp AB'
  },
  {
    name: 'Kvantifiering av teamledarskap',
    context: {
      cvContent: mockCVContent,
      improvementSuggestion: 'Lägg till specifikt antal utvecklare i teamet',
      improvementArea: 'Arbetslivserfarenhet',
    },
    expectedOriginalText: 'Arbetade med team på 8 utvecklare',
    expectedRoleContext: 'Systemanalytiker - DataSolutions'
  },
  {
    name: 'Förbättring av profilsammanfattning',
    context: {
      cvContent: mockCVContent,
      improvementSuggestion: 'Gör profilsammanfattningen mer specifik och kvantifierad',
      improvementArea: 'Profilsammanfattning',
    },
    expectedOriginalText: 'Erfaren projektledare med 8 års erfarenhet av att leda komplexa IT-projekt.',
    expectedRoleContext: 'Projektledare'
  }
];

/**
 * Manual test function to validate text extraction
 * This would normally be run as part of automated testing
 */
export async function runTextExtractionTests() {
  console.log('🧪 Testing CV Text Extraction Functionality...\n');

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);

    try {
      // Test text extraction
      const extractionResult = await extractOriginalTextWithAI(testCase.context);

      console.log('✅ Extraction Result:', {
        originalText: extractionResult.originalText,
        roleContext: extractionResult.roleContext,
        confidence: extractionResult.confidence,
        sourceSection: extractionResult.sourceSection
      });

      // Validate quality
      const isValid = validateExtractionQuality(extractionResult);
      console.log(`✅ Quality validation: ${isValid ? 'PASS' : 'FAIL'}`);

      // Test AI suggestion generation
      const aiSuggestion = await generateContextSpecificSuggestion(
        extractionResult.originalText,
        extractionResult.roleContext,
        testCase.context.improvementArea,
        'quantification'
      );

      console.log('✅ Generated AI suggestion:', aiSuggestion);
      console.log('---\n');

    } catch (error) {
      console.error(`❌ Test failed for "${testCase.name}":`, error);
      console.log('---\n');
    }
  }

  console.log('🏁 Testing completed!');
}

/**
 * Test the full extraction workflow with multiple improvements
 */
export async function testFullExtractionWorkflow() {
  console.log('🔄 Testing Full Extraction Workflow...\n');

  const improvements = [
    {
      id: 'proj-1',
      area: 'Arbetslivserfarenhet',
      suggestion: 'Kvantifiera projektledningserfarenhet med specifika siffror',
      category: 'content'
    },
    {
      id: 'team-1',
      area: 'Arbetslivserfarenhet',
      suggestion: 'Specificera teamstorlek och ledarskapsroll',
      category: 'content'
    },
    {
      id: 'profile-1',
      area: 'Profilsammanfattning',
      suggestion: 'Gör profilsammanfattningen mer kvantifierad',
      category: 'content'
    }
  ];

  // This simulates what the API endpoint would do
  const results = [];

  for (const improvement of improvements) {
    const context: ExtractionContext = {
      cvContent: mockCVContent,
      improvementSuggestion: improvement.suggestion,
      improvementArea: improvement.area
    };

    try {
      const extractionResult = await extractOriginalTextWithAI(context);
      const isValid = validateExtractionQuality(extractionResult);

      if (isValid) {
        const aiSuggestion = await generateContextSpecificSuggestion(
          extractionResult.originalText,
          extractionResult.roleContext,
          improvement.area,
          improvement.category
        );

        results.push({
          id: improvement.id,
          originalText: extractionResult.originalText,
          aiSuggestion: aiSuggestion,
          roleContext: extractionResult.roleContext,
          confidence: extractionResult.confidence,
          sourceSection: extractionResult.sourceSection,
          category: improvement.category,
          isValid: true
        });

        console.log(`✅ Successfully processed: ${improvement.id}`);
      } else {
        console.log(`⚠️ Low quality extraction for: ${improvement.id}`);
      }
    } catch (error) {
      console.error(`❌ Failed processing: ${improvement.id}`, error);
    }
  }

  console.log('\n📊 Final Results:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.id}`);
    console.log(`   Original: "${result.originalText}"`);
    console.log(`   AI Suggestion: "${result.aiSuggestion}"`);
    console.log(`   Role Context: "${result.roleContext}"`);
    console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`   Source: ${result.sourceSection}`);
  });

  return results;
}

// Export test utilities
export { mockCVContent, testCases };