import type { IAuthService } from '@/services/interfaces/IAuthService';

// TODO: Plan 5 — wire to @supabase/supabase-js
export const supabaseAuthService: IAuthService = {
  async login() {
    throw new Error('supabaseAuthService.login not yet implemented');
  },
  async register() {
    throw new Error('supabaseAuthService.register not yet implemented');
  },
  async logout() {
    throw new Error('supabaseAuthService.logout not yet implemented');
  },
  async requestPasswordReset() {
    throw new Error(
      'supabaseAuthService.requestPasswordReset not yet implemented'
    );
  },
  async getCurrentSession() {
    throw new Error(
      'supabaseAuthService.getCurrentSession not yet implemented'
    );
  },
  async updateProfile() {
    throw new Error('supabaseAuthService.updateProfile not yet implemented');
  },
};
