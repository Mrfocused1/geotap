import { useEffect } from 'react';
import * as Location from 'expo-location';
import { Config } from '@/constants/config';
import { useGeofenceStore } from '@/stores/useGeofenceStore';

export function useGeofenceMonitor(authenticated: boolean) {
  const geofences = useGeofenceStore((s) => s.geofences);

  useEffect(() => {
    if (!authenticated || geofences.length === 0) return;

    const active = geofences.filter((g) => g.isActive);
    if (active.length === 0) return;

    const regions: Location.LocationRegion[] = active.map((g) => ({
      identifier: g.id,
      latitude: g.latitude,
      longitude: g.longitude,
      radius: g.radiusMeters,
      notifyOnEnter: false,
      notifyOnExit: true,
    }));

    Location.startGeofencingAsync(Config.tasks.GEOFENCE_TASK, regions).catch(
      (e) => console.warn('[useGeofenceMonitor] startGeofencingAsync failed', e)
    );

    return () => {
      Location.stopGeofencingAsync(Config.tasks.GEOFENCE_TASK).catch(
        () => undefined
      );
    };
  }, [authenticated, geofences]);
}
