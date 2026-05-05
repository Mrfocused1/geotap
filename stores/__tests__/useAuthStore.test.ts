import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/useAuthStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
  useAuthStore.setState({
    session: null,
    user: null,
    status: 'idle',
    error: null,
  });
});

describe('useAuthStore', () => {
  it('login() sets status to authenticated and stores user', async () => {
    await useAuthStore.getState().login('demo@traceback.app', 'pw');
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user?.email).toBe('demo@traceback.app');
    expect(state.session?.token).toMatch(/^mock-token-/);
  });

  it('logout() clears session', async () => {
    await useAuthStore.getState().login('demo@traceback.app', 'pw');
    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.status).toBe('unauthenticated');
  });

  it('hydrate() restores session if one exists in storage', async () => {
    await useAuthStore.getState().login('demo@traceback.app', 'pw');
    useAuthStore.setState({ session: null, user: null, status: 'idle' });
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('hydrate() resolves to unauthenticated when no session exists', async () => {
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});
