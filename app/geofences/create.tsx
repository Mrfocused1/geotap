import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { GeofenceForm } from '@/components/geofences/GeofenceForm';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

export default function CreateGeofenceScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createGeofence = useGeofenceStore((s) => s.createGeofence);
  const [submitting, setSubmitting] = useState(false);
  const requestNotificationPermissions = useNotificationStore(
    (s) => s.requestPermissions
  );

  type GeofenceInput = Parameters<typeof createGeofence>[1];

  const handleSubmit = async (input: GeofenceInput) => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to save a geofence.');
      return;
    }

    // Request location permissions (required for background geofencing)
    const { status: fgStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      Alert.alert(
        'Location required',
        'Trace Back needs location access to monitor geofences. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    const { status: bgStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      Alert.alert(
        '"Always" location required',
        'Background geofencing requires "Always" location access. Please update this in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Request notification permission
    await requestNotificationPermissions();

    setSubmitting(true);
    try {
      await createGeofence(user.id, input);
      router.back();
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GeofenceForm
      submitLabel="Save geofence"
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
