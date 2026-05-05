import { create } from 'zustand';

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'undetermined';

type NotificationState = {
  locationPermission: PermissionStatus;
  notificationPermission: PermissionStatus;
  backgroundRefreshAvailable: boolean | null;

  setLocationPermission: (status: PermissionStatus) => void;
  setNotificationPermission: (status: PermissionStatus) => void;
  setBackgroundRefreshAvailable: (available: boolean | null) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  locationPermission: 'unknown',
  notificationPermission: 'unknown',
  backgroundRefreshAvailable: null,

  setLocationPermission: (locationPermission) => set({ locationPermission }),
  setNotificationPermission: (notificationPermission) =>
    set({ notificationPermission }),
  setBackgroundRefreshAvailable: (backgroundRefreshAvailable) =>
    set({ backgroundRefreshAvailable }),
}));
