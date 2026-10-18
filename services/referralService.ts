import { supabase } from './supabaseClient';
import { authService } from './authService';
import { monitoringService } from './monitoringService';

const REFERRAL_CODE_KEY = 'aura_referral_code';

export interface ReferralConfig {
  limit: number;
  inviterRewardCredits: number;
  inviteeBonusCredits: number;
  enabled: boolean;
  qualificationEvent: 'email_verified' | 'first_login' | 'account_created';
}

export const REFERRAL_CONFIG: ReferralConfig = {
  limit: 5,
  inviterRewardCredits: 100, // E.g., 100 extra AI chat credits
  inviteeBonusCredits: 50,
  enabled: true,
  qualificationEvent: 'account_created', // We will qualify them on successful account creation/signup for now
};

export interface ReferralProfile {
  id: string;
  userId: string;
  organizationId: string;
  referralCode: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'rejected';
  createdAt: string;
}

export interface ReferralSummary {
  referralCode: string;
  referralUrl: string;
  qualifiedCount: number;
  pendingCount: number;
  remainingSlots: number;
  creditsEarned: number;
}

const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(array[i] % chars.length);
  }
  return code;
};

// Generate cryptographically secure token
const generateSecureCode = (): string => {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
};

export const referralService = {
  // Generates or retrieves the referral code for the current user
  getReferralProfile: async (): Promise<ReferralProfile | null> => {
    const userOrg = authService.getCurrentUser();
    if (!userOrg) return null;

    if (supabase) {
      // Check for existing profile
      const { data, error } = await supabase
        .from('referral_profiles')
        .select('*')
        .eq('user_id', userOrg.user.id)
        .single();

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          organizationId: data.organization_id,
          referralCode: data.referral_code
        };
      }

      // Create new profile
      // Use crypto for secure random generation as per security directives
      const code = generateSecureCode();
      const { data: newProfile, error: insertError } = await supabase
        .from('referral_profiles')
        .insert({
          user_id: userOrg.user.id,
          organization_id: userOrg.org.id,
          referral_code: code
        })
        .select()
        .single();

      if (insertError) {
        monitoringService.log('error', 'REFERRAL', 'Failed to create referral profile', { error: insertError });
        return null;
      }

      return {
        id: newProfile.id,
        userId: newProfile.user_id,
        organizationId: newProfile.organization_id,
        referralCode: newProfile.referral_code
      };
    } else {
      // Local mock
      const mockProfilesStr = localStorage.getItem('aura_mock_referral_profiles');
      const mockProfiles = mockProfilesStr ? JSON.parse(mockProfilesStr) : {};

      if (mockProfiles[userOrg.user.id]) {
        return mockProfiles[userOrg.user.id];
      }

      const newProfile: ReferralProfile = {
        id: `rp_${Date.now()}`,
        userId: userOrg.user.id,
        organizationId: userOrg.org.id,
        referralCode: generateSecureCode()
      };

      mockProfiles[userOrg.user.id] = newProfile;
      localStorage.setItem('aura_mock_referral_profiles', JSON.stringify(mockProfiles));

      return newProfile;
    }
  },

  // Record attribution when someone clicks a referral link
  recordAttribution: (code: string) => {
    // Only record if they are not already logged in
    if (!authService.getCurrentUser()) {
      // Store in session storage or local storage depending on persistence requirements
      // We'll use localStorage to survive a redirect/reload during signup
      localStorage.setItem(REFERRAL_CODE_KEY, code);
      monitoringService.log('info', 'REFERRAL', `Referral attribution recorded`, { code });
    }
  },

  getAttributionCode: (): string | null => {
    return localStorage.getItem(REFERRAL_CODE_KEY);
  },

  clearAttribution: () => {
    localStorage.removeItem(REFERRAL_CODE_KEY);
  },

  // Process a new user signup with a referral code
  processReferralSignup: async (newUserUserId: string, newUserOrgId: string) => {
    if (!REFERRAL_CONFIG.enabled) return;

    const code = referralService.getAttributionCode();
    if (!code) return;

    try {
      if (supabase) {
        // Validate code and find referrer
        const { data: profileData } = await supabase
          .from('referral_profiles')
          .select('user_id, organization_id')
          .eq('referral_code', code)
          .single();

        if (!profileData) {
          monitoringService.log('warn', 'REFERRAL', 'Invalid referral code used during signup', { code });
          referralService.clearAttribution();
          return;
        }

        const referrerUserId = profileData.user_id;

        // Prevent self-referral
        if (referrerUserId === newUserUserId) {
           referralService.clearAttribution();
           return;
        }

        // Create referral record
        const { data: referralRecord, error: referralError } = await supabase
          .from('referrals')
          .insert({
            referrer_user_id: referrerUserId,
            referred_user_id: newUserUserId,
            referral_code: code,
            status: 'pending'
          })
          .select()
          .single();

        if (referralError) {
          monitoringService.log('error', 'REFERRAL', 'Failed to insert referral record', { error: referralError });
          return;
        }

        referralService.clearAttribution();

        // Immediately qualify if event is account_created
        if (REFERRAL_CONFIG.qualificationEvent === 'account_created') {
          await referralService.processQualificationEvent(referralRecord.id);
        }

      } else {
        // Mock implementation
        const mockProfilesStr = localStorage.getItem('aura_mock_referral_profiles');
        const mockProfiles = mockProfilesStr ? JSON.parse(mockProfilesStr) : {};

        let referrerUserId = null;
        for (const userId in mockProfiles) {
          if (mockProfiles[userId].referralCode === code) {
            referrerUserId = userId;
            break;
          }
        }

        if (referrerUserId && referrerUserId !== newUserUserId) {
          const mockReferralsStr = localStorage.getItem('aura_mock_referrals');
          const mockReferrals = mockReferralsStr ? JSON.parse(mockReferralsStr) : [];

          const newReferral = {
            id: `ref_${Date.now()}`,
            referrerUserId,
            referredUserId: newUserUserId,
            referralCode: code,
            status: 'pending',
            createdAt: new Date().toISOString()
          };

          mockReferrals.push(newReferral);
          localStorage.setItem('aura_mock_referrals', JSON.stringify(mockReferrals));

          if (REFERRAL_CONFIG.qualificationEvent === 'account_created') {
            await referralService.processQualificationEventMock(newReferral.id, referrerUserId, newUserOrgId);
          }
        }
        referralService.clearAttribution();
      }
    } catch (e) {
      monitoringService.log('error', 'REFERRAL', 'Error processing referral signup', { error: e });
    }
  },

  processQualificationEvent: async (referralId: string) => {
    if (!supabase) return;

    try {
      // 1. Get referral details
      const { data: referral, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single();

      if (refError || !referral || referral.status !== 'pending') return;

      // 2. Check if referrer has reached limit
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_user_id', referral.referrer_user_id)
        .in('status', ['qualified', 'rewarded']);

      if ((count || 0) >= REFERRAL_CONFIG.limit) {
        // Mark as rejected due to limit
        await supabase
          .from('referrals')
          .update({ status: 'rejected', rejection_reason: 'Referrer reached reward limit' })
          .eq('id', referralId);
        return;
      }

      // 3. Mark as qualified
      await supabase
        .from('referrals')
        .update({
          status: 'qualified',
          qualification_event: REFERRAL_CONFIG.qualificationEvent,
          qualified_at: new Date().toISOString()
        })
        .eq('id', referralId);

      // 4. Issue Reward
      await referralService.issueReward(referralId, referral.referrer_user_id, referral.referred_user_id);

    } catch (e) {
      monitoringService.log('error', 'REFERRAL', 'Error qualifying referral', { error: e });
    }
  },

  issueReward: async (referralId: string, referrerUserId: string, referredUserId: string) => {
     if (!supabase) return;

     try {
       // Get referrer's org
       const { data: referrer } = await supabase.from('users').select('organization_id').eq('id', referrerUserId).single();
       const { data: referred } = await supabase.from('users').select('organization_id').eq('id', referredUserId).single();

       if (referrer) {
         // Issue to Inviter
         const idempotencyKeyInviter = `reward_inviter_${referralId}`;
         const { error: err1 } = await supabase.from('ai_credit_ledger').insert({
           organization_id: referrer.organization_id,
           transaction_type: 'referral_reward',
           referral_id: referralId,
           recipient_user_id: referrerUserId,
           credits_awarded: REFERRAL_CONFIG.inviterRewardCredits,
           idempotency_key: idempotencyKeyInviter
         });

         if (err1 && !err1.message.includes('duplicate key')) {
             throw err1;
         }
       }

       if (referred && REFERRAL_CONFIG.inviteeBonusCredits > 0) {
         // Issue to Invitee
         const idempotencyKeyInvitee = `reward_invitee_${referralId}`;
         const { error: err2 } = await supabase.from('ai_credit_ledger').insert({
           organization_id: referred.organization_id,
           transaction_type: 'invitee_bonus',
           referral_id: referralId,
           recipient_user_id: referredUserId,
           credits_awarded: REFERRAL_CONFIG.inviteeBonusCredits,
           idempotency_key: idempotencyKeyInvitee
         });

         if (err2 && !err2.message.includes('duplicate key')) {
             throw err2;
         }
       }

       // Mark as rewarded
       await supabase.from('referrals').update({
           status: 'rewarded',
           rewarded_at: new Date().toISOString()
       }).eq('id', referralId);

     } catch (e) {
        monitoringService.log('error', 'REFERRAL', 'Error issuing reward', { error: e });
     }
  },

  processQualificationEventMock: async (referralId: string, referrerUserId: string, referredOrgId: string) => {
    // Local storage mock
    const mockReferralsStr = localStorage.getItem('aura_mock_referrals');
    const mockReferrals = mockReferralsStr ? JSON.parse(mockReferralsStr) : [];

    const referralIndex = mockReferrals.findIndex((r: any) => r.id === referralId);
    if (referralIndex >= 0) {
        const qualifiedCount = mockReferrals.filter((r: any) => r.referrerUserId === referrerUserId && ['qualified', 'rewarded'].includes(r.status)).length;
        if (qualifiedCount < REFERRAL_CONFIG.limit) {
            mockReferrals[referralIndex].status = 'rewarded';
            mockReferrals[referralIndex].qualifiedAt = new Date().toISOString();
            mockReferrals[referralIndex].rewardedAt = new Date().toISOString();

            const mockLedgerStr = localStorage.getItem('aura_mock_ai_ledger');
            const mockLedger = mockLedgerStr ? JSON.parse(mockLedgerStr) : [];
            mockLedger.push({
                type: 'referral_reward',
                userId: referrerUserId,
                credits: REFERRAL_CONFIG.inviterRewardCredits
            });
            localStorage.setItem('aura_mock_ai_ledger', JSON.stringify(mockLedger));
        } else {
             mockReferrals[referralIndex].status = 'rejected';
        }
        localStorage.setItem('aura_mock_referrals', JSON.stringify(mockReferrals));
    }
  },

  getReferralSummary: async (): Promise<ReferralSummary> => {
    const profile = await referralService.getReferralProfile();
    const userOrg = authService.getCurrentUser();

    if (!profile || !userOrg) {
        return { referralCode: '', referralUrl: '', qualifiedCount: 0, pendingCount: 0, remainingSlots: 0, creditsEarned: 0 };
    }

    const domain = window.location.origin;
    const referralUrl = `${domain}?ref=${profile.referralCode}`;

    if (supabase) {
        const { data: referrals } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_user_id', userOrg.user.id);

        const refs = referrals || [];
        const qualifiedCount = refs.filter(r => ['qualified', 'rewarded'].includes(r.status)).length;
        const pendingCount = refs.filter(r => r.status === 'pending').length;

        const { data: ledger } = await supabase
            .from('ai_credit_ledger')
            .select('credits_awarded')
            .eq('transaction_type', 'referral_reward')
            .eq('recipient_user_id', userOrg.user.id);

        const creditsEarned = (ledger || []).reduce((sum, entry) => sum + entry.credits_awarded, 0);

        return {
            referralCode: profile.referralCode,
            referralUrl,
            qualifiedCount,
            pendingCount,
            remainingSlots: Math.max(0, REFERRAL_CONFIG.limit - qualifiedCount),
            creditsEarned
        };

    } else {
        const mockReferralsStr = localStorage.getItem('aura_mock_referrals');
        const mockReferrals = mockReferralsStr ? JSON.parse(mockReferralsStr) : [];
        const userRefs = mockReferrals.filter((r: any) => r.referrerUserId === userOrg.user.id);

        const qualifiedCount = userRefs.filter((r: any) => ['qualified', 'rewarded'].includes(r.status)).length;
        const pendingCount = userRefs.filter((r: any) => r.status === 'pending').length;

        const mockLedgerStr = localStorage.getItem('aura_mock_ai_ledger');
        const mockLedger = mockLedgerStr ? JSON.parse(mockLedgerStr) : [];
        const userLedger = mockLedger.filter((l: any) => l.userId === userOrg.user.id && l.type === 'referral_reward');
        const creditsEarned = userLedger.reduce((sum: number, l: any) => sum + l.credits, 0);

        return {
            referralCode: profile.referralCode,
            referralUrl,
            qualifiedCount,
            pendingCount,
            remainingSlots: Math.max(0, REFERRAL_CONFIG.limit - qualifiedCount),
            creditsEarned
        };
    }
  },

  // This will be called by usageService to add bonus limits
  getBonusAiCredits: async (orgId: string): Promise<number> => {
     if (supabase) {
         const { data: ledger } = await supabase
            .from('ai_credit_ledger')
            .select('credits_awarded')
            .eq('organization_id', orgId);

         return (ledger || []).reduce((sum, entry) => sum + entry.credits_awarded, 0);
     } else {
         const userOrg = authService.getCurrentUser();
         if (!userOrg) return 0;
         const mockLedgerStr = localStorage.getItem('aura_mock_ai_ledger');
         const mockLedger = mockLedgerStr ? JSON.parse(mockLedgerStr) : [];
         // Simple mock logic: get credits for this user since org mapping might be complex in mock
         // ⚡ Bolt Optimization: Single-pass .reduce() replaces chained .filter().reduce()
         return mockLedger.reduce((s: number, l: any) => l.userId === userOrg.user.id ? s + l.credits : s, 0);
     }
  }
};
