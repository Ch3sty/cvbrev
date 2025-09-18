// Test the improved GPT-5 implementation for kompetensutveckling
require('dotenv').config({ path: '.env.local' });

// Import the improved functions
const { analyzeCompetenceGapGPT5, generateLearningSuggestionsGPT5 } = require('./src/lib/openai/analyzeCompetenceGapGPT5.ts');

async function testImprovedGPT5() {
    console.log('🚀 Testing Improved GPT-5 Implementation for Kompetensutveckling\n');

    // Test data
    const testInput = {
        mode: 'role',
        cvText: `
        PERSONLIG PROFIL
        Jag är en erfaren IT-tekniker med passion för problemlösning och teknik.

        UTBILDNING
        - Gymnasieutbildning El- och Energiprogrammet (2018-2021)
        - Diverse IT-kurser online

        ARBETSLIVSERFARENHET
        IT-support, TechCompany AB (2021-2024)
        - Löste tekniska problem för kunder
        - Installerade och konfigurerade hårdvara
        - Hjälpte användare med mjukvaruproblem

        TEKNISKA FÄRDIGHETER
        - Windows och Linux
        - Nätverk (grundläggande)
        - Hardware troubleshooting
        - Kundsupport
        `,
        targetRole: 'Frontend-utvecklare',
        targetCountry: 'Sverige'
    };

    try {
        console.log('📊 Testing competence analysis with improved GPT-5...');
        const analysisResult = await analyzeCompetenceGapGPT5(testInput);

        console.log('✅ Analysis completed successfully!');
        console.log(`📈 Match Score: ${analysisResult.matchScore}%`);
        console.log(`🎯 Target: ${analysisResult.targetDescription}`);
        console.log(`🔍 Identified Skills: ${analysisResult.identifiedRelevantSkills?.length || 0}`);
        console.log(`⚠️  Skill Gaps: ${analysisResult.identifiedSkillGaps?.length || 0}`);
        console.log(`💰 Cost: $${analysisResult.cost?.toFixed(4) || 'N/A'}`);
        console.log(`🤖 Model: ${analysisResult.model}`);

        // Test learning suggestions for first gap
        if (analysisResult.identifiedSkillGaps && analysisResult.identifiedSkillGaps.length > 0) {
            const firstGap = analysisResult.identifiedSkillGaps[0];
            console.log(`\n🎓 Testing learning suggestions for: "${firstGap.skill}"`);

            const suggestions = await generateLearningSuggestionsGPT5(firstGap, 'Frontend-utvecklare');

            console.log(`✅ Found ${suggestions.length} course suggestions`);
            suggestions.forEach((suggestion, i) => {
                console.log(`\n📚 Course ${i + 1}:`);
                console.log(`   Title: ${suggestion.title}`);
                console.log(`   Provider: ${suggestion.provider}`);
                console.log(`   Type: ${suggestion.type}`);
                console.log(`   Priority: ${suggestion.priority}`);
                console.log(`   URL: ${suggestion.direct_url}`);
                console.log(`   Duration: ${suggestion.duration || 'N/A'}`);
                console.log(`   Cost: ${suggestion.cost || 'N/A'}`);
            });
        }

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testImprovedGPT5();
}

module.exports = { testImprovedGPT5 };