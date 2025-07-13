import { DateTime } from 'luxon';
import { performance } from 'perf_hooks';
import { type Browser, type BrowserContext, type Page, chromium } from 'playwright';

// Import the encryption function from your existing code
// Note: You'll need to adjust the import path based on your project structure
// import { encryptSecondaryData } from '../packages/lib/server-only/crypto/encrypt';

interface TestResult {
  clientId: number;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  pdfSize?: number;
}

interface TestConfig {
  browserlessUrl: string;
  webappUrl: string;
  concurrentClients: number;
  totalRequests: number;
  delayBetweenRequests: number;
  timeout: number;
  pdfFormat: 'A4' | 'Letter';
  testMode: 'certificate' | 'simple-page';
  targetUrl?: string; // Only used for simple-page mode
}

class BrowserlessStressTest {
  private config: TestConfig;
  private results: TestResult[] = [];
  private activeConnections = 0;
  private completedRequests = 0;
  private failedRequests = 0;

  constructor(config: TestConfig) {
    this.config = config;
  }

  async runTest(): Promise<void> {
    console.log('🚀 Starting Browserless Stress Test');
    console.log('='.repeat(60));
    console.log(`📊 Configuration:`);
    console.log(`   Browserless URL: ${this.config.browserlessUrl}`);
    console.log(`   Webapp URL: ${this.config.webappUrl}`);
    console.log(`   Test Mode: ${this.config.testMode}`);
    if (this.config.testMode === 'simple-page') {
      console.log(`   Target URL: ${this.config.targetUrl}`);
    }
    console.log(`   Concurrent Clients: ${this.config.concurrentClients}`);
    console.log(`   Total Requests: ${this.config.totalRequests}`);
    console.log(`   Delay Between Requests: ${this.config.delayBetweenRequests}ms`);
    console.log(`   Timeout: ${this.config.timeout}ms`);
    console.log(`   PDF Format: ${this.config.pdfFormat}`);
    console.log('='.repeat(60));

    const startTime = performance.now();

    // Create concurrent client tasks
    const clientTasks = Array.from({ length: this.config.concurrentClients }, (_, index) =>
      this.createClientTask(index + 1),
    );

    // Start all clients
    await Promise.all(clientTasks);

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    this.printResults(totalDuration);
  }

  private async createClientTask(clientId: number): Promise<void> {
    const requestsPerClient = Math.ceil(this.config.totalRequests / this.config.concurrentClients);

    for (
      let i = 0;
      i < requestsPerClient &&
      this.completedRequests + this.failedRequests < this.config.totalRequests;
      i++
    ) {
      await this.processRequest(clientId);

      if (i < requestsPerClient - 1) {
        await this.sleep(this.config.delayBetweenRequests);
      }
    }
  }

  private async processRequest(clientId: number): Promise<void> {
    const startTime = performance.now();
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      this.activeConnections++;

      // Connect to browserless
      // browser = await chromium.connectOverCDP(this.config.browserlessUrl);
      browser = await chromium.connectOverCDP('ws://localhost:3001?token=6R0W53R135510');
      context = await browser.newContext();
      page = await context.newPage();

      let targetUrl: string;

      if (this.config.testMode === 'certificate') {
        // Generate a test document ID and encrypted token
        const documentId = Math.floor(Math.random() * 1000000) + 1;

        // For testing purposes, we'll create a simple encrypted token
        // In production, you'd use the actual encryptSecondaryData function
        const testToken = Buffer.from(`test-${documentId}-${Date.now()}`).toString('base64');

        // targetUrl = `${this.config.webappUrl}/__htmltopdf/certificate?d=${testToken}`;
        targetUrl = `${this.config.webappUrl}`;

        // Set language cookie
        await page.context().addCookies([
          {
            name: 'language',
            value: 'en',
            url: this.config.webappUrl,
          },
        ]);
      } else {
        targetUrl = this.config.targetUrl!;
      }

      // Navigate to target URL
      await page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: this.config.pdfFormat,
        printBackground: true,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      this.results.push({
        clientId,
        startTime,
        endTime,
        duration,
        success: true,
        pdfSize: pdfBuffer.length,
      });

      this.completedRequests++;

      console.log(
        `✅ Client ${clientId}: PDF generated (${pdfBuffer.length} bytes) in ${duration.toFixed(2)}ms`,
      );
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.results.push({
        clientId,
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      this.failedRequests++;
      console.error(`❌ Client ${clientId}: Failed after ${duration.toFixed(2)}ms - ${error}`);
    } finally {
      this.activeConnections--;

      // Clean up resources
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      if (context) {
        try {
          await context.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }

  private printResults(totalDuration: number): void {
    console.log('\n' + '='.repeat(60));
    console.log('📈 STRESS TEST RESULTS');
    console.log('='.repeat(60));

    const successfulRequests = this.results.filter((r) => r.success);
    const failedRequests = this.results.filter((r) => !r.success);

    // Basic statistics
    console.log(`📊 Summary:`);
    console.log(`   Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`   Total Requests: ${this.results.length}`);
    console.log(`   Successful: ${successfulRequests.length}`);
    console.log(`   Failed: ${failedRequests.length}`);
    console.log(
      `   Success Rate: ${((successfulRequests.length / this.results.length) * 100).toFixed(2)}%`,
    );

    if (successfulRequests.length > 0) {
      const durations = successfulRequests.map((r) => r.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const sortedDurations = durations.sort((a, b) => a - b);
      const medianDuration = sortedDurations[Math.floor(sortedDurations.length / 2)];

      console.log(`\n⏱️  Performance Metrics (successful requests):`);
      console.log(`   Average Duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`   Median Duration: ${medianDuration.toFixed(2)}ms`);
      console.log(`   Min Duration: ${minDuration.toFixed(2)}ms`);
      console.log(`   Max Duration: ${maxDuration.toFixed(2)}ms`);
      console.log(
        `   Requests per Second: ${(successfulRequests.length / (totalDuration / 1000)).toFixed(2)}`,
      );

      // PDF size statistics
      const pdfSizes = successfulRequests.map((r) => r.pdfSize!).filter((size) => size > 0);
      if (pdfSizes.length > 0) {
        const avgPdfSize = pdfSizes.reduce((a, b) => a + b, 0) / pdfSizes.length;
        const minPdfSize = Math.min(...pdfSizes);
        const maxPdfSize = Math.max(...pdfSizes);

        console.log(`\n📄 PDF Size Statistics:`);
        console.log(`   Average Size: ${(avgPdfSize / 1024).toFixed(2)}KB`);
        console.log(`   Min Size: ${(minPdfSize / 1024).toFixed(2)}KB`);
        console.log(`   Max Size: ${(maxPdfSize / 1024).toFixed(2)}KB`);
      }
    }

    // Concurrent connection analysis
    console.log(`\n🔗 Concurrent Connections:`);
    console.log(`   Max Concurrent: ${this.config.concurrentClients}`);
    console.log(`   Peak Active: ${Math.max(...this.results.map((r) => this.activeConnections))}`);

    // Error analysis
    if (failedRequests.length > 0) {
      console.log(`\n❌ Error Analysis:`);
      const errorCounts: Record<string, number> = {};
      failedRequests.forEach((r) => {
        const error = r.error || 'Unknown error';
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });

      Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([error, count]) => {
          console.log(`   ${error}: ${count} occurrences`);
        });
    }

    // Performance recommendations
    console.log(`\n💡 Recommendations:`);
    if (failedRequests.length > 0) {
      console.log(
        `   ⚠️  ${failedRequests.length} requests failed - consider reducing concurrent clients`,
      );
    }

    const avgDuration =
      successfulRequests.length > 0
        ? successfulRequests.reduce((sum, r) => sum + r.duration, 0) / successfulRequests.length
        : 0;

    if (avgDuration > 5000) {
      console.log(
        `   ⚠️  Average response time is high (${avgDuration.toFixed(2)}ms) - consider optimizing the target page`,
      );
    }

    const rps = successfulRequests.length / (totalDuration / 1000);
    if (rps < 1) {
      console.log(
        `   ⚠️  Low throughput (${rps.toFixed(2)} req/s) - consider increasing concurrent clients or optimizing`,
      );
    } else {
      console.log(`   ✅ Good throughput: ${rps.toFixed(2)} requests per second`);
    }

    // Browserless-specific recommendations
    console.log(`\n🔧 Browserless Optimization Tips:`);
    console.log(`   • Monitor browserless container memory usage during tests`);
    console.log(`   • Consider adjusting browserless max-concurrent-sessions setting`);
    console.log(`   • Test with different browserless configurations (memory limits, timeouts)`);
    console.log(`   • Monitor network latency between your app and browserless`);

    console.log('='.repeat(60));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main(): Promise<void> {
  // Configuration - adjust these values based on your needs
  const config: TestConfig = {
    browserlessUrl: 'http://localhost:3001', // Your browserless URL
    webappUrl: 'http://localhost:3000', // Your webapp URL
    testMode: 'simple-page', // 'certificate' or 'simple-page'
    targetUrl: 'https://example.com', // Only used for simple-page mode
    concurrentClients: 5, // Number of simultaneous connections
    totalRequests: 50, // Total number of PDF generation requests
    delayBetweenRequests: 100, // Delay between requests per client (ms)
    timeout: 30000, // Page load timeout (ms)
    pdfFormat: 'A4',
  };

  // Validate configuration
  if (!config.browserlessUrl) {
    console.error('❌ Please provide a browserless URL');
    process.exit(1);
  }

  if (config.testMode === 'simple-page' && !config.targetUrl) {
    console.error('❌ Please provide a target URL for simple-page mode');
    process.exit(1);
  }

  try {
    const stressTest = new BrowserlessStressTest(config);
    await stressTest.runTest();
  } catch (error) {
    console.error('❌ Stress test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { BrowserlessStressTest, type TestConfig, type TestResult };
