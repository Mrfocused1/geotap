import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChecklistForm } from '@/components/checklists/ChecklistForm';
import { checklistService } from '@/services';
import { useChecklistStore } from '@/stores/useChecklistStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import type { Checklist, ChecklistInput } from '@/types/checklist';

export default function EditChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const updateChecklist = useChecklistStore((s) => s.updateChecklist);
  const deleteChecklist = useChecklistStore((s) => s.deleteChecklist);
  const fromStore = useChecklistStore((s) =>
    typeof id === 'string' ? s.checklists.find((c) => c.id === id) : undefined
  );
  const geofences = useGeofenceStore((s) => s.geofences);

  const [checklist, setChecklist] = useState<Checklist | null>(
    fromStore ?? null
  );
  const [loading, setLoading] = useState(!fromStore);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (fromStore && !checklist) setChecklist(fromStore);
  }, [fromStore, checklist]);

  useEffect(() => {
    if (fromStore || typeof id !== 'string') return;
    let cancelled = false;
    setLoading(true);
    checklistService
      .get(id)
      .then((c) => {
        if (!cancelled) {
          setChecklist(c ?? null);
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

  const handleSubmit = async (input: ChecklistInput) => {
    if (typeof id !== 'string') return;
    setSubmitting(true);
    try {
      await updateChecklist(id, input);
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
    if (typeof id !== 'string' || !checklist) return;
    Alert.alert(
      'Delete checklist?',
      `Delete "${checklist.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteChecklist(id);
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

  if (!checklist) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-6">
        <Text className="text-slate-800 text-lg">Checklist not found.</Text>
      </View>
    );
  }

  const sortedItems = checklist.items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ChecklistForm
      geofences={geofences}
      initialValue={{
        name: checklist.name,
        description: checklist.description,
        isRecurring: checklist.isRecurring,
        recurrencePattern: checklist.recurrencePattern,
        geofenceIds: checklist.geofenceIds,
        items: sortedItems.map((i) => ({
          id: i.id,
          name: i.name,
          priority: i.priority,
        })),
      }}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={handleSubmit}
      onDelete={confirmDelete}
      deleting={deleting}
    />
  );
}
