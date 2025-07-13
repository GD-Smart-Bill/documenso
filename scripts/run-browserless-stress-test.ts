#!/usr/bin/env tsx
import { BrowserlessStressTest, type TestConfig } from './stress-test-browserless-pdf-generation';

// Test scenarios - you can easily modify these
const testScenarios: Record<string, TestConfig> = {
  // Light load test
  light: {
    browserlessUrl: 'http://localhost:3001',
    webappUrl: 'http://localhost:3000',
    testMode: 'simple-page',
    targetUrl: 'https://example.com',
    concurrentClients: 2,
    totalRequests: 10,
    delayBetweenRequests: 500,
    timeout: 30000,
    pdfFormat: 'A4',
  },

  // Medium load test
  medium: {
    browserlessUrl: 'http://localhost:3001',
    webappUrl: 'http://localhost:3000',
    testMode: 'simple-page',
    targetUrl: 'https://example.com',
    concurrentClients: 5,
    totalRequests: 50,
    delayBetweenRequests: 200,
    timeout: 30000,
    pdfFormat: 'A4',
  },

  // Heavy load test
  heavy: {
    browserlessUrl: 'http://localhost:3001',
    webappUrl: 'http://localhost:3000',
    testMode: 'simple-page',
    targetUrl: 'http://localhost:3000',
    concurrentClients: 10,
    totalRequests: 100,
    delayBetweenRequests: 100,
    timeout: 30000,
    pdfFormat: 'A4',
  },

  // Extreme load test
  extreme: {
    browserlessUrl: 'http://localhost:3001',
    webappUrl: 'http://localhost:3000',
    testMode: 'simple-page',
    targetUrl: 'https://sign.smartbill.co.il/documents',
    concurrentClients: 20,
    totalRequests: 200,
    delayBetweenRequests: 50,
    timeout: 30000,
    pdfFormat: 'A4',
  },

  // Certificate endpoint test
  certificate: {
    browserlessUrl: 'http://localhost:3001',
    webappUrl: 'http://localhost:3000',
    testMode: 'certificate',
    concurrentClients: 3,
    totalRequests: 30,
    delayBetweenRequests: 300,
    timeout: 30000,
    pdfFormat: 'A4',
  },
};

async function main(): Promise<void> {
  const scenario = process.argv[2] || 'medium';

  if (!testScenarios[scenario]) {
    console.error('❌ Invalid test scenario. Available scenarios:');
    console.error(Object.keys(testScenarios).join(', '));
    process.exit(1);
  }

  const config = testScenarios[scenario];

  console.log(`🎯 Running ${scenario} stress test scenario`);
  console.log(`📋 Scenario: ${scenario}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('');

  try {
    const stressTest = new BrowserlessStressTest(config);
    await stressTest.runTest();

    console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Stress test failed:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);
