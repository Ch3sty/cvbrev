// GPT-5 Responses API Client
// This uses the new /v1/responses endpoint for GPT-5 models

import { openai } from './api';

// Types for GPT-5 Responses API
export interface GPT5ResponseInput {
  role: 'user' | 'developer' | 'assistant';
  content: string | Array<{ type: 'input_text'; text: string }>;
}

export interface GPT5Tool {
  type: 'custom' | 'function';
  name: string;
  description: string;
  format?: {
    type: 'grammar';
    syntax: 'lark' | 'regex';
    definition: string;
  };
  // For function type tools
  parameters?: any;
}

export interface GPT5ResponseParams {
  model: 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano';
  input: string | GPT5ResponseInput[];
  reasoning?: {
    effort: 'minimal' | 'low' | 'medium' | 'high';
  };
  text?: {
    verbosity?: 'low' | 'medium' | 'high';
    format?: {
      type: 'text'; // Only 'text' is supported for freeform output
    };
  };
  tools?: GPT5Tool[];
  tool_choice?: {
    type: 'allowed_tools';
    mode: 'auto' | 'required';
    tools: Array<{ type: string; name: string }>;
  };
  max_output_tokens?: number;
  previous_response_id?: string;
}

export interface GPT5Response {
  id: string;
  output: Array<{
    type?: string;
    content?: Array<{
      type: string;
      text?: string;
    }>;
    name?: string;
    input?: string;
    call_id?: string;
  }>;
  output_text?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    reasoning_tokens?: number;
    total_tokens: number;
  };
}

// Custom fetch-based implementation since OpenAI SDK doesn't support responses API yet
export async function createGPT5Response(params: GPT5ResponseParams): Promise<GPT5Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Fix parameter name: max_completion_tokens -> max_output_tokens
  const requestParams = { ...params };
  if ('max_completion_tokens' in requestParams) {
    delete (requestParams as any).max_completion_tokens;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestParams),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`GPT-5 API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  // Debug: Log the full response structure
  if (process.env.NODE_ENV !== 'production') {
    console.log('GPT-5 API Response structure:', JSON.stringify(data.output?.slice(0, 2), null, 2));
  }

  // Extract text from output for convenience
  let output_text = '';
  if (data.output && Array.isArray(data.output)) {
    for (const item of data.output) {
      // Look for message type items
      if (item.type === 'message' && item.content && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (content.type === 'text' && content.text) {
            output_text += content.text;
          }
        }
      } else if (item.content && typeof item.content === 'string') {
        // Sometimes content might be a direct string
        output_text += item.content;
      }
    }
  }

  return {
    ...data,
    output_text,
  };
}

// Helper function to extract structured JSON from GPT-5 response
export function extractJSONFromGPT5Response(response: GPT5Response): any {
  const text = response.output_text || '';

  if (!text) {
    console.warn('GPT-5 response has no text content');
    return null;
  }

  // Clean the text
  const cleanText = text.trim();

  // Try to find JSON in code blocks first
  const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.warn('Failed to parse JSON from code block');
    }
  }

  // Try to parse the entire text as JSON
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // Try to find JSON array
    const arrayStart = cleanText.indexOf('[');
    const arrayEnd = cleanText.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayStart < arrayEnd) {
      try {
        const arrayText = cleanText.substring(arrayStart, arrayEnd + 1);
        return JSON.parse(arrayText);
      } catch (e2) {
        // Continue to object extraction
      }
    }

    // Try to find JSON object
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      try {
        const objText = cleanText.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(objText);
      } catch (e3) {
        console.warn('Failed to extract JSON from response. Text:', cleanText.substring(0, 200));
      }
    }
  }

  return null;
}

// Calculate cost for GPT-5 models
export function calculateGPT5Cost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 1.00 },
    'gpt-5-nano': { input: 0.05, output: 0.20 },
  };

  const modelPricing = pricing[model];
  if (!modelPricing) {
    console.warn(`Unknown GPT-5 model: ${model}`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

  return inputCost + outputCost;
}