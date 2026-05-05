import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChecklistForm } from '@/components/checklists/ChecklistForm';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChecklistStore } from '@/stores/useChecklistStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import type { ChecklistInput } from '@/types/checklist';

export default function CreateChecklistScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createChecklist = useChecklistStore((s) => s.createChecklist);
  const geofences = useGeofenceStore((s) => s.geofences);
  const loadGeofences = useGeofenceStore((s) => s.loadGeofences);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && geofences.length === 0) loadGeofences(user.id);
  }, [user, geofences.length, loadGeofences]);

  const handleSubmit = async (input: ChecklistInput) => {
    if (!user) {
      Alert.alert(
        'Not signed in',
        'Please sign in to create a checklist.'
      );
      return;
    }
    setSubmitting(true);
    try {
      await createChecklist(user.id, input);
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
    <ChecklistForm
      geofences={geofences}
      submitLabel="Save checklist"
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
