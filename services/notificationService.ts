// Plan 4 will replace this with expo-notifications calls.
// For now, scheduleSnooze is a no-op that logs intent so screens can wire it
// without depending on a real notification implementation.

export type ScheduleSnoozeInput = {
  checklistId: string;
  geofenceId: string;
  delayMinutes: number;
};

export interface INotificationService {
  scheduleSnooze(input: ScheduleSnoozeInput): Promise<void>;
}

export const notificationService: INotificationService = {
  async scheduleSnooze(input) {
    // eslint-disable-next-line no-console
    console.log(
      `[notificationService] (stub) scheduleSnooze checklist=${input.checklistId} geofence=${input.geofenceId} in ${input.delayMinutes}m`
    );
  },
};
