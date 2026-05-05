import * as TaskManager from 'expo-task-manager';
import { Config } from '@/constants/config';

export function registerGeofenceTask(): void {
  if (TaskManager.isTaskDefined(Config.tasks.GEOFENCE_TASK)) return;

  TaskManager.defineTask(Config.tasks.GEOFENCE_TASK, async ({ error }) => {
    if (error) {
      console.warn('[GEOFENCE_TASK] error', error);
      return;
    }
    // Plan 3: dispatch to geofenceMonitor.handleEvent(data)
    console.log('[GEOFENCE_TASK] event received (stub)');
  });
}
