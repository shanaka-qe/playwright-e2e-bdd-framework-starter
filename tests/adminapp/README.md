# Admin App E2E Tests

This directory contains comprehensive end-to-end tests for the QA-AI-SAAS Admin Application.

## Overview

The Admin App is a professional admin application for system monitoring, log management, user administration, and system health oversight. These tests ensure all core functionality works correctly across different environments and configurations.

## Test Structure

```
tests/adminapp/
├── smoke/           # Basic smoke tests for core functionality
├── api/            # API endpoint tests
├── ui/             # UI interaction and feature tests
└── README.md       # This file
```

## Test Categories

### Smoke Tests (`smoke/`)
- **Purpose**: Quick validation of core functionality
- **Scope**: Basic page loading, navigation, health checks
- **Execution Time**: < 2 minutes
- **When to Run**: Before every deployment, in CI/CD pipelines

### API Tests (`api/`)
- **Purpose**: Validate all adminapp API endpoints
- **Scope**: Health, logs, system metrics, authentication
- **Execution Time**: 3-5 minutes
- **When to Run**: During API changes, regression testing

### UI Tests (`ui/`)
- **Purpose**: Full user interface functionality testing
- **Scope**: Log viewing, filtering, real-time streaming, exports
- **Execution Time**: 10-15 minutes
- **When to Run**: During UI changes, comprehensive testing

## Prerequisites

### Environment Setup
1. **Admin App Running**: Ensure adminapp is running on port 3021
2. **Database Access**: PostgreSQL database with proper schema
3. **API Key**: Valid API key for authentication (default: `default-api-key`)

### Dependencies
- Node.js 18+
- Playwright
- Admin app dependencies installed

## Running Tests

### Quick Start
```bash
# Run all adminapp tests
./run-adminapp-tests.sh all

# Run specific test types
./run-adminapp-tests.sh smoke
./run-adminapp-tests.sh api
./run-adminapp-tests.sh ui
```

### Using Playwright Directly
```bash
# Smoke tests
npx playwright test tests/adminapp/smoke/

# API tests
npx playwright test tests/adminapp/api/

# UI tests
npx playwright test tests/adminapp/ui/

# All adminapp tests
npx playwright test tests/adminapp/
```

### Advanced Options
```bash
# Run in headed mode
./run-adminapp-tests.sh smoke --headed

# Wait for adminapp to be ready
./run-adminapp-tests.sh all --wait

# Custom number of workers
./run-adminapp-tests.sh ui --workers=2

# Debug mode
./run-adminapp-tests.sh api --debug
```

## Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_BASE_URL` | Admin app base URL | `http://localhost:3021` |
| `ADMIN_API_KEY` | API key for authentication | `default-api-key` |
| `NODE_ENV` | Test environment | `development` |

### Test Data
Tests use the `AdminTestDataFactory` to generate consistent, realistic test data:
- Log entries with various levels and sources
- Performance test datasets
- Search and filter test data
- Real-time streaming test logs

## Page Objects

The tests use page object models for maintainable, reusable test code:

- **AdminBasePage**: Common adminapp functionality
- **AdminDashboardPage**: Main dashboard interface
- **AdminApiPage**: API endpoint interactions

## Test Coverage

### Core Features Tested
- ✅ Health check endpoint
- ✅ Log viewing and table display
- ✅ Log filtering (level, source, search)
- ✅ Real-time log streaming
- ✅ Log export (JSON/CSV)
- ✅ API authentication
- ✅ Error handling
- ✅ Cross-browser compatibility
- ✅ Responsive design

### Test Scenarios
- **Happy Path**: Normal user workflows
- **Error Cases**: Network failures, invalid data
- **Edge Cases**: Empty data, large datasets
- **Performance**: Load times, concurrent users
- **Security**: Authentication, authorization

## CI/CD Integration

### Jenkins Pipeline
Tests are integrated into the Jenkins pipeline with specific stages:
- Smoke tests run on every commit
- Full test suite runs on PR merges
- Performance tests run nightly

### Test Reporting
- **HTML Reports**: Visual test results with screenshots
- **JSON Reports**: Machine-readable results for CI
- **JUnit Reports**: Integration with test management tools

## Troubleshooting

### Common Issues

1. **Admin App Not Running**
   ```bash
   # Check if adminapp is accessible
   curl http://localhost:3021/api/health
   
   # Start adminapp if needed
   cd src/adminapp && npm run dev
   ```

2. **Database Connection Issues**
   ```bash
   # Verify database connection
   cd src/adminapp && npm run db:generate
   ```

3. **Test Failures**
   ```bash
   # Run with debug info
   ./run-adminapp-tests.sh smoke --debug
   
   # Check test results
   open test-results/html-report/index.html
   ```

### Debug Tips
- Use `--headed` flag to see browser interactions
- Check screenshots in `test-results/screenshots/`
- Review video recordings in `test-results/artifacts/`
- Examine console logs in test output

## Contributing

### Adding New Tests
1. Choose appropriate test category (smoke/api/ui)
2. Use existing page objects when possible
3. Follow naming conventions: `feature-description.spec.ts`
4. Include proper test data setup/cleanup
5. Add comprehensive assertions

### Test Guidelines
- **Keep smoke tests fast**: < 30 seconds per test
- **Use stable selectors**: Prefer `data-testid` attributes
- **Handle async operations**: Use proper waits and timeouts
- **Clean up test data**: Reset state between tests
- **Document complex scenarios**: Add comments for business logic

### Code Review Checklist
- [ ] Tests follow existing patterns
- [ ] Page objects are reused appropriately
- [ ] Error scenarios are covered
- [ ] Test data is properly managed
- [ ] Performance considerations addressed

## Support

For issues or questions:
1. Check existing test documentation
2. Review similar test implementations
3. Consult the main Playwright E2E test framework
4. Reach out to the QA team for complex scenarios

## Future Enhancements

Planned improvements:
- Visual regression testing for dashboard UI
- Load testing for high-volume log scenarios
- Integration tests with external log sources
- Accessibility testing compliance
- Mobile-specific test scenarios