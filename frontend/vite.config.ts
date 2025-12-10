import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
  // CDN Base URL configuration
  // Set VITE_CDN_URL in .env for CDN deployment
  // Examples:
  //   AWS CloudFront: https://d1234567890.cloudfront.net
  //   Azure CDN: https://lanfinitas-prod.azureedge.net
  //   Cloudflare: https://cdn.lanfinitas.ai
  base: env.VITE_CDN_URL || '/',
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel configuration for React
      babel: {
        plugins: [],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Service worker configuration
      srcDir: 'src',
      filename: 'service-worker.ts',
      strategies: 'injectManifest',

      // Manifest configuration
      manifest: {
        name: 'Lanfinitas AI - Fashion Design Platform',
        short_name: 'Lanfinitas AI',
        description: 'AI-powered 3D fashion design and pattern generation platform',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Workbox configuration
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      // Development options
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),

    // Bundle analyzer (only in analyze mode)
    // Run: npm run build -- --mode analyze
    mode === 'analyze' &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    // API proxy configuration
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'static',  // Organize assets in 'static' folder for CDN
    sourcemap: env.VITE_SOURCEMAP === 'true',  // Enable sourcemaps only if needed

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Target modern browsers for better optimization
    target: 'es2020',

    // Preload modules
    modulePreload: {
      polyfill: true,
    },

    // Asset inline limit (smaller assets will be inlined as base64)
    assetsInlineLimit: 4096,  // 4kb
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            // Three.js and 3D libraries
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor'
            }
            // Fabric.js for canvas
            if (id.includes('fabric')) {
              return 'fabric-vendor'
            }
            // Charts and data viz
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor'
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor'
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('radix-ui')) {
              return 'ui-vendor'
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'form-vendor'
            }
            // Utilities
            if (id.includes('axios') || id.includes('date-fns') || id.includes('zustand')) {
              return 'utils-vendor'
            }
            // Other node_modules
            return 'vendor'
          }
        },
        // Asset file naming with proper directory structure for CDN caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          let extType = info?.[info.length - 1]

          // Images: long cache (30 days)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType ?? '')) {
            return 'static/images/[name]-[hash][extname]'
          }

          // Fonts: long cache (1 year)
          if (/woff|woff2|eot|ttf|otf/i.test(extType ?? '')) {
            return 'static/fonts/[name]-[hash][extname]'
          }

          // Media files
          if (/mp4|webm|ogg|mp3|wav|flac|aac/i.test(extType ?? '')) {
            return 'static/media/[name]-[hash][extname]'
          }

          // CSS files
          if (/css/i.test(extType ?? '')) {
            return 'static/css/[name]-[hash][extname]'
          }

          // Other assets
          return 'static/[name]-[hash][extname]'
        },

        // JavaScript chunks with versioned hashing for cache busting
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
      },
    },
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Improve build performance
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
  },

  // Preview server configuration
  preview: {
    port: 3001,
    host: true,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'zustand',
      'lucide-react',
      'fabric',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'recharts',
      'react-hook-form',
      'zod',
      'date-fns',
      'react-dropzone',
    ],
    exclude: ['workbox-window'],
  },

  // Performance settings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Drop console in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  // Experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      // Serve assets from CDN in production
      if (mode === 'production' && env.VITE_CDN_URL) {
        return env.VITE_CDN_URL + '/' + filename
      }
      return filename
    },
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
}
})
