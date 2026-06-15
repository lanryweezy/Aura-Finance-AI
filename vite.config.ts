import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co https://checkout.flutterwave.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.paystack.com https://paystack.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://api.mono.co; frame-src 'self' https://checkout.paystack.com https://checkout.flutterwave.com;"
        }
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'gemini-api-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 // 24 hours
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-data-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 12 // 12 hours
                  }
                }
              },
              {
                urlPattern: /\/api\/.*/i,
                handler: 'NetworkOnly',
                method: 'POST',
                options: {
                  backgroundSync: {
                    name: 'api-post-syncQueue',
                    options: {
                      maxRetentionTime: 24 * 60 // Retry for max 24 hours
                    }
                  }
                }
              },
              {
                urlPattern: /\/api\/.*/i,
                handler: 'NetworkOnly',
                method: 'PUT',
                options: {
                  backgroundSync: {
                    name: 'api-put-syncQueue',
                    options: {
                      maxRetentionTime: 24 * 60 // Retry for max 24 hours
                    }
                  }
                }
              }
            ]
          },
          manifest: {
            name: 'Aura Finance AI',
            short_name: 'Aura',
            description: 'Autonomous Accounting and Financial Intelligence',
            theme_color: '#0A0E29',
            background_color: '#0A0E29',
            display: 'standalone',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              if (id.includes('services/geminiService') || id.includes('services/reportService')) {
                return 'ai-services';
              }
            }
          }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
