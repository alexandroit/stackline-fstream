import js from '@eslint/js'

const nodeGlobals = {
  Buffer: 'readonly',
  URL: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  exports: 'writable',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setTimeout: 'readonly'
}

export default [
  {
    ignores: [
      'artifact/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'release-candidate/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrors: 'none'
      }]
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrors: 'none'
      }]
    }
  },
  {
    files: ['test/upstream-original/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-useless-escape': 'off'
    }
  },
  {
    files: ['lib/dir-writer.js'],
    rules: {
      'no-prototype-builtins': 'off'
    }
  },
  {
    files: ['lib/reader.js'],
    rules: {
      'no-fallthrough': 'off'
    }
  },
  {
    files: ['lib/traversal.js'],
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['lib/writer.js'],
    rules: {
      'no-useless-assignment': 'off'
    }
  },
  {
    files: ['test/fixtures/differential-runner.js'],
    rules: {
      'no-unused-vars': 'off'
    }
  }
]
