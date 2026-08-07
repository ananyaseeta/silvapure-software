import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  // Find tests anywhere under src, including inside __tests__ folders
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          // Relax some strict options that would make test code painful
          strictNullChecks: true,
          strict: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          noUncheckedIndexedAccess: false,
          exactOptionalPropertyTypes: false,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  // Reset mocks between tests automatically
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Coverage
  collectCoverageFrom: [
    'src/modules/auth/**/*.ts',
    '!src/modules/auth/**/__tests__/**',
    '!src/modules/auth/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Map module aliases if ever used
  moduleNameMapper: {},
  // Prevent test worker processes from spawning sub-processes
  maxWorkers: '50%',
};

export default config;
