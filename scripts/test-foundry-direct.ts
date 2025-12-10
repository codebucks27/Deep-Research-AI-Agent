/**
 * Direct Foundry Provider Test
 *
 * Tests the Foundry provider directly without going through Next.js
 * Using the exact pattern from sdk-validation that works.
 *
 * Usage: npx tsx scripts/test-foundry-direct.ts
 * Debug: DEBUG_FOUNDRY=1 npx tsx scripts/test-foundry-direct.ts
 */

import { generateText, tool } from 'ai';
import { createFoundry } from '@northslopetech/foundry-ai-sdk';
import { z } from 'zod';

// Check env vars
const FOUNDRY_TOKEN = process.env.FOUNDRY_TOKEN;
const FOUNDRY_BASE_URL = process.env.FOUNDRY_BASE_URL;

console.log('🔧 Environment Check');
console.log('─'.repeat(50));
console.log(`FOUNDRY_TOKEN: ${FOUNDRY_TOKEN ? '✓ Set (' + FOUNDRY_TOKEN.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`FOUNDRY_BASE_URL: ${FOUNDRY_BASE_URL ? '✓ ' + FOUNDRY_BASE_URL : '❌ Missing'}`);

if (!FOUNDRY_TOKEN || !FOUNDRY_BASE_URL) {
  console.error('\n❌ Missing environment variables!');
  console.error('   Make sure .envrc is loaded (run: direnv allow)');
  process.exit(1);
}

const foundry = createFoundry({
  foundryToken: FOUNDRY_TOKEN,
  baseURL: FOUNDRY_BASE_URL,
});

async function testBasicTextGeneration() {
  console.log('\n📋 Test 1: Basic Text Generation');
  console.log('─'.repeat(50));

  try {
    console.log('  Sending request...');
    const startTime = Date.now();

    const result = await generateText({
      model: foundry('GPT_5') as any,
      prompt: 'Say "Hello from Foundry!" and nothing else.',
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log(`  Text: "${result.text}"`);
    console.log(`  Usage: ${JSON.stringify(result.usage)}`);

    if (result.text && result.text.length > 0) {
      console.log('\n  ✅ Basic text generation: PASSED');
      return true;
    } else {
      console.log('\n  ❌ Empty response');
      return false;
    }
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    return false;
  }
}

async function testToolCall() {
  console.log('\n📋 Test 2: Tool Call (Structured Output)');
  console.log('─'.repeat(50));

  // JSON Schema for providerOptions (required workaround)
  const questionsJsonSchema = {
    type: 'object' as const,
    properties: {
      questions: {
        type: 'array' as const,
        items: { type: 'string' as const },
      },
    },
    required: ['questions'],
  };

  try {
    console.log('  Sending request with tool...');
    const startTime = Date.now();

    // Using exact pattern from sdk-validation that works (AI SDK v5)
    const result = await generateText({
      model: foundry('GPT_5') as any,
      prompt: `Generate 2 simple questions about TypeScript.

IMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.`,
      tools: {
        submit_result: tool({
          description: 'Submit the generated questions',
          inputSchema: z.object({  // AI SDK v5: parameters -> inputSchema
            questions: z.array(z.string()),
          }),
          providerOptions: {
            foundry: { parameters: questionsJsonSchema },
          },
          // Execute is required for proper tool detection
          execute: async (args) => args,
        }),
      },
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);

    console.log('\n  Result details:');
    console.log('    Text:', result.text ? `"${result.text.substring(0, 100)}..."` : '(empty)');
    console.log('    Tool calls:', result.toolCalls?.length || 0);
    console.log('    Tool results:', result.toolResults?.length || 0);

    if (result.toolCalls && result.toolCalls.length > 0) {
      const toolCall = result.toolCalls[0];
      console.log('\n  Tool call details:');
      console.log('    Name:', toolCall.toolName);

      // Check both .args and .input for AI SDK v5 compatibility
      const args = (toolCall as any).input
        ? (typeof (toolCall as any).input === 'string'
          ? JSON.parse((toolCall as any).input)
          : (toolCall as any).input)
        : toolCall.args;

      console.log('    Args:', JSON.stringify(args, null, 2));

      if (args && args.questions && args.questions.length > 0) {
        console.log('\n  Generated questions:');
        args.questions.forEach((q: string, i: number) => {
          console.log(`    ${i + 1}. ${q}`);
        });
        console.log('\n  ✅ Tool call: PASSED');
        return true;
      }
    }

    // Check if model responded with text instead of tool call
    if (result.text && result.text.length > 0) {
      console.log('\n  ⚠️  Model responded with text instead of tool call:');
      console.log(`    "${result.text}"`);
    }

    console.log('\n  ❌ No tool call received');
    return false;
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    return false;
  }
}

async function testWeatherTool() {
  console.log('\n📋 Test 3: Weather Tool (like sdk-validation)');
  console.log('─'.repeat(50));

  const weatherJsonSchema = {
    type: 'object' as const,
    properties: {
      location: { type: 'string' as const, description: 'City name' },
    },
    required: ['location'],
  };

  try {
    console.log('  Sending request...');
    const startTime = Date.now();

    const result = await generateText({
      model: foundry('GPT_5') as any,
      prompt: 'What is the weather in Tokyo?',
      tools: {
        get_weather: tool({
          description: 'Get weather for a location',
          inputSchema: z.object({ location: z.string() }),  // AI SDK v5: parameters -> inputSchema
          providerOptions: {
            foundry: { parameters: weatherJsonSchema },
          },
          execute: async ({ location }) => {
            console.log(`  🔧 Tool called: get_weather("${location}")`);
            return { location, temp: 22, conditions: 'Clear' };
          },
        }),
      },
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log('  Tool calls:', result.toolCalls?.length || 0);
    console.log('  Text response:', result.text?.substring(0, 100) || '(empty)');

    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log('\n  ✅ Weather tool: PASSED');
      return true;
    }

    console.log('\n  ❌ No tool call');
    return false;
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Direct Foundry Provider Test');
  console.log('═'.repeat(50));

  const results: boolean[] = [];

  results.push(await testBasicTextGeneration());
  results.push(await testToolCall());
  results.push(await testWeatherTool());

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary');
  console.log('─'.repeat(50));

  const passed = results.filter(r => r).length;
  console.log(`Passed: ${passed}/${results.length}`);

  if (passed === results.length) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed - check output above');
  }
}

main().catch(console.error);
