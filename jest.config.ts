import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',

  globalTeardown: './test/testTeardownGlobals.ts',
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest-setup.ts'],
  clearMocks: true,
  resetModules: true,
  restoreMocks: true,
  testTimeout: 15000,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          types: ['jest', 'node'],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^nanoid$': '<rootDir>/test/__mocks__/nanoid.ts',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@loaders/(.*)$': '<rootDir>/loaders/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // avoid Jest load dist
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};

export default config;
