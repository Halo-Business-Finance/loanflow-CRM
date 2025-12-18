import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true,
    cssMinify: true, // Ensure CSS is minified
    cssCodeSplit: true, // Split CSS per component for smaller initial load
    target: 'esnext', // Modern browsers for smaller output
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Isolate recharts to only load when needed (biggest savings ~92KB)
          if (id.includes('recharts') || id.includes('decimal.js-light') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          // Core React - needed immediately
          if (id.includes('react-dom') || (id.includes('node_modules/react/') && !id.includes('react-'))) {
            return 'vendor-react-core';
          }
          // React Router - defer until app routing starts
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          // Radix UI components - only load as needed
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }
          // Supabase - needed for auth but can be chunked
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          // Forms - only load on form pages
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          // Floating UI (used by Radix)
          if (id.includes('@floating-ui')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent multiple React copies (fixes "Cannot read properties of null (reading 'useState')")
    dedupe: ['react', 'react-dom'],
  },
}));
