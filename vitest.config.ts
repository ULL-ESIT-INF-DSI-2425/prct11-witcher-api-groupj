import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/index.spec.ts'], 
    coverage: {
      all: true, 
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'], 
      exclude: [
        '**/*.d.ts',       
        'docs/**',         
        'dist/**',         
        'node_modules/**', 
        'tests/**',       
      ],
    },
  },
});
