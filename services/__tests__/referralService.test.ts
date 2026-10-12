import { describe, it, expect, vi, beforeEach } from 'vitest';
import { referralService, REFERRAL_CONFIG } from '../referralService';
import { authService } from '../authService';
import { supabase } from '../supabaseClient';
import { monitoringService } from '../monitoringService';

vi.mock('../supabaseClient', () => ({
  supabase: null
}));

vi.mock('../authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getTenantId: vi.fn().mockReturnValue('tenant1'),
  }
}));

vi.mock('../monitoringService', () => ({
  monitoringService: {
    log: vi.fn()
  }
}));

describe('Referral System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('records attribution in localStorage', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
    referralService.recordAttribution('TESTCODE');
    expect(referralService.getAttributionCode()).toBe('TESTCODE');
  });

  it('does not record attribution if user is already logged in', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ user: { id: '1' }, org: { id: 'org1' } } as any);
    referralService.recordAttribution('TESTCODE');
    expect(referralService.getAttributionCode()).toBeNull();
  });

  it('generates and returns a mock profile if supabase is not active', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ user: { id: 'user1' }, org: { id: 'org1' } } as any);

    const profile = await referralService.getReferralProfile();
    expect(profile).toBeDefined();
    expect(profile?.userId).toBe('user1');
    expect(profile?.referralCode).toBeDefined();
    expect(profile?.referralCode.length).toBe(8); // 4 bytes in hex = 8 chars
  });
});
