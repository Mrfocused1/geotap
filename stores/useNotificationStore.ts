import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

type NotificationState = {
  permissionStatus: PermissionStatus;
  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  permissionStatus: 'undetermined',

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
}));
