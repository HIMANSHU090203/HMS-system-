module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/api'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'api/**/*.ts',
    '!api/**/*.d.ts',
    '!api/index.ts',
    '!api/**/*.backup.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/api/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/api/__tests__/setup.ts'],
  testTimeout: 10000,
};





