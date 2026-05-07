import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

const GLOBAL_ENABLED_KEY = '@memopush/notifications-global-enabled';

type NotificationState = {
  permissionStatus: PermissionStatus;
  globalEnabled: boolean;

  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  setGlobalEnabled: (enabled: boolean) => Promise<void>;
  loadGlobalEnabled: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  permissionStatus: 'undetermined',
  globalEnabled: true,

  checkPermissions: async () => {
    const { status } = await Notifications.getPermissionsAsync();
    set({
      permissionStatus:
        status === 'granted'
          ? 'granted'
          : status === 'denied'
          ? 'denied'
          : 'undetermined',
    });
  },

  requestPermissions: async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    set({ permissionStatus: granted ? 'granted' : 'denied' });
    return granted;
  },

  setGlobalEnabled: async (enabled: boolean) => {
    set({ globalEnabled: enabled });
    await AsyncStorage.setItem(GLOBAL_ENABLED_KEY, String(enabled));
  },

  loadGlobalEnabled: async () => {
    const raw = await AsyncStorage.getItem(GLOBAL_ENABLED_KEY);
    if (raw !== null) {
      set({ globalEnabled: raw !== 'false' });
    }
  },
}));
