import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    // Run tests sequentially to avoid DB conflicts
    maxWorkers: 1,
    // Force exit after tests complete (handles open handles from Prisma)
    forceExit: true,
    // Increase timeout for integration/concurrency tests
    testTimeout: 30000,
};

export default config;
