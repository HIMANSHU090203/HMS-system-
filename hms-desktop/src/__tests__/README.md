# Frontend Tests

This directory contains unit tests for the HMS frontend.

## Test Structure

- `setup.ts` - Test setup and configuration
- `utils/` - Utility function tests

## Running Tests

```bash
# Run all tests
npm run test:frontend

# Run tests in watch mode
npm run test:frontend:watch

# Run tests with coverage
npm run test:frontend:coverage
```

## Test Coverage

Target coverage: 60-70% for critical paths

Current test files:
- `utils/currencyAndTimezone.test.ts` - Currency formatting and symbol utilities
- `utils/rolePermissions.test.ts` - Role-based access control utilities

## Notes

- Tests use Vitest with jsdom environment for React component testing
- All tests run in isolated environment
- Uses @testing-library/react for component testing utilities





