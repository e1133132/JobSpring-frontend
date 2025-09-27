// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(),
    process.env.CI_SKIP_LINT === '1' ? null : eslint({
        exclude: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**']
    })
    ],
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        globals: true,
        css: true,
        coverage: {
            reporter: ['text', 'html'],
            include: ['src/**/*.{js,jsx}'],
            exclude: ['src/**/index.jsx'],
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            }
        }
    }
})
