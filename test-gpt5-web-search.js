// Test GPT-5 web search capability
const apiKey = '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';

async function testWebSearch() {
  console.log('Testing GPT-4o with web search...');

  try {
    // First try gpt-4o-search-preview
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        web_search_options: {},
        messages: [
          {
            role: 'user',
            content: 'Sök på webben efter BYA väktarutbildning. Ge mig den EXAKTA URL:en till ansökningssidan. Inkludera hela https:// länken.'
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Web search model error:', error);

      // Try GPT-5 with web_search tool
      console.log('\nTrying GPT-5 with web_search tool...');
      const gpt5Response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5',
          tools: [{ type: 'web_search' }],
          input: 'Hitta BYA:s väktarutbildning och ge mig den exakta länken till kursen.'
        })
      });

      if (!gpt5Response.ok) {
        const gpt5Error = await gpt5Response.json();
        console.error('GPT-5 error:', gpt5Error);
        return;
      }

      const gpt5Data = await gpt5Response.json();
      console.log('GPT-5 response:', JSON.stringify(gpt5Data, null, 2));
      return;
    }

    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));

    // Check for annotations with URLs
    if (data.choices?.[0]?.message?.annotations) {
      console.log('\nFound URL citations:');
      data.choices[0].message.annotations.forEach((ann, i) => {
        if (ann.url_citation) {
          console.log(`${i + 1}. ${ann.url_citation.title}: ${ann.url_citation.url}`);
        }
      });
    }

  } catch (error) {
    console.error('Request failed:', error);
  }
}

testWebSearch();