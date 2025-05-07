import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/index.spec.ts'], // Solo ejecuta este archivo
    coverage: {
      all: true, // Fuerza medir cobertura en todos los archivos incluidos
      reporter: ['text'], // Resultados en consola y para HTML
      include: ['src/**/*.ts'], // Solo mide archivos de src/
      exclude: [
        '**/*.d.ts',       // Excluye definiciones de tipo
        'docs/**',         // Excluye docs
        'dist/**',         // Excluye carpeta de distribución
        'node_modules/**', // Excluye dependencias
        'tests/**',        // Excluye tests en sí
      ],
    },
  },
});
