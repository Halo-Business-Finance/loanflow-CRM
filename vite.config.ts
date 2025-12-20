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
        manualChunks: {
          // Keep React together to avoid hooks issues
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split heavy chart library
          'vendor-charts': ['recharts'],
          // UI components
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
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
