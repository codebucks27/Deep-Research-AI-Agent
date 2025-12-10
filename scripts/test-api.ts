/**
 * API Test Script
 *
 * Tests the deep-research API endpoints against a running dev server.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. In another terminal: npx tsx scripts/test-api.ts
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testGenerateQuestions() {
  console.log('\n📋 Test 1: Generate Questions');
  console.log('─'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'machine learning best practices' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const questions = await response.json();
    console.log('  📊 Generated Questions:');

    if (Array.isArray(questions) && questions.length > 0) {
      questions.forEach((q: string, i: number) => {
        console.log(`    ${i + 1}. ${q}`);
      });
      console.log('\n  ✅ Generate Questions: PASSED');
      return true;
    } else {
      console.log('  ❌ No questions returned');
      console.log('  Response:', JSON.stringify(questions, null, 2));
      return false;
    }
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

async function testDeepResearch() {
  console.log('\n📋 Test 2: Deep Research (Streaming)');
  console.log('─'.repeat(50));
  console.log('  Note: This test uses mocked search results');

  try {
    // The route expects messages array with content as JSON string
    const messageContent = JSON.stringify({
      topic: 'TypeScript best practices',
      clarifications: [
        { question: 'What depth?', answer: 'Intermediate' },
      ],
    });

    const response = await fetch(`${BASE_URL}/api/deep-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: messageContent,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Read the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let activityCount = 0;
    let reportReceived = false;

    console.log('\n  📊 Streaming Activities:');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullResponse += chunk;

      // AI SDK v5 uses SSE format: "event: ...\ndata: {...}\n\n"
      // Parse streaming data - handle both old and new formats
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          // Skip SSE event lines
          if (line.startsWith('event:')) continue;

          // Handle SSE data lines
          let jsonStr = line;
          if (line.startsWith('data:')) {
            jsonStr = line.substring(5).trim();
          }

          // Also handle old format: "0:data\n"
          const match = jsonStr.match(/^\d+:(.+)$/);
          if (match) {
            jsonStr = match[1];
          }

          if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
            const data = JSON.parse(jsonStr);

            // Handle AI SDK v5 data format: { type: "data", value: [...] }
            if (data.type === 'data' && Array.isArray(data.value)) {
              for (const item of data.value) {
                if (item.type === 'activity') {
                  activityCount++;
                  const status = item.content?.status || 'unknown';
                  const message = item.content?.message || '';
                  const icon = status === 'complete' ? '✓' : status === 'pending' ? '○' : '!';
                  console.log(`    ${icon} ${message}`);
                } else if (item.type === 'report') {
                  reportReceived = true;
                  console.log('\n  📄 Report Preview (first 200 chars):');
                  console.log(`    ${item.content?.substring(0, 200)}...`);
                }
              }
            }
            // Also handle direct format (for backwards compatibility)
            else if (data.type === 'activity') {
              activityCount++;
              const status = data.content?.status || 'unknown';
              const message = data.content?.message || '';
              const icon = status === 'complete' ? '✓' : status === 'pending' ? '○' : '!';
              console.log(`    ${icon} ${message}`);
            } else if (data.type === 'report') {
              reportReceived = true;
              console.log('\n  📄 Report Preview (first 200 chars):');
              console.log(`    ${data.content?.substring(0, 200)}...`);
            }
          }
        } catch {
          // Not JSON, skip
        }
      }
    }

    console.log(`\n  Activities received: ${activityCount}`);
    console.log(`  Report received: ${reportReceived}`);
    console.log(`  Raw response length: ${fullResponse.length}`);

    // Debug: show first part of raw response if no activities
    if (activityCount === 0 && fullResponse.length > 0) {
      console.log('\n  Debug - First 500 chars of response:');
      console.log(`    ${fullResponse.substring(0, 500)}`);
    }

    if (activityCount > 0) {
      console.log('\n  ✅ Deep Research: PASSED');
      return true;
    } else {
      console.log('\n  ⚠️  Deep Research: Partial (no activities parsed)');
      return false;
    }
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

async function checkServerRunning() {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    return response.ok || response.status === 405; // 405 is OK, just means method not allowed
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Deep Research API Test Suite');
  console.log('═'.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);

  // Check if server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.error('\n❌ Server not running!');
    console.error('   Start the dev server first: npm run dev');
    process.exit(1);
  }

  console.log('✓ Server is running');

  const results: boolean[] = [];

  results.push(await testGenerateQuestions());
  results.push(await testDeepResearch());

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary');
  console.log('─'.repeat(50));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed');
  }
}

main().catch(console.error);
