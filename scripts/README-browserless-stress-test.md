# Browserless Stress Test Scripts

This directory contains stress testing scripts to evaluate the performance of your browserless instance when handling multiple concurrent Playwright clients generating PDFs.

## Files

- `stress-test-browserless-pdf-generation.ts` - Main stress test class and logic
- `run-browserless-stress-test.ts` - Simple test runner with predefined scenarios
- `README-browserless-stress-test.md` - This documentation

## Prerequisites

1. **Browserless running on port 3001**
   ```bash
   # Example Docker command
   docker run -p 3001:3000 browserless/chrome:latest
   ```

2. **Your webapp running** (if testing certificate endpoints)
   ```bash
   npm run dev
   ```

3. **Playwright installed**
   ```bash
   npm install playwright
   ```

## Quick Start

### 1. Run a predefined test scenario

```bash
# Run medium load test
npx tsx scripts/run-browserless-stress-test.ts medium

# Run light load test
npx tsx scripts/run-browserless-stress-test.ts light

# Run heavy load test
npx tsx scripts/run-browserless-stress-test.ts heavy

# Run extreme load test
npx tsx scripts/run-browserless-stress-test.ts extreme

# Run certificate endpoint test
npx tsx scripts/run-browserless-stress-test.ts certificate
```

### 2. Run custom test

```bash
# Run the main script with custom configuration
npx tsx scripts/stress-test-browserless-pdf-generation.ts
```

## Test Scenarios

### Light Load
- **Concurrent Clients**: 2
- **Total Requests**: 10
- **Delay**: 500ms
- **Use Case**: Basic functionality testing

### Medium Load
- **Concurrent Clients**: 5
- **Total Requests**: 50
- **Delay**: 200ms
- **Use Case**: Normal production load simulation

### Heavy Load
- **Concurrent Clients**: 10
- **Total Requests**: 100
- **Delay**: 100ms
- **Use Case**: High traffic simulation

### Extreme Load
- **Concurrent Clients**: 20
- **Total Requests**: 200
- **Delay**: 50ms
- **Use Case**: Stress testing limits

### Certificate Endpoint
- **Concurrent Clients**: 3
- **Total Requests**: 30
- **Delay**: 300ms
- **Use Case**: Testing your actual certificate PDF generation

## Configuration Options

You can customize the test configuration by modifying the `config` object in the scripts:

```typescript
const config: TestConfig = {
  browserlessUrl: 'http://localhost:3001',    // Your browserless URL
  webappUrl: 'http://localhost:3000',         // Your webapp URL
  testMode: 'simple-page',                    // 'certificate' or 'simple-page'
  targetUrl: 'https://example.com',           // Only for simple-page mode
  concurrentClients: 5,                       // Number of simultaneous connections
  totalRequests: 50,                          // Total PDF generation requests
  delayBetweenRequests: 100,                  // Delay between requests (ms)
  timeout: 30000,                             // Page load timeout (ms)
  pdfFormat: 'A4',                            // PDF format
};
```

## Test Modes

### Simple Page Mode
Tests PDF generation from any public URL. Useful for:
- Testing browserless performance with simple pages
- Benchmarking different websites
- Isolating browserless performance from your app

### Certificate Mode
Tests your actual certificate PDF generation endpoint. Useful for:
- Testing your complete PDF generation pipeline
- Validating real-world performance
- Testing with your actual authentication/encryption

## Understanding Results

The test will output comprehensive metrics including:

### Performance Metrics
- **Average Duration**: Mean time to generate PDF
- **Median Duration**: Middle value of all durations
- **Min/Max Duration**: Fastest and slowest requests
- **Requests per Second**: Throughput measurement

### Success Metrics
- **Success Rate**: Percentage of successful requests
- **Error Analysis**: Breakdown of failure reasons
- **PDF Size Statistics**: Average, min, max PDF sizes

### Connection Metrics
- **Concurrent Connections**: Peak active connections
- **Resource Usage**: Memory and connection patterns

## Performance Recommendations

The script provides automatic recommendations based on results:

### Good Performance Indicators
- Success rate > 95%
- Average duration < 5 seconds
- Requests per second > 1
- No connection timeouts

### Warning Signs
- High failure rate (>5%)
- Long average response times (>10 seconds)
- Low throughput (<0.5 req/s)
- Memory errors or connection drops

## Browserless Optimization Tips

### Container Configuration
```bash
# Example browserless Docker run with optimizations
docker run -p 3001:3000 \
  -e MAX_CONCURRENT_SESSIONS=20 \
  -e MAX_QUEUE_LENGTH=100 \
  -e CONNECTION_TIMEOUT=60000 \
  -e MAX_MEMORY_PERCENT=80 \
  browserless/chrome:latest
```

### Key Settings to Monitor
- `MAX_CONCURRENT_SESSIONS`: Maximum simultaneous browser instances
- `MAX_QUEUE_LENGTH`: How many requests can wait in queue
- `CONNECTION_TIMEOUT`: Time before killing idle connections
- `MAX_MEMORY_PERCENT`: Memory usage limit

### Monitoring During Tests
```bash
# Monitor browserless container
docker stats <browserless-container-id>

# Monitor system resources
htop
iostat -x 1
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure browserless is running on port 3001
   - Check firewall settings
   - Verify Docker container is healthy

2. **High Failure Rate**
   - Reduce concurrent clients
   - Increase delays between requests
   - Check browserless logs for errors

3. **Slow Performance**
   - Monitor system resources (CPU, memory, disk)
   - Check network latency to browserless
   - Consider increasing browserless resources

4. **Memory Issues**
   - Reduce `MAX_CONCURRENT_SESSIONS`
   - Increase `CONNECTION_TIMEOUT`
   - Monitor container memory usage

### Debug Mode

Add debug logging by modifying the script:

```typescript
// Add to processRequest method
console.log(`🔍 Client ${clientId}: Connecting to ${this.config.browserlessUrl}`);
console.log(`🔍 Client ${clientId}: Navigating to ${targetUrl}`);
console.log(`🔍 Client ${clientId}: Generating PDF...`);
```

## Example Output

```
🚀 Starting Browserless Stress Test
============================================================
📊 Configuration:
   Browserless URL: http://localhost:3001
   Webapp URL: http://localhost:3000
   Test Mode: medium
   Concurrent Clients: 5
   Total Requests: 50
   Delay Between Requests: 200ms
   Timeout: 30000ms
   PDF Format: A4
============================================================

✅ Client 1: PDF generated (24576 bytes) in 2341.23ms
✅ Client 2: PDF generated (24576 bytes) in 2156.78ms
...

============================================================
📈 STRESS TEST RESULTS
============================================================
📊 Summary:
   Total Duration: 12543.67ms
   Total Requests: 50
   Successful: 48
   Failed: 2
   Success Rate: 96.00%

⏱️  Performance Metrics (successful requests):
   Average Duration: 2341.23ms
   Median Duration: 2156.78ms
   Min Duration: 1892.45ms
   Max Duration: 3456.12ms
   Requests per Second: 3.83

📄 PDF Size Statistics:
   Average Size: 24.00KB
   Min Size: 24.00KB
   Max Size: 24.00KB

🔗 Concurrent Connections:
   Max Concurrent: 5
   Peak Active: 5

💡 Recommendations:
   ✅ Good throughput: 3.83 requests per second
```

## Next Steps

1. **Baseline Testing**: Run light/medium tests to establish baseline performance
2. **Load Testing**: Gradually increase load to find breaking points
3. **Optimization**: Adjust browserless settings based on results
4. **Monitoring**: Set up monitoring for production browserless instances
5. **Automation**: Integrate tests into CI/CD pipeline for regression testing 