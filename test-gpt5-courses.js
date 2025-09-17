// Test GPT-5 course suggestions generation directly
require('dotenv').config({ path: '.env.local' });

async function testCourseSuggestions() {
    console.log('🎯 Testing GPT-5 Course Suggestions Generation\n');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('❌ OPENAI_API_KEY not set');
        return;
    }

    // Test gap example
    const testGap = {
        skill: "Saknar Målargesäll-certifikat",
        importance: "essential",
        reasoning: "Branschstandard i Sverige för kvalificerade målare"
    };

    const prompt = `Du är en svensk utbildningsexpert. Hitta EXAKTA kurser för:

Gap: ${testGap.skill}
Viktighet: ${testGap.importance === 'essential' ? 'OBLIGATORISK' : 'Önskvärd'}
Målroll: Målare

SVENSKA UTBILDNINGSANORDNARE (använd dessa):

För CERTIFIKAT:
- Målarmästarna - Målargesäll-certifikat
- BYN (Byggbranschens Yrkesnämnd) - ID06, APU-handledare
- Svenska Brand- och Säkerhetscertifiering - Heta Arbeten
- Prevent - Asbestutbildning

För YRKESUTBILDNING:
- Lernia - YH-utbildningar, yrkesutbildningar
- Hermods - Yrkesutbildningar, distans
- Arbetsförmedlingen - Yrkesväxling, bristyrkesutbildningar

Returnera en JSON med EXAKT denna struktur:
{
  "suggestions": [
    {
      "type": "certification",
      "title": "EXAKT kursnamn som finns",
      "provider": "EXAKT anordnare från listan ovan",
      "relevance": "Hur detta löser gapet",
      "search_keywords": ["sökord1", "sökord2"],
      "direct_url": "https://... om du vet",
      "duration": "2 dagar",
      "cost": "3500 kr",
      "priority": "essential",
      "language": "sv"
    }
  ]
}

Ge 2-3 KONKRETA förslag. Returnera ENDAST JSON, ingen annan text!`;

    try {
        console.log('📤 Sending request to GPT-5 Responses API...\n');

        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-5-mini',
                instructions: prompt,
                input: `Hitta kurser för: ${testGap.skill}`,
                reasoning: {
                    effort: 'low'  // Reduce reasoning to save tokens
                },
                text: {
                    verbosity: 'medium',
                    format: {
                        type: 'json_schema',
                        name: 'course_suggestions',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                suggestions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            type: {
                                                type: 'string',
                                                enum: ['course', 'certification', 'self-study', 'project']
                                            },
                                            title: { type: 'string' },
                                            provider: { type: 'string' },
                                            relevance: { type: 'string' },
                                            search_keywords: {
                                                type: 'array',
                                                items: { type: 'string' }
                                            },
                                            direct_url: { type: 'string' },
                                            duration: { type: 'string' },
                                            cost: { type: 'string' },
                                            priority: {
                                                type: 'string',
                                                enum: ['essential', 'recommended', 'optional']
                                            },
                                            language: {
                                                type: 'string',
                                                enum: ['sv', 'en', 'other']
                                            }
                                        },
                                        required: ['type', 'title', 'provider', 'relevance', 'search_keywords', 'direct_url', 'duration', 'cost', 'priority', 'language'],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: ['suggestions'],
                            additionalProperties: false
                        }
                    }
                },
                max_output_tokens: 3000,  // Increased to allow for reasoning + output
                store: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ GPT-5 API Error:', response.status);
            console.error('Error details:', JSON.stringify(data, null, 2));
            return;
        }

        console.log('✅ GPT-5 Response received!\n');
        console.log('📊 Usage:', {
            input_tokens: data.usage?.input_tokens,
            output_tokens: data.usage?.output_tokens,
            total_tokens: data.usage?.total_tokens
        });

        // Debug: Show full response structure
        console.log('\n🔍 Full response structure:');
        console.log(JSON.stringify(data, null, 2));

        // Extract text from output - try both patterns
        let outputText = '';

        // Pattern 1: output_text field
        if (data.output_text) {
            outputText = data.output_text;
            console.log('\n✅ Found output_text directly');
        }
        // Pattern 2: output array
        else if (data.output && Array.isArray(data.output)) {
            console.log('\n📋 Parsing output array...');
            for (const item of data.output) {
                console.log('  Item type:', item.type);
                if (item.type === 'message' && item.content && Array.isArray(item.content)) {
                    for (const content of item.content) {
                        // GPT-5 uses 'output_text' instead of 'text'
                        if ((content.type === 'text' || content.type === 'output_text') && content.text) {
                            outputText += content.text;
                            console.log('    Found text in content.type:', content.type);
                        }
                    }
                } else if (item.content && typeof item.content === 'string') {
                    outputText += item.content;
                }
            }
        }

        console.log('\n📝 Extracted output text:');
        console.log(outputText || '(empty)');

        // Parse JSON
        try {
            const suggestions = JSON.parse(outputText);
            console.log('\n✨ Parsed Course Suggestions:');
            console.log(JSON.stringify(suggestions, null, 2));

            if (suggestions.suggestions && Array.isArray(suggestions.suggestions)) {
                console.log(`\n✅ Successfully generated ${suggestions.suggestions.length} course suggestions!`);

                suggestions.suggestions.forEach((suggestion, i) => {
                    console.log(`\n📚 Suggestion ${i + 1}:`);
                    console.log(`   Title: ${suggestion.title}`);
                    console.log(`   Provider: ${suggestion.provider}`);
                    console.log(`   Type: ${suggestion.type}`);
                    console.log(`   Priority: ${suggestion.priority}`);
                    console.log(`   Duration: ${suggestion.duration || 'N/A'}`);
                    console.log(`   Cost: ${suggestion.cost || 'N/A'}`);
                });
            } else {
                console.log('⚠️ No suggestions array found in response');
            }
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError.message);
            console.log('Raw text was:', outputText);
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testCourseSuggestions();