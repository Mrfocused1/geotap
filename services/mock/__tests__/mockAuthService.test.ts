import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { mockAuthService } from '@/services/mock/mockAuthService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('mockAuthService', () => {
  it('login() returns a session and persists it to AsyncStorage', async () => {
    const session = await mockAuthService.login({
      email: 'demo@traceback.app',
      password: 'whatever',
    });

    expect(session.token).toMatch(/^mock-token-/);
    expect(session.user.email).toBe('demo@traceback.app');

    const stored = await AsyncStorage.getItem(Config.storage.SESSION_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.token).toBe(session.token);
  });

  it('register() returns a session with the requested displayName', async () => {
    const session = await mockAuthService.register({
      email: 'new@traceback.app',
      password: 'pw',
      displayName: 'Newbie',
    });

    expect(session.user.displayName).toBe('Newbie');
    expect(session.user.email).toBe('new@traceback.app');
  });

  it('getCurrentSession() returns null when no session is stored', async () => {
    const result = await mockAuthService.getCurrentSession();
    expect(result).toBeNull();
  });

  it('getCurrentSession() returns a stored session', async () => {
    await mockAuthService.login({ email: 'demo@traceback.app', password: 'x' });
    const result = await mockAuthService.getCurrentSession();
    expect(result).not.toBeNull();
    expect(result!.user.email).toBe('demo@traceback.app');
  });

  it('logout() clears AsyncStorage session', async () => {
    await mockAuthService.login({ email: 'demo@traceback.app', password: 'x' });
    await mockAuthService.logout();
    const stored = await AsyncStorage.getItem(Config.storage.SESSION_KEY);
    expect(stored).toBeNull();
  });

  it('requestPasswordReset() resolves silently', async () => {
    await expect(
      mockAuthService.requestPasswordReset('demo@traceback.app')
    ).resolves.toBeUndefined();
  });
});
