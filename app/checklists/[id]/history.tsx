import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { checklistService } from '@/services';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import type { ChecklistInstance } from '@/types/checklist';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export default function ChecklistHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan } = usePlanLimits();
  const [instances, setInstances] = useState<ChecklistInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    let cancelled = false;
    checklistService
      .listInstancesForChecklist(id)
      .then((data) => {
        if (!cancelled) {
          setInstances(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLocked = plan.id === 'free';

  if (isLocked) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-8 gap-4">
        <Text className="text-slate-900 font-bold text-xl text-center">
          History is a Pro feature
        </Text>
        <Text className="text-slate-500 text-sm text-center">
          Upgrade to Pro to see the last 30 days of checklist completions.
        </Text>
      </View>
    );
  }

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
        <Text className="text-slate-500 text-center mt-12">
          No completions recorded yet.
        </Text>
      }
      renderItem={({ item }) => (
        <View
          className="bg-surface rounded-card border border-slate-200 px-4 py-3 flex-row items-center justify-between"
        >
          <View style={{ gap: 2, flex: 1, marginRight: 12 }}>
            <Text className="text-slate-800 font-medium text-sm">
              {formatDate(item.triggeredAt)}
            </Text>
            <Text className="text-slate-500 text-xs">
              {item.checkedItemIds.length} item{item.checkedItemIds.length === 1 ? '' : 's'} checked
            </Text>
          </View>
          <CompletionBadge pct={item.completionPct} />
        </View>
      )}
    />
  );
}
