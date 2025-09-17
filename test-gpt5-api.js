// Test GPT-5 API directly
const fetch = require('node-fetch');

async function testGPT5API() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error('❌ OPENAI_API_KEY not set');
        return;
    }

    console.log('🔍 Testing GPT-5 API...\n');

    // Test the Responses API endpoint
    try {
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-5-mini',
                input: [
                    { role: 'user', content: 'Say "Hello from GPT-5" if you are GPT-5' }
                ],
                reasoning: {
                    effort: 'minimal'
                },
                text: {
                    verbosity: 'low',
                    format: {
                        type: 'text'
                    }
                },
                max_output_tokens: 100
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ GPT-5 API Error:', response.status, data);
            console.log('\nTrying GPT-4 for comparison...');

            // Try GPT-4 as comparison
            const gpt4Response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'user', content: 'Say "Hello from GPT-4"' }
                    ],
                    max_tokens: 50
                })
            });

            const gpt4Data = await gpt4Response.json();
            if (gpt4Response.ok) {
                console.log('✅ GPT-4 works:', gpt4Data.choices[0].message.content);
            } else {
                console.error('❌ GPT-4 also failed:', gpt4Data);
            }
        } else {
            console.log('✅ GPT-5 Response:', data);
            if (data.output_text) {
                console.log('Output:', data.output_text);
            }
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

// Load env variables
require('dotenv').config({ path: '.env.local' });

testGPT5API();