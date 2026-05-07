import { supabase } from '@/services/supabase/client';
import type {
  IAuthService,
  LoginPayload,
  RegisterPayload,
} from '@/services/interfaces/IAuthService';
import type { AuthSession, NotificationSettings, User } from '@/types/user';
import type { PlanId } from '@/constants/plans';

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  notification_settings: NotificationSettings;
  plan_id: PlanId;
  created_at: string;
  updated_at: string;
};

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<ProfileRow>();
  if (error) return null;
  return data;
}

function buildUser(authUser: { id: string; email?: string }, profile: ProfileRow | null): User {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    notificationSettings: profile?.notification_settings ?? {
      globalEnabled: true,
      sound: true,
      vibration: true,
    },
    planId: profile?.plan_id ?? 'free',
    createdAt: profile?.created_at ?? new Date().toISOString(),
    updatedAt: profile?.updated_at ?? new Date().toISOString(),
  };
}

function buildSession(token: string, user: User): AuthSession {
  return {
    token,
    user,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export const supabaseAuthService: IAuthService = {
  async login({ email, password }: LoginPayload): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session || !data.user) throw new Error('login failed');

    const profile = await fetchProfile(data.user.id);
    const user = buildUser(data.user, profile);
    return buildSession(data.session.access_token, user);
  },

  async register({ email, password, displayName }: RegisterPayload): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session || !data.user) {
      throw new Error('Check your email to confirm your account.');
    }

    const now = new Date().toISOString();
    const defaultSettings: NotificationSettings = { globalEnabled: true, sound: true, vibration: true };
    await supabase.from('profiles').insert({
      id: data.user.id,
      display_name: displayName,
      avatar_url: null,
      notification_settings: defaultSettings,
      plan_id: 'free',
      created_at: now,
      updated_at: now,
    });

    const profile = await fetchProfile(data.user.id);
    const user = buildUser(data.user, profile);
    return buildSession(data.session.access_token, user);
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    const { user: authUser, access_token } = data.session;

    const profile = await fetchProfile(authUser.id);
    const user = buildUser(authUser, profile);
    return buildSession(access_token, user);
  },

  async updateProfile(
    patch: Partial<Pick<User, 'displayName' | 'avatarUrl'>>
  ): Promise<User> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('Not authenticated');

    const userId = sessionData.session.user.id;
    const updates: Partial<ProfileRow> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (patch.displayName !== undefined) updates.display_name = patch.displayName;
    if (patch.avatarUrl !== undefined) updates.avatar_url = patch.avatarUrl;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw new Error(error.message);

    const profile = await fetchProfile(userId);
    return buildUser(sessionData.session.user, profile);
  },
};
