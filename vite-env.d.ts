/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_PAYSTACK_KEY: string;
  readonly VITE_FLW_KEY: string;
  readonly VITE_NRS_API_KEY: string;
  readonly VITE_NRS_SERVICE_ID: string;
  readonly VITE_NRS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
