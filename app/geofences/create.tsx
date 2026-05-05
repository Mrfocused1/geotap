import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { GeofenceForm } from '@/components/geofences/GeofenceForm';
import { Config } from '@/constants/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';

export default function CreateGeofenceScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const geofences = useGeofenceStore((s) => s.geofences);
  const createGeofence = useGeofenceStore((s) => s.createGeofence);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (input: Parameters<typeof createGeofence>[1]) => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to create a geofence.');
      return;
    }
    if (geofences.length >= Config.geofence.MAX_GEOFENCES) {
      Alert.alert(
        'Limit reached',
        `You can save up to ${Config.geofence.MAX_GEOFENCES} geofences.`
      );
      return;
    }
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
