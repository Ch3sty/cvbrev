// Direct test of match-jobs edge function
// Run with: node test-edge-direct.js

const userId = 'ccb52d89-12dd-4cf4-b487-7b6d1731e201';
const selectedAnalysisId = '4249b072-d9b5-4c7d-b8e2-f41d7ea37d7a';
const functionUrl = 'https://dbvbnbkvadvlhjhomibg.supabase.co/functions/v1/match-jobs';

// You need to set this env var: SUPABASE_SERVICE_ROLE_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

async function testEdgeFunction() {
  console.log('🧪 Testing match-jobs edge function v30...\n');
  console.log('📋 Test parameters:');
  console.log('  userId:', userId);
  console.log('  selectedAnalysisId:', selectedAnalysisId);
  console.log('  functionUrl:', functionUrl);
  console.log('');

  try {
    console.log('🚀 Sending request...');
    const startTime = Date.now();

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        selectedAnalysisId: selectedAnalysisId
      })
    });

    const elapsed = Date.now() - startTime;
    console.log(`⏱️  Response received in ${elapsed}ms`);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('');

    const data = await response.json();

    if (data.success) {
      console.log('✅ SUCCESS!');
      console.log('');
      console.log('📈 Results:');
      console.log('  Jobs found:', data.jobs?.length || 0);
      console.log('  Total results:', data.totalResults);
      console.log('  Selected analysis ID:', data.selectedAnalysis?.id);
      console.log('  Selected analysis displayName:', data.selectedAnalysis?.displayName);
      console.log('  Selected analysis cvId:', data.selectedAnalysis?.cvId);
      console.log('  Search terms - occupations:', data.searchTerms?.occupations);
      console.log('  Search terms - locations:', data.searchTerms?.locations);
      console.log('');

      if (data.jobs && data.jobs.length > 0) {
        console.log('🎯 Top 3 jobs:');
        data.jobs.slice(0, 3).forEach((job, i) => {
          console.log(`  ${i + 1}. ${job.headline} (relevance: ${job.relevance})`);
          console.log(`     Company: ${job.employer?.name || 'N/A'}`);
          console.log(`     Location: ${job.workplace_address?.municipality || 'N/A'}`);
        });
      } else {
        console.log('⚠️  No jobs found!');
      }
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', data.error || 'Unknown error');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('💥 EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEdgeFunction();
