import { notificationService } from '@/services/notificationService';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id-1'),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  AndroidImportance: { HIGH: 4 },
}));

import * as Notifications from 'expo-notifications';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('notificationService.scheduleSnooze', () => {
  it('calls scheduleNotificationAsync with a time interval trigger', async () => {
    await notificationService.scheduleSnooze({
      checklistId: 'cl-1',
      geofenceId: 'gf-1',
      delayMinutes: 15,
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.seconds).toBe(15 * 60);
    expect(call.content.data.checklistId).toBe('cl-1');
  });
});

describe('notificationService.scheduleExitAlert', () => {
  it('fires immediately (trigger: null) with unchecked item names', async () => {
    await notificationService.scheduleExitAlert({
      geofenceName: 'Home',
      checklistId: 'cl-2',
      geofenceId: 'gf-home',
      uncheckedItemNames: ['Keys', 'Wallet'],
    });

    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger).toBeNull();
    expect(call.content.title).toContain('Home');
    expect(call.content.body).toContain('Keys');
    expect(call.content.body).toContain('2 items');
  });

  it('shows singular when one item is unchecked', async () => {
    await notificationService.scheduleExitAlert({
      geofenceName: 'Office',
      checklistId: 'cl-3',
      geofenceId: 'gf-office',
      uncheckedItemNames: ['Laptop'],
    });

    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.content.body).toContain('1 item');
    expect(call.content.body).toContain('Laptop');
  });

  it('truncates to 3 items and shows remaining count', async () => {
    await notificationService.scheduleExitAlert({
      geofenceName: 'Gym',
      checklistId: 'cl-4',
      geofenceId: 'gf-gym',
      uncheckedItemNames: ['A', 'B', 'C', 'D', 'E'],
    });

    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.content.body).toContain('2 more');
  });
});
