import type { AuthSession, User } from '@/types/user';

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  email: string;
  password: string;
  displayName: string;
};

export interface IAuthService {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<AuthSession>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  updateProfile(patch: Partial<Pick<User, 'displayName' | 'avatarUrl'>>): Promise<User>;
}
