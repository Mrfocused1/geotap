import { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ListChecks, MapPin, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChecklistStore } from '@/stores/useChecklistStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import { useNearestGeofence } from '@/hooks/useNearestGeofence';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const geofences = useGeofenceStore((s) => s.geofences);
  const loadGeofences = useGeofenceStore((s) => s.loadGeofences);

  const checklists = useChecklistStore((s) => s.checklists);
  const loadChecklists = useChecklistStore((s) => s.loadChecklists);
  const activeSession = useChecklistStore((s) => s.activeSession);

  const { geofence: nearestGeofence, distanceMeters } = useNearestGeofence();

  useEffect(() => {
    if (!user) return;
    if (geofences.length === 0) loadGeofences(user.id);
    if (checklists.length === 0) loadChecklists(user.id);
  }, [user, geofences.length, checklists.length, loadGeofences, loadChecklists]);

  const activeGeofenceCount = geofences.filter((g) => g.isActive).length;

  const lastUsed = checklists.reduce<(typeof checklists)[0] | null>(
    (best, c) => (!best || c.updatedAt > best.updatedAt ? c : best),
    null
  );

  const sessionChecklist = activeSession
    ? checklists.find((c) => c.id === activeSession.checklistId) ?? null
    : null;
  const sessionCheckedCount = activeSession
    ? activeSession.checkedItemIds.size
    : 0;
  const sessionTotalCount = sessionChecklist?.items.length ?? 0;

  const openChecklist = useCallback(
    (id: string) => router.push(`/checklists/${id}`),
    [router]
  );

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 96 }}
    >
      <View className="pt-12 pb-2">
        <Text className="text-slate-500 text-sm">Welcome back</Text>
        <Text className="text-slate-900 text-3xl font-bold">Home</Text>
      </View>

      {sessionChecklist ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Resume checklist ${sessionChecklist.name}`}
          onPress={() => openChecklist(sessionChecklist.id)}
          className="bg-surface border border-primary-600 rounded-card p-4 gap-1"
        >
          <Text className="text-primary-600 text-xs font-semibold uppercase tracking-wider">
            In Progress
          </Text>
          <Text className="text-slate-900 font-bold text-base">
            {sessionChecklist.name}
          </Text>
          <Text className="text-slate-600 text-sm">
            {sessionCheckedCount} of {sessionTotalCount} items checked — tap to resume
          </Text>
        </Pressable>
      ) : null}

      {nearestGeofence && distanceMeters !== null ? (
        <View className="bg-surface rounded-card p-4 border border-slate-200 gap-1">
          <View className="flex-row items-center gap-2">
            <MapPin stroke={Colors.primary[600]} size={16} />
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Nearest Geofence
            </Text>
          </View>
          <Text className="text-slate-900 font-bold text-lg">
            {nearestGeofence.name}
          </Text>
          <Text className="text-slate-500 text-sm">
            {distanceMeters < 1000
              ? `${Math.round(distanceMeters)}m away`
              : `${(distanceMeters / 1000).toFixed(1)}km away`}
          </Text>
        </View>
      ) : (
        <View className="bg-surface rounded-card p-4 border border-slate-200">
          <Text className="text-slate-500 text-sm">
            No geofences yet. Tap + Geofence to create one.
          </Text>
        </View>
      )}

      <View className="flex-row gap-3">
        <View className="flex-1 bg-surface rounded-card p-4 border border-slate-200 items-center gap-1">
          <Text className="text-primary-600 text-2xl font-bold">
            {activeGeofenceCount}
          </Text>
          <Text className="text-slate-500 text-xs">
            Active geofence{activeGeofenceCount === 1 ? '' : 's'}
          </Text>
        </View>
        <View className="flex-1 bg-surface rounded-card p-4 border border-slate-200 items-center gap-1">
          <Text className="text-primary-600 text-2xl font-bold">
            {checklists.length}
          </Text>
          <Text className="text-slate-500 text-xs">
            Checklist{checklists.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      {lastUsed ? (
        <View className="bg-surface rounded-card p-4 border border-slate-200 gap-3">
          <View className="flex-row items-center gap-2">
            <ListChecks stroke={Colors.primary[600]} size={16} />
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Last Used
            </Text>
          </View>
          <Text className="text-slate-900 font-bold text-base">{lastUsed.name}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${lastUsed.name}`}
            onPress={() => openChecklist(lastUsed.id)}
            className="bg-primary-600 rounded-card py-3 items-center"
          >
            <Text className="text-white font-semibold">Open →</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create geofence"
          onPress={() => router.push('/geofences/create')}
          className="flex-1 bg-surface border border-slate-200 rounded-card py-3 flex-row items-center justify-center gap-2"
        >
          <Plus stroke={Colors.primary[600]} size={18} />
          <Text className="text-slate-700 font-semibold text-sm">Geofence</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create checklist"
          onPress={() => router.push('/checklists/create')}
          className="flex-1 bg-surface border border-slate-200 rounded-card py-3 flex-row items-center justify-center gap-2"
        >
          <Plus stroke={Colors.primary[600]} size={18} />
          <Text className="text-slate-700 font-semibold text-sm">Checklist</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
