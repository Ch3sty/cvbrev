// Test script för att trigga Edge Function direkt
const fetch = require('node-fetch');

async function testEdgeFunction() {
    const projectUrl = 'https://dbvbnbkvadvlhjhomibg.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const jobId = '92bd953f-f3b6-4f9a-a8f9-a1a8c20ba504'; // Använd ett existerande job ID

    if (!serviceKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
        return;
    }

    try {
        console.log('Triggering Edge Function for job:', jobId);

        const response = await fetch(`${projectUrl}/functions/v1/process-competence-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ jobId })
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

        if (!response.ok) {
            console.error('Edge Function failed:', response.status, text);
        }
    } catch (error) {
        console.error('Error triggering edge function:', error);
    }
}

testEdgeFunction();