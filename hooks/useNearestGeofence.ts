import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { distanceMeters } from '@/services/geofence/distance';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import type { Geofence } from '@/types/geofence';

type Result = {
  geofence: Geofence | null;
  distanceMeters: number | null;
  permissionDenied: boolean;
};

export function useNearestGeofence(): Result {
  const geofences = useGeofenceStore((s) => s.geofences);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) setPermissionDenied(true);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        }
      } catch {
        // ignore — surfaced as null distance
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<Result>(() => {
    if (!coords) {
      return { geofence: null, distanceMeters: null, permissionDenied };
    }
    const active = geofences.filter((g) => g.isActive);
    if (active.length === 0) {
      return { geofence: null, distanceMeters: null, permissionDenied };
    }
    const first = active[0];
    if (!first) {
      return { geofence: null, distanceMeters: null, permissionDenied };
    }
    let best: Geofence = first;
    let bestDist = distanceMeters(
      coords.lat,
      coords.lon,
      best.latitude,
      best.longitude
    );
    for (let i = 1; i < active.length; i++) {
      const g = active[i];
      if (!g) continue;
      const d = distanceMeters(coords.lat, coords.lon, g.latitude, g.longitude);
      if (d < bestDist) {
        best = g;
        bestDist = d;
      }
    }
    return { geofence: best, distanceMeters: bestDist, permissionDenied };
  }, [coords, geofences, permissionDenied]);
}
