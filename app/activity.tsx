import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { checklistService } from '@/services';
import { useChecklistStore } from '@/stores/useChecklistStore';
import type { ChecklistInstance } from '@/types/checklist';

type EnrichedInstance = ChecklistInstance & { checklistName: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CompletionBadge({ pct }: { pct: number }) {
  const color = pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : Colors.accent.DEFAULT;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: `${color}20`,
      }}
    >
      <Text style={{ color, fontWeight: '700', fontSize: 13 }}>{pct}%</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const checklists = useChecklistStore((s) => s.checklists);
  const [instances, setInstances] = useState<EnrichedInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checklists.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    Promise.all(
      checklists.map((c) =>
        checklistService
          .listInstancesForChecklist(c.id)
          .then((list) => list.map((i) => ({ ...i, checklistName: c.name })))
          .catch(() => [] as EnrichedInstance[])
      )
    ).then((results) => {
      if (!cancelled) {
        const merged = results
          .flat()
          .sort(
            (a, b) =>
              new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
          )
          .slice(0, 50);
        setInstances(merged);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [checklists]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color={Colors.primary[600]} />
      </View>
    );
  }

  return (
    <FlatList
      data={instances}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 48 }}
      className="flex-1 bg-surface-dark"
      ListEmptyComponent={
        <View className="items-center mt-16 gap-3 px-8">
          <Text className="text-slate-900 font-bold text-lg text-center">
            No activity yet
          </Text>
          <Text className="text-slate-500 text-sm text-center">
            Completed checklists will appear here.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="bg-surface rounded-card border border-slate-200 px-4 py-3 flex-row items-center justify-between">
          <View style={{ gap: 2, flex: 1, marginRight: 12 }}>
            <Text className="text-slate-800 font-semibold text-sm" numberOfLines={1}>
              {item.checklistName}
            </Text>
            <Text className="text-slate-500 text-xs">{formatDate(item.triggeredAt)}</Text>
          </View>
          <CompletionBadge pct={item.completionPct} />
        </View>
      )}
    />
  );
}
