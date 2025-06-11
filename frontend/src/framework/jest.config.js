/**
 * jest.config.js
 * Konfiguration für Jest-Tests im OWL-Framework
 */

module.exports = {
  // Testumgebung
  testEnvironment: 'jsdom',
  
  // Verzeichnisse, die von den Tests abgedeckt werden
  collectCoverageFrom: [
    'core/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Test-Dateien finden
  testMatch: ['**/tests/**/*.test.js'],
  
  // Verzeichnisse ignorieren
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Transformationen für Module
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Modulmapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Setup-Dateien
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Ausführliche Berichte
  verbose: true,
  
  // Code-Abdeckungsbericht
  coverageDirectory: 'coverage',
  
  // Watch-Plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}; 