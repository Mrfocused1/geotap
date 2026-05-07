import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';

const GLOBAL_ENABLED_KEY = '@memopush/notifications-global-enabled';
import { notificationService } from '@/services/notificationService';
import type { Checklist } from '@/types/checklist';
import type { Geofence } from '@/types/geofence';

type PersistedSession = {
  checklistId: string;
  geofenceId: string;
  checkedItemIds: string[];
  startedAt: string;
};

type GeofencingTaskBody = {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
};

TaskManager.defineTask<GeofencingTaskBody>(
  Config.tasks.GEOFENCE_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<GeofencingTaskBody>) => {
    if (error) {
      console.warn('[GEOFENCE_TASK] error', error);
      return;
    }
    if (!data) return;

    const body = data;
    if (body.eventType !== Location.GeofencingEventType.Exit) return;

    const geofenceId = body.region.identifier;
    if (!geofenceId) return;

    try {
      const [geofenceRaw, checklistRaw, sessionRaw, globalEnabledRaw] = await Promise.all([
        AsyncStorage.getItem(Config.storage.GEOFENCE_CACHE_KEY),
        AsyncStorage.getItem(Config.storage.CHECKLIST_CACHE_KEY),
        AsyncStorage.getItem(Config.storage.ACTIVE_SESSION_KEY),
        AsyncStorage.getItem(GLOBAL_ENABLED_KEY),
      ]);

      // Respect the user's notification toggle
      if (globalEnabledRaw === 'false') return;

      if (!geofenceRaw || !checklistRaw) return;

      const geofences = JSON.parse(geofenceRaw) as Geofence[];
      const checklists = JSON.parse(checklistRaw) as Checklist[];

      const geofence = geofences.find((g) => g.id === geofenceId);
      if (!geofence || !geofence.isActive) return;

      const linked = checklists.filter((c) =>
        c.geofenceIds.includes(geofenceId)
      );
      if (linked.length === 0) return;

      const session = sessionRaw
        ? (JSON.parse(sessionRaw) as PersistedSession)
        : null;
      const checkedIds = new Set<string>(session?.checkedItemIds ?? []);

      const priorityOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      for (const checklist of linked) {
        const unchecked = checklist.items.filter(
          (item) => !checkedIds.has(item.id)
        );
        if (unchecked.length === 0) continue;

        const uncheckedNames = unchecked
          .sort(
            (a, b) =>
              (priorityOrder[a.priority] ?? 2) -
              (priorityOrder[b.priority] ?? 2)
          )
          .map((i) => i.name);

        await notificationService.scheduleExitAlert({
          geofenceName: geofence.name,
          checklistId: checklist.id,
          geofenceId,
          uncheckedItemNames: uncheckedNames,
        });
      }
    } catch (e) {
      console.warn('[GEOFENCE_TASK] failed to process exit event', e);
    }
  }
);

export function registerGeofenceTask(): void {
  // Task is registered by the defineTask call above at module load time.
  // This function exists so _layout.tsx can import it and trigger module evaluation.
}
