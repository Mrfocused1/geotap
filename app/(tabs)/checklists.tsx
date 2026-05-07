import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { ChecklistCard } from '@/components/checklists/ChecklistCard';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Colors } from '@/constants/colors';
import { limitLabel } from '@/constants/plans';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChecklistStore } from '@/stores/useChecklistStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import type { Checklist } from '@/types/checklist';

type SortMode = 'updated' | 'alpha' | 'items';

const SORTS: { id: SortMode; label: string }[] = [
  { id: 'updated', label: 'Recent' },
  { id: 'alpha', label: 'A–Z' },
  { id: 'items', label: 'Most items' },
];

function sortChecklists(
  list: Checklist[],
  mode: SortMode
): Checklist[] {
  const copy = list.slice();
  if (mode === 'alpha') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (mode === 'items') {
    return copy.sort((a, b) => b.items.length - a.items.length);
  }
  return copy.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export default function ChecklistsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const checklists = useChecklistStore((s) => s.checklists);
  const isLoading = useChecklistStore((s) => s.isLoading);
  const loadChecklists = useChecklistStore((s) => s.loadChecklists);
  const activeSession = useChecklistStore((s) => s.activeSession);

  const geofences = useGeofenceStore((s) => s.geofences);
  const loadGeofences = useGeofenceStore((s) => s.loadGeofences);

  const { canAddChecklist, checklistLimit } = usePlanLimits();
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const hasFetchedGeofences = useRef(false);

  useEffect(() => {
    if (!user) return;
    loadChecklists(user.id);
  }, [user, loadChecklists]);

  useEffect(() => {
    if (!user || hasFetchedGeofences.current) return;
    hasFetchedGeofences.current = true;
    loadGeofences(user.id);
  }, [user, loadGeofences]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered =
      q.length === 0
        ? checklists
        : checklists.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.items.some((i) => i.name.toLowerCase().includes(q))
          );
    return sortChecklists(filtered, sortMode);
  }, [checklists, query, sortMode]);

  const onCreate = useCallback(() => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to create a checklist.');
      return;
    }
    if (!canAddChecklist(checklists.length)) {
      setShowUpgrade(true);
      return;
    }
    router.push('/checklists/create');
  }, [user, checklists.length, canAddChecklist, router]);

  const onOpen = useCallback((id: string) => {
    router.push(`/checklists/${id}`);
  }, [router]);

  const onRefresh = useCallback(() => {
    if (user) loadChecklists(user.id);
  }, [user, loadChecklists]);

  const renderItem = useCallback(
    ({ item }: { item: Checklist }) => {
      const pct =
        activeSession?.checklistId === item.id && item.items.length > 0
          ? Math.round((activeSession.checkedItemIds.size / item.items.length) * 100)
          : 0;
      return (
        <ChecklistCard
          checklist={item}
          geofences={geofences}
          progressPct={pct}
          onPress={onOpen}
        />
      );
    },
    [geofences, onOpen, activeSession]
  );

  return (
    <View className="flex-1 bg-surface-dark">
      <View className="px-6 pt-16 pb-3">
        <Text className="text-slate-900 text-3xl font-bold">Checklists</Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          {checklists.length} / {limitLabel(checklistLimit)} used
        </Text>
      </View>

      <View className="px-6 gap-3 pb-3">
        <View className="flex-row items-center gap-2 bg-surface rounded-input px-3 border border-slate-200">
          <Search stroke={Colors.text.muted} size={18} />
          <TextInput
            accessibilityLabel="Search checklists"
            value={query}
            onChangeText={setQuery}
            placeholder="Search checklists or items"
            placeholderTextColor="#94a3b8"
            className="flex-1 min-h-[48px] text-slate-800"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View className="flex-row gap-2">
          {SORTS.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: sortMode === s.id }}
              accessibilityLabel={`Sort by ${s.label}`}
              onPress={() => setSortMode(s.id)}
              className={`px-3 py-2 rounded-pill ${
                sortMode === s.id ? 'bg-primary-600' : 'bg-surface'
              }`}
            >
              <Text
                className={
                  sortMode === s.id
                    ? 'text-white text-sm font-semibold'
                    : 'text-slate-600 text-sm'
                }
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredSorted}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 96,
          gap: 12,
        }}
        refreshing={isLoading}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-12">
            {query.trim().length > 0
              ? 'No checklists match your search.'
              : 'No checklists yet. Tap + to create one.'}
          </Text>
        }
        renderItem={renderItem}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create checklist"
        onPress={onCreate}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Plus stroke="#ffffff" size={28} />
      </Pressable>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </View>
  );
}
