export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  globalTeardown: './test/testTeardownGlobals.ts',
  setupFilesAfterEnv: ['./test/setup/jest-setup.ts'],
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
    '^@tests/(.*)$': '<rootDir>/test/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};
