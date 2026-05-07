import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import { History, Pencil } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ChecklistItemRow } from '@/components/checklists/ChecklistItemRow';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import { checklistService } from '@/services';
import { notificationService } from '@/services/notificationService';
import { useChecklistStore } from '@/stores/useChecklistStore';
import type { Checklist } from '@/types/checklist';

export default function ChecklistRunScreen() {
  const { id, geofenceId, fromNotification } = useLocalSearchParams<{
    id: string;
    geofenceId?: string;
    fromNotification?: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();

  const fromStore = useChecklistStore((s) =>
    typeof id === 'string' ? s.checklists.find((c) => c.id === id) : undefined
  );
  const activeSession = useChecklistStore((s) => s.activeSession);
  const startSession = useChecklistStore((s) => s.startSession);
  const toggleItem = useChecklistStore((s) => s.toggleItem);
  const clearSession = useChecklistStore((s) => s.clearSession);

  const [checklist, setChecklist] = useState<Checklist | null>(
    fromStore ?? null
  );
  const [loading, setLoading] = useState(!fromStore);
  const [barWidth, setBarWidth] = useState(0);

  // Sync store updates into local state
  useEffect(() => {
    if (fromStore) setChecklist(fromStore);
  }, [fromStore]);

  // Fetch from service if not in store
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

  // Start (or adopt) an ActiveSession so toggles work
  useEffect(() => {
    if (typeof id !== 'string' || !checklist) return;
    const targetGeofenceId =
      typeof geofenceId === 'string' && geofenceId.length > 0
        ? geofenceId
        : checklist.geofenceIds[0] ?? 'gf-unknown';
    // getState() used (not reactive selector) because we only need a one-time
    // snapshot to decide whether to call startSession — not a subscription.
    const session = useChecklistStore.getState().activeSession;
    if (!session || session.checklistId !== id) {
      startSession({
        checklistId: id,
        geofenceId: targetGeofenceId,
      });
    }
  }, [id, checklist, geofenceId, startSession]);

  // Header buttons: History + Edit
  useEffect(() => {
    if (typeof id !== 'string') return;
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View history"
            onPress={() => router.push(`/checklists/${id}/history`)}
            className="px-3 py-2 flex-row items-center gap-1"
          >
            <History stroke={Colors.text.muted} size={16} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit checklist"
            onPress={() => router.push(`/checklists/${id}/edit`)}
            className="px-3 py-2 flex-row items-center gap-1"
          >
            <Pencil stroke={Colors.primary[600]} size={16} />
            <Text className="text-primary-600 font-semibold">Edit</Text>
          </Pressable>
        </View>
      ),
    });
  }, [id, navigation, router]);

  const sortedItems = useMemo(
    () =>
      checklist
        ? checklist.items
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [checklist]
  );

  const sessionMatches =
    activeSession && checklist && activeSession.checklistId === checklist.id;

  const checkedCount = sessionMatches
    ? sortedItems.filter((i) => activeSession.checkedItemIds.has(i.id)).length
    : 0;
  const total = sortedItems.length;
  const progressPct =
    total === 0 ? 0 : Math.round((checkedCount / total) * 100);

  const isCheckedFor = useCallback(
    (itemId: string): boolean =>
      sessionMatches ? activeSession.checkedItemIds.has(itemId) : false,
    [sessionMatches, activeSession]
  );

  const checkAll = useCallback(() => {
    if (!checklist || !activeSession) return;
    sortedItems.forEach((it) => {
      if (!activeSession.checkedItemIds.has(it.id)) {
        toggleItem(it.id);
      }
    });
  }, [checklist, activeSession, sortedItems, toggleItem]);

  const resetAll = useCallback(() => {
    if (!checklist || !activeSession) return;
    sortedItems.forEach((it) => {
      if (activeSession.checkedItemIds.has(it.id)) {
        toggleItem(it.id);
      }
    });
  }, [checklist, activeSession, sortedItems, toggleItem]);

  const finishAndRecord = useCallback(async () => {
    if (!checklist || !activeSession) return;
    const completionPct =
      total === 0 ? 0 : Math.round((checkedCount / total) * 100);
    try {
      await checklistService.recordInstance({
        checklistId: checklist.id,
        geofenceId: activeSession.geofenceId,
        checkedItemIds: Array.from(activeSession.checkedItemIds),
        completionPct,
        triggeredAt: activeSession.startedAt.toISOString(),
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      // Recording is best-effort.
      console.warn('recordInstance failed', e);
    }
    clearSession();
    router.back();
  }, [checklist, activeSession, total, checkedCount, clearSession, router]);

  const onSnooze = useCallback(
    (minutes: number) => {
      if (!checklist || !activeSession) return;
      notificationService
        .scheduleSnooze({
          checklistId: checklist.id,
          geofenceId: activeSession.geofenceId,
          delayMinutes: minutes,
        })
        .catch(() => undefined);
      const label = minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour`;
      Alert.alert('Snoozed', `We will remind you again in ${label}.`);
      router.back();
    },
    [checklist, activeSession, router]
  );

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
        <Text className="text-slate-800 text-lg">
          Checklist not found.
        </Text>
      </View>
    );
  }

  const highlightCritical = fromNotification === 'true';

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}
    >
      <View className="gap-1">
        <Text className="text-slate-900 text-2xl font-bold" numberOfLines={2}>
          {checklist.name}
        </Text>
        {checklist.description ? (
          <Text className="text-slate-500 text-sm">
            {checklist.description}
          </Text>
        ) : null}
      </View>

      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progressPct }}
        accessibilityLabel={`${progressPct}% complete`}
        className="h-3 rounded-full bg-slate-200 overflow-hidden"
      >
        <View
          style={{
            width: barWidth * (progressPct / 100),
            height: '100%',
            backgroundColor: Colors.primary[600],
          }}
        />
      </View>
      <Text className="text-slate-600 text-sm">
        {checkedCount} of {total} checked ({progressPct}%)
      </Text>

      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check all items"
          onPress={checkAll}
          className="flex-1 min-h-[48px] items-center justify-center rounded-card"
          style={{ backgroundColor: `${Colors.primary[600]}12`, borderWidth: 1, borderColor: `${Colors.primary[600]}30` }}
        >
          <Text className="text-primary-700 font-semibold text-sm">Check All</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset all items"
          onPress={resetAll}
          className="flex-1 min-h-[48px] items-center justify-center rounded-card"
          style={{ backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' }}
        >
          <Text className="text-slate-600 font-semibold text-sm">Reset All</Text>
        </Pressable>
      </View>

      <View className="gap-2">
        {sortedItems.map((it) => (
          <ChecklistItemRow
            key={it.id}
            item={it}
            checked={isCheckedFor(it.id)}
            onToggle={toggleItem}
            highlightCritical={highlightCritical}
          />
        ))}
        {sortedItems.length === 0 ? (
          <Text className="text-slate-500 text-sm text-center mt-2">
            This checklist has no items yet. Tap Edit to add some.
          </Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Text className="text-slate-700 font-medium text-sm">
          Snooze
        </Text>
        <View className="flex-row gap-2 flex-wrap">
          {Config.snoozeOptions.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityLabel={`Snooze for ${m} minutes`}
              onPress={() => onSnooze(m)}
              style={{ minHeight: Config.a11y.MIN_TAP_TARGET, justifyContent: 'center' }}
            >
              <View className="px-4 py-1.5 rounded-pill bg-primary-50 border border-primary-600/30">
                <Text className="text-primary-700 text-sm font-semibold">
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        label="Done"
        onPress={finishAndRecord}
      />
    </ScrollView>
  );
}
