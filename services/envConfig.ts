const REQUIRED_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const OPTIONAL_KEYS = [
  'VITE_GEMINI_API_KEY',
  'VITE_PAYSTACK_KEY',
  'VITE_FLW_KEY',
  'VITE_NRS_API_KEY',
  'VITE_NRS_SERVICE_ID',
  'VITE_NRS_API_URL',
  'VITE_MONO_SECRET',
  'VITE_SENTRY_DSN',
] as const;

interface EnvStatus {
  ready: boolean;
  missing: string[];
  available: string[];
  warnings: string[];
}

export function validateEnv(): EnvStatus {
  const missing: string[] = [];
  const available: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_KEYS) {
    const val = import.meta.env[key];
    if (!val || val === '' || val.includes('your-')) {
      missing.push(key);
    } else {
      available.push(key);
    }
  }

  for (const key of OPTIONAL_KEYS) {
    const val = import.meta.env[key];
    if (!val || val === '' || val.includes('your-')) {
      warnings.push(`${key} not set — some features will be limited`);
    } else {
      available.push(key);
    }
  }

  if (missing.length > 0) {
    warnings.push(`Missing required keys: ${missing.join(', ')}. Running in demo mode.`);
  }

  return {
    ready: missing.length === 0,
    missing,
    available,
    warnings,
  };
}

export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    configured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      && !import.meta.env.VITE_SUPABASE_URL.includes('your-project')),
  };
}

export function getPaymentConfig() {
  return {
    paystackKey: import.meta.env.VITE_PAYSTACK_KEY || '',
    flutterwaveKey: import.meta.env.VITE_FLW_KEY || '',
    paystackConfigured: !!(import.meta.env.VITE_PAYSTACK_KEY && !import.meta.env.VITE_PAYSTACK_KEY.includes('your-')),
    flutterwaveConfigured: !!(import.meta.env.VITE_FLW_KEY && !import.meta.env.VITE_FLW_KEY.includes('your-')),
  };
}

export function getAIConfig() {
  return {
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    configured: !!(import.meta.env.VITE_GEMINI_API_KEY && !import.meta.env.VITE_GEMINI_API_KEY.includes('your-')),
  };
}
