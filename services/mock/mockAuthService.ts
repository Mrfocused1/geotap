import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import type {
  IAuthService,
  LoginPayload,
  RegisterPayload,
} from '@/services/interfaces/IAuthService';
import { MOCK_USER } from '@/services/mock/mockData';
import type { AuthSession, User } from '@/types/user';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function genToken(): string {
  return `mock-token-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function makeSession(user: User): AuthSession {
  return {
    token: genToken(),
    user,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
}

async function persist(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(
    Config.storage.SESSION_KEY,
    JSON.stringify(session)
  );
}

export const mockAuthService: IAuthService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const user: User = { ...MOCK_USER, email: payload.email };
    const session = makeSession(user);
    await persist(session);
    return session;
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const user: User = {
      ...MOCK_USER,
      email: payload.email,
      displayName: payload.displayName,
    };
    const session = makeSession(user);
    await persist(session);
    return session;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(Config.storage.SESSION_KEY);
  },

  async requestPasswordReset(_email: string): Promise<void> {
    return Promise.resolve();
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    const raw = await AsyncStorage.getItem(Config.storage.SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  async updateProfile(
    patch: Partial<Pick<User, 'displayName' | 'avatarUrl'>>
  ): Promise<User> {
    const session = await mockAuthService.getCurrentSession();
    if (!session) throw new Error('No active session');
    const nextUser: User = {
      ...session.user,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await persist({ ...session, user: nextUser });
    return nextUser;
  },
};
