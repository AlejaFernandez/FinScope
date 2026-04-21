import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '@domain/(.*)': '<rootDir>/src/app/domain/$1',
    '@application/(.*)': '<rootDir>/src/app/application/$1',
    '@infrastructure/(.*)': '<rootDir>/src/app/infrastructure/$1',
    '@shared/(.*)': '<rootDir>/src/app/shared/$1',
    '@features/(.*)': '<rootDir>/src/app/features/$1',
    '@store/(.*)': '<rootDir>/src/app/store/$1',
    '@env/(.*)': '<rootDir>/src/environments/$1',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/domain/**/*.ts',
    'src/app/application/**/*.ts',
    '!src/app/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: { lines: 80 },
  },
};

export default config;
