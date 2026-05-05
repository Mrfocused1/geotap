import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ScheduleSnoozeInput = {
  checklistId: string;
  geofenceId: string;
  delayMinutes: number;
};

export type ScheduleExitAlertInput = {
  geofenceName: string;
  checklistId: string;
  geofenceId: string;
  uncheckedItemNames: string[];
};

export interface INotificationService {
  scheduleSnooze(input: ScheduleSnoozeInput): Promise<void>;
  scheduleExitAlert(input: ScheduleExitAlertInput): Promise<void>;
}

export async function setupNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Trace Back Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export const notificationService: INotificationService = {
  async scheduleSnooze(input) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Trace Back — Reminder',
        body: 'You have unchecked items on your checklist.',
        data: {
          checklistId: input.checklistId,
          geofenceId: input.geofenceId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: input.delayMinutes * 60,
        repeats: false,
      },
    });
  },

  async scheduleExitAlert(input) {
    const { uncheckedItemNames, geofenceName, checklistId, geofenceId } = input;
    const count = uncheckedItemNames.length;
    const shown = uncheckedItemNames.slice(0, 3);
    const remaining = count - shown.length;
    const itemList =
      remaining > 0
        ? `${shown.join(' · ')} … and ${remaining} more`
        : shown.join(' · ');
    const body =
      count === 1
        ? `1 item unchecked: ${itemList}`
        : `${count} items unchecked: ${itemList}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Trace Back — ${geofenceName}`,
        body,
        data: { checklistId, geofenceId },
      },
      trigger: null,
    });
  },
};
