#!/usr/bin/env node

const http = require('http');

// Test cases based on getInitialQuestion function
const testCases = [
  {
    course: 'variables',
    topic: 'variables',
    question: 'What is the difference between let and const in JavaScript?',
    answer: 'let allows reassignment while const does not. Both are block-scoped.'
  },
  {
    course: 'functions',
    topic: 'functions',
    question: 'How do you define a function in JavaScript?',
    answer: 'You can use function keyword or arrow functions like const myFunc = () => {}'
  },
  {
    course: 'arrays',
    topic: 'arrays',
    question: 'How do you create an array and add elements to it?',
    answer: 'Use const arr = [] and add elements with arr.push(element)'
  }
];

function sendRequest(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      topic: testCase.topic,
      question: testCase.question,
      answer: testCase.answer,
      course: testCase.course
    });

    const options = {
      hostname: 'localhost',
      port: 5678,
      path: '/webhook/lesson',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ testCase, response, statusCode: res.statusCode });
        } catch (e) {
          resolve({ testCase, response: data, statusCode: res.statusCode, parseError: true });
        }
      });
    });

    req.on('error', (error) => {
      reject({ testCase, error });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting End-to-End Tests for Tutor Agent\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}/${testCases.length}: ${testCase.course}`);
    console.log(`Question: ${testCase.question}`);
    console.log(`Answer: ${testCase.answer}`);
    console.log('Sending request...');

    try {
      const result = await sendRequest(testCase);
      
      if (result.statusCode === 200) {
        console.log('✅ Status: 200 OK');
        
        if (result.parseError) {
          console.log('⚠️  Response is not JSON (might be workflow started message)');
          console.log('Response:', result.response.substring(0, 100));
        } else {
          // Check response structure
          const hasRetention = result.response.retention !== undefined;
          const hasFeedback = result.response.feedback !== undefined;
          const hasResponse = result.response.response !== undefined;
          
          console.log(`✅ Has retention: ${hasRetention} ${hasRetention ? `(${result.response.retention})` : ''}`);
          console.log(`✅ Has feedback: ${hasFeedback}`);
          console.log(`✅ Has response: ${hasResponse}`);
          
          if (hasRetention && hasFeedback && hasResponse) {
            console.log('✅ TEST PASSED');
            passed++;
          } else {
            console.log('❌ TEST FAILED: Missing required fields');
            failed++;
          }
        }
      } else {
        console.log(`❌ Status: ${result.statusCode}`);
        console.log('❌ TEST FAILED');
        failed++;
      }
    } catch (error) {
      console.log('❌ Error:', error.error?.message || error.message);
      console.log('❌ TEST FAILED');
      failed++;
    }

    // Wait between tests
    if (i < testCases.length - 1) {
      console.log('\nWaiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log(`Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);
  
  process.exit(failed > 0 ? 1 : 0);
}

// Check if services are running
console.log('🔍 Checking if services are running...');
console.log('Make sure the following are running:');
console.log('  1. LightRAG Server (port 8000): npm run lightrag');
console.log('  2. n8n Backend (port 5678): npm run n8n');
console.log('  3. Angular Frontend (port 4200): npm start');
console.log('  4. Ollama with models: Qwen2.5:7B and deepseek-r1:14b\n');

setTimeout(() => {
  runTests();
}, 1000);
