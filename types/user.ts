export type NotificationSettings = {
  globalEnabled: boolean;
  sound: boolean;
  vibration: boolean;
};

export type User = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  notificationSettings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  token: string;
  user: User;
  expiresAt: string;
};
