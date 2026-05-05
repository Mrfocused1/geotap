import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GeofenceForm } from '@/components/geofences/GeofenceForm';
import { geofenceService } from '@/services';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import type { Geofence } from '@/types/geofence';

export default function EditGeofenceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const updateGeofence = useGeofenceStore((s) => s.updateGeofence);
  const deleteGeofence = useGeofenceStore((s) => s.deleteGeofence);
  const fromStore = useGeofenceStore((s) =>
    typeof id === 'string' ? s.geofences.find((g) => g.id === id) : undefined
  );

  const [geofence, setGeofence] = useState<Geofence | null>(
    fromStore ?? null
  );
  const [loading, setLoading] = useState(!fromStore);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (fromStore || typeof id !== 'string') return;
    let cancelled = false;
    setLoading(true);
    geofenceService
      .get(id)
      .then((g) => {
        if (!cancelled) {
          setGeofence(g);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, fromStore]);

  const handleSubmit = async (
    input: Parameters<typeof updateGeofence>[1]
  ) => {
    if (typeof id !== 'string') return;
    setSubmitting(true);
    try {
      await updateGeofence(id, input);
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

  const confirmDelete = () => {
    if (typeof id !== 'string' || !geofence) return;
    Alert.alert(
      'Delete geofence?',
      `Delete "${geofence.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteGeofence(id);
              router.back();
            } catch (e) {
              Alert.alert(
                'Delete failed',
                e instanceof Error ? e.message : 'Try again.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color="#0d9488" />
      </View>
    );
  }

  if (!geofence) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-6">
        <Text className="text-slate-800 text-lg">Geofence not found.</Text>
      </View>
    );
  }

  return (
    <GeofenceForm
      initialValue={{
        name: geofence.name,
        address: geofence.address,
        latitude: geofence.latitude,
        longitude: geofence.longitude,
        radiusMeters: geofence.radiusMeters,
        isActive: geofence.isActive,
      }}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={handleSubmit}
      onDelete={confirmDelete}
      deleting={deleting}
    />
  );
}
