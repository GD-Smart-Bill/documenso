# Browserless Chrome Setup

This document explains the Browserless Chrome service configuration for Documenso.

## Overview

The Browserless Chrome service provides a headless Chrome instance with CDP (Chrome DevTools Protocol) support, which is used by Documenso for PDF generation from HTML templates.

## Service Configuration

### Production (`docker/production/compose.yml`)

The production setup includes:

- **Browserless Chrome service** running on port 3001 (external) / 3000 (internal)
- **Health checks** to ensure the service is ready before starting Documenso
- **Automatic dependency management** - Documenso waits for Browserless to be healthy
- **Environment variable** `NEXT_PRIVATE_BROWSERLESS_URL=http://browserless:3000` automatically set

### Development (`docker/development/compose.yml`)

The development setup includes the same Browserless service for local testing.

## Key Features

### Browserless Configuration

- **CDP Enabled**: Full Chrome DevTools Protocol support
- **Concurrent Sessions**: Up to 10 simultaneous browser sessions
- **Queue Management**: Handles up to 20 queued requests
- **Keep Alive**: Maintains browser instances for faster response times
- **Preboot**: Chrome starts immediately when the container starts
- **Debugger Support**: Enables debugging capabilities

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_CONCURRENT_SESSIONS` | 10 | Maximum number of concurrent browser sessions |
| `MAX_QUEUE_LENGTH` | 20 | Maximum number of queued requests |
| `CONNECTION_TIMEOUT` | 60000 | Connection timeout in milliseconds |
| `ENABLE_CDP` | true | Enable Chrome DevTools Protocol |
| `KEEP_ALIVE` | true | Keep browser instances alive |
| `PREBOOT_CHROME` | true | Start Chrome immediately |

## Usage

### Starting the Services

```bash
# Production
docker-compose -f docker/production/compose.yml up -d

# Development
docker-compose -f docker/development/compose.yml up -d
```

### Accessing Browserless

- **Internal (from Documenso)**: `http://browserless:3000`
- **External (for debugging)**: `http://localhost:3001`

### Health Check

The service includes a health check endpoint:
```bash
curl http://localhost:3001/health
```

## Integration with Documenso

The `getCertificatePdf` function in `packages/lib/server-only/htmltopdf/get-certificate-pdf.ts` automatically uses the Browserless service when `NEXT_PRIVATE_BROWSERLESS_URL` is set.

The connection is established using:
```typescript
browser = await chromium.connectOverCDP(browserlessUrl);
```

## Troubleshooting

### Service Not Starting
- Check if port 3001 is available
- Verify Docker has enough resources allocated
- Check logs: `docker-compose logs browserless`

### Connection Issues
- Ensure the health check passes
- Verify the internal URL is correct (`http://browserless:3000`)
- Check network connectivity between services

### Performance Issues
- Adjust `MAX_CONCURRENT_SESSIONS` based on your server resources
- Monitor memory usage of the browserless container
- Consider increasing `CHROME_REFRESH_TIME` for longer-running instances

## Security Considerations

- The Browserless service is only accessible internally within the Docker network
- External access (port 3001) should be restricted in production environments
- Consider using Docker secrets for sensitive configuration in production 