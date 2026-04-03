import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' allows loading all env vars, regardless of "VITE_" prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 250,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
            validation: ['zod'],
          },
        },
      },
    },
    // ── Dev-server dependency pre-bundling ──────────────────────────────
    // Pre-bundle heavy dependencies at dev-server start so page navigation
    // doesn't trigger on-demand transformation of large module graphs.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'framer-motion',
        'lucide-react',
        'zod',
        'sonner',
        'next-themes',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        '@radix-ui/react-dialog',
        '@radix-ui/react-select',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-separator',
        '@radix-ui/react-label',
        '@radix-ui/react-slot',
      ],
    },
    server: {
      host: true,
      allowedHosts: ['.lvh.me'],
      // ── Module warmup ────────────────────────────────────────────────
      // Transform shared modules at server start rather than on first request.
      warmup: {
        clientFiles: [
          './src/App.tsx',
          './src/main.tsx',
          './src/components/ui/AuthLayout.tsx',
          './src/context/CollegeTenantContext.tsx',
          './src/context/CollegeAuthContext.tsx',
          './src/context/SysAdminAuthContext.tsx',
          './src/context/students/StudentAuthContext.tsx',
          './src/lib/api.ts',
          './src/lib/queryClient.ts',
          './src/lib/subdomain.ts',
          './src/components/routes/SmartRedirect.tsx',
          './src/components/routes/ProtectedRoute.tsx',
        ],
      },
      proxy: {
        '/api': {
          // Now using the variable from .env
          target: env.PCRM_BACKEND_URL, 
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})