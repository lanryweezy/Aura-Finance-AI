import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Determine API URL based on environment
    const getApiUrl = () => {
        if (mode === 'production') {
            return env.VITE_API_URL || 'https://aura-finance-backend.onrender.com';
        }
        return 'http://localhost:8000';
    };

    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_API_URL': JSON.stringify(getApiUrl())
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        host: true,
        port: parseInt(env.PORT) || 5173,
        proxy: {
          '/api': {
            target: getApiUrl(),
            changeOrigin: true,
            secure: mode === 'production',
          }
        }
      },
      preview: {
        host: true,
        port: parseInt(env.PORT) || 3000,
        proxy: {
          '/api': {
            target: getApiUrl(),
            changeOrigin: true,
            secure: mode === 'production',
          }
        },
        allowedHosts: [
          '.onrender.com'
        ]
      }
    };
});
