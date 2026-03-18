# Backend Tests

This directory contains unit tests for the HMS backend.

## Test Structure

- `setup.ts` - Test setup and configuration
- `routes/` - API route tests
- `controllers/` - Controller tests
- `middleware/` - Middleware tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

Target coverage: 60-70% for critical paths

Current test files:
- `routes/auth.test.ts` - Authentication route tests (login, refresh)
- `controllers/patientController.test.ts` - Patient CRUD operations
- `middleware/auth.test.ts` - JWT authentication middleware

## Notes

- Tests use mocked Prisma client to avoid database dependencies
- Environment variables are set in `setup.ts`
- All tests run in isolated environment





