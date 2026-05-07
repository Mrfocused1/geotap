import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MapPin, Plus, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChecklistStore } from '@/stores/useChecklistStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import { useNearestGeofence } from '@/hooks/useNearestGeofence';

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}


export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const geofences = useGeofenceStore((s) => s.geofences);
  const loadGeofences = useGeofenceStore((s) => s.loadGeofences);
  const checklists = useChecklistStore((s) => s.checklists);
  const loadChecklists = useChecklistStore((s) => s.loadChecklists);
  const activeSession = useChecklistStore((s) => s.activeSession);
  const clearSession = useChecklistStore((s) => s.clearSession);
  const { geofence: nearest, distanceMeters } = useNearestGeofence();

  useEffect(() => {
    if (!user) return;
    if (geofences.length === 0) loadGeofences(user.id);
    if (checklists.length === 0) loadChecklists(user.id);
  }, [user, geofences.length, checklists.length, loadGeofences, loadChecklists]);

  const activeGeofences = useMemo(
    () => geofences.filter((g) => g.isActive),
    [geofences]
  );

  const checklistsByGeofence = useMemo(() => {
    const map = new Map<string, typeof checklists>();
    for (const c of checklists) {
      for (const gid of c.geofenceIds) {
        const existing = map.get(gid) ?? [];
        map.set(gid, [...existing, c]);
      }
    }
    return map;
  }, [checklists]);

  const openChecklist = useCallback(
    (id: string) => router.push(`/checklists/${id}`),
    [router]
  );

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  // Only show session banner if the checklist still exists in our list
  const sessionChecklist = activeSession
    ? (checklists.find((c) => c.id === activeSession.checklistId) ?? null)
    : null;

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerStyle={{ padding: 24, paddingBottom: 96 }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between pt-12 pb-5">
        <View className="flex-1 pr-3">
          <Text className="text-slate-900 text-2xl font-bold" numberOfLines={1}>
            {timeGreeting()}, {firstName}
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            {activeGeofences.length === 0
              ? 'No active zones yet'
              : `You have ${activeGeofences.length} active zone${activeGeofences.length === 1 ? '' : 's'}`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recent activity"
          onPress={() => router.push('/activity')}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface border border-slate-200"
          style={{ marginTop: 2 }}
        >
          <Bell stroke={Colors.text.muted} size={18} />
        </Pressable>
      </View>

      {/* Active session banner */}
      {sessionChecklist ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Resume ${sessionChecklist.name}`}
          onPress={() => openChecklist(sessionChecklist.id)}
          className="rounded-card p-4 mb-4 flex-row items-start justify-between"
          style={{
            backgroundColor: Colors.primary[600],
            shadowColor: Colors.primary[600],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-1">
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' }}>
              In progress · {activeSession!.checkedItemIds.size}/{sessionChecklist.items.length} items
            </Text>
            <Text className="text-white font-bold text-base mt-0.5">
              {sessionChecklist.name}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>
              Tap to resume →
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={(e) => {
              e.stopPropagation?.();
              clearSession();
            }}
            className="w-8 h-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <X stroke="#ffffff" size={14} />
          </Pressable>
        </Pressable>
      ) : null}

      {/* Zone cards */}
      {activeGeofences.length > 0 ? (
        <View style={{ gap: 12 }}>
          {activeGeofences.map((g) => {
            const linked = checklistsByGeofence.get(g.id) ?? [];
            const isNearest = nearest?.id === g.id;
            const dist =
              isNearest && distanceMeters !== null
                ? distanceMeters < 1000
                  ? `${Math.round(distanceMeters)} m away`
                  : `${(distanceMeters / 1000).toFixed(1)} km away`
                : null;

            return (
              <View
                key={g.id}
                className="bg-surface rounded-card border border-slate-200 overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Card body */}
                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className="text-slate-900 font-bold text-lg">
                          {g.name}
                        </Text>
                        <View
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${Colors.primary[600]}15`,
                            borderWidth: 1,
                            borderColor: `${Colors.primary[600]}30`,
                          }}
                        >
                          <Text className="text-primary-700 text-xs font-semibold">
                            Active
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="text-slate-500 text-sm mt-0.5"
                        numberOfLines={1}
                      >
                        {g.address}
                      </Text>

                      {/* Distance or reminder label */}
                      <View className="mt-2">
                        <Text className="text-slate-400 text-xs">
                          You'll be reminded when leaving
                        </Text>
                        {dist ? (
                          <Text
                            className="text-primary-600 font-bold mt-0.5"
                            style={{ fontSize: 22, lineHeight: 28 }}
                          >
                            {dist}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Circular map pin */}
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: Colors.primary[50],
                        borderWidth: 1.5,
                        borderColor: `${Colors.primary[600]}30`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MapPin stroke={Colors.primary[600]} size={24} />
                    </View>
                  </View>
                </View>

                {/* Linked checklists */}
                {linked.length > 0 ? (
                  <View className="border-t border-slate-100">
                    {linked.map((cl) => {
                      const isSession = activeSession?.checklistId === cl.id;
                      const checked = isSession
                        ? activeSession!.checkedItemIds.size
                        : 0;
                      const total = cl.items.length;
                      return (
                        <Pressable
                          key={cl.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Open ${cl.name}`}
                          onPress={() => openChecklist(cl.id)}
                          className="flex-row items-center justify-between px-4 py-3"
                        >
                          <Text
                            className="text-slate-800 font-medium flex-1"
                            numberOfLines={1}
                          >
                            {cl.name}
                          </Text>
                          <View
                            className="px-2.5 py-1 rounded-full ml-3"
                            style={{
                              backgroundColor: `${Colors.primary[600]}15`,
                            }}
                          >
                            <Text className="text-primary-700 text-xs font-bold">
                              {isSession ? `${checked}/` : ''}
                              {total} items
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Link a checklist to this zone"
                    onPress={() => router.push('/checklists/create')}
                    className="border-t border-slate-100 px-4 py-3 flex-row items-center gap-2"
                  >
                    <Plus stroke="#cbd5e1" size={14} />
                    <Text className="text-slate-400 text-sm">Link a checklist</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        /* Empty state */
        <View className="bg-surface rounded-card border border-slate-200 p-6 items-center gap-3">
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.primary[50],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin stroke={Colors.primary[600]} size={26} />
          </View>
          <Text className="text-slate-900 font-bold text-base">
            No active zones
          </Text>
          <Text className="text-slate-500 text-sm text-center">
            Add a geofence to get reminded when you leave home, work, or anywhere else.
          </Text>
          <View className="flex-row gap-3 mt-1 w-full">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create geofence"
              onPress={() => router.push('/geofences/create')}
              className="flex-1 bg-primary-600 rounded-card py-3 items-center"
            >
              <Text className="text-white font-semibold text-sm">+ Geofence</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create checklist"
              onPress={() => router.push('/checklists/create')}
              className="flex-1 bg-surface border border-slate-200 rounded-card py-3 items-center"
            >
              <Text className="text-slate-700 font-semibold text-sm">+ Checklist</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Quick add row */}
      {activeGeofences.length > 0 ? (
        <View className="flex-row gap-3 mt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create geofence"
            onPress={() => router.push('/geofences/create')}
            className="flex-1 bg-surface border border-slate-200 rounded-card py-3 flex-row items-center justify-center gap-2"
          >
            <Plus stroke={Colors.primary[600]} size={16} />
            <Text className="text-slate-700 font-semibold text-sm">Geofence</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create checklist"
            onPress={() => router.push('/checklists/create')}
            className="flex-1 bg-surface border border-slate-200 rounded-card py-3 flex-row items-center justify-center gap-2"
          >
            <Plus stroke={Colors.primary[600]} size={16} />
            <Text className="text-slate-700 font-semibold text-sm">Checklist</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
