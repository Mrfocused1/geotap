import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import type { ChecklistInput, ItemPriority } from '@/types/checklist';
import type { Geofence } from '@/types/geofence';

type DraftItem = {
  key: string;
  name: string;
  priority: ItemPriority;
};

type FormState = {
  name: string;
  geofenceIds: string[];
  items: DraftItem[];
  newItemText: string;
};

type Props = {
  geofences: Geofence[];
  initialValue?: {
    name: string;
    geofenceIds: string[];
    items: Array<{ id: string; name: string; priority: ItemPriority }>;
  };
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (input: ChecklistInput) => void | Promise<void>;
  onDelete?: () => void;
  deleting?: boolean;
};

const PRIORITY_CYCLE: ItemPriority[] = [
  'medium',
  'high',
  'critical',
  'low',
];

const PRIORITY_LABEL = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} satisfies Record<ItemPriority, string>;

const PRIORITY_COLOR = {
  critical: Colors.accent.DEFAULT,
  high: '#f59e0b',
  medium: Colors.primary[600],
  low: Colors.text.muted,
} satisfies Record<ItemPriority, string>;

function makeKey(): string {
  return `draft-${Math.random().toString(36).slice(2)}`;
}

export function ChecklistForm({
  geofences,
  initialValue,
  submitLabel,
  submitting = false,
  onSubmit,
  onDelete,
  deleting = false,
}: Props) {
  const [state, setState] = useState<FormState>(() => ({
    name: initialValue?.name ?? '',
    geofenceIds: initialValue?.geofenceIds ?? [],
    items:
      initialValue?.items.map((i) => ({
        key: i.id,
        name: i.name,
        priority: i.priority,
      })) ?? [],
    newItemText: '',
  }));

  const toggleGeofence = (id: string) => {
    setState((s) => ({
      ...s,
      geofenceIds: s.geofenceIds.includes(id)
        ? s.geofenceIds.filter((g) => g !== id)
        : [...s.geofenceIds, id],
    }));
  };

  const addItem = () => {
    const text = state.newItemText.trim();
    if (text.length === 0) return;
    setState((s) => ({
      ...s,
      items: [
        ...s.items,
        { key: makeKey(), name: text, priority: 'medium' },
      ],
      newItemText: '',
    }));
  };

  const removeItem = (key: string) => {
    setState((s) => ({
      ...s,
      items: s.items.filter((i) => i.key !== key),
    }));
  };

  const moveItem = (key: string, dir: -1 | 1) => {
    setState((s) => {
      const idx = s.items.findIndex((i) => i.key === key);
      if (idx === -1) return s;
      const target = idx + dir;
      if (target < 0 || target >= s.items.length) return s;
      const next = s.items.slice();
      const [m] = next.splice(idx, 1);
      if (!m) return s;
      next.splice(target, 0, m);
      return { ...s, items: next };
    });
  };

  const cyclePriority = (key: string) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => {
        if (it.key !== key) return it;
        const cur = PRIORITY_CYCLE.indexOf(it.priority);
        const next =
          PRIORITY_CYCLE[(cur + 1) % PRIORITY_CYCLE.length] ?? 'medium';
        return { ...it, priority: next };
      }),
    }));
  };

  const renameItem = (key: string, name: string) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.key === key ? { ...it, name } : it)),
    }));
  };

  const submit = async () => {
    if (!state.name.trim()) {
      Alert.alert(
        'Name required',
        'Please give your checklist a name.'
      );
      return;
    }
    if (state.items.length === 0) {
      Alert.alert(
        'Add at least one item',
        'Type an item name and tap + to add it.'
      );
      return;
    }
    const cleaned = state.items
      .map((i) => ({ ...i, name: i.name.trim() }))
      .filter((i) => i.name.length > 0);
    if (cleaned.length === 0) {
      Alert.alert(
        'Empty items',
        'Item names cannot be blank.'
      );
      return;
    }
    const input: ChecklistInput = {
      name: state.name.trim(),
      geofenceIds: state.geofenceIds,
      items: cleaned.map((i, idx) => ({
        id: i.key.startsWith('draft-') ? undefined : i.key,
        name: i.name,
        priority: i.priority,
        sortOrder: idx,
      })),
    };
    await onSubmit(input);
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 64 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <Text className="text-slate-700 font-medium text-sm">Name</Text>
        <TextInput
          accessibilityLabel="Checklist name"
          value={state.name}
          onChangeText={(t) => setState((s) => ({ ...s, name: t }))}
          placeholder="Leaving Home, Going to Gym…"
          placeholderTextColor="#94a3b8"
          autoCapitalize="words"
          className="min-h-[48px] rounded-input border border-slate-200 bg-surface px-3 text-slate-800"
        />
      </View>

      <View className="gap-2">
        <Text className="text-slate-700 font-medium text-sm">
          Linked geofences
        </Text>
        {geofences.length === 0 ? (
          <Text className="text-slate-500 text-sm">
            No geofences yet. Create one in the Geofences tab.
          </Text>
        ) : (
          <View className="gap-2">
            {geofences.map((g) => {
              const selected = state.geofenceIds.includes(g.id);
              return (
                <Pressable
                  key={g.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`Link to ${g.name}`}
                  onPress={() => toggleGeofence(g.id)}
                  style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
                  className="flex-row items-center gap-3 px-3 py-2 rounded-card bg-surface border border-slate-200"
                >
                  <View
                    className="w-6 h-6 rounded items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: selected
                        ? Colors.primary[600]
                        : '#94a3b8',
                      backgroundColor: selected
                        ? Colors.primary[600]
                        : 'transparent',
                    }}
                  >
                    {selected ? (
                      <Check stroke="#ffffff" size={14} />
                    ) : null}
                  </View>
                  <Text
                    className="text-slate-800 flex-1"
                    numberOfLines={1}
                  >
                    {g.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-slate-700 font-medium text-sm">Items</Text>
        {state.items.map((item, idx) => (
          <View
            key={item.key}
            className="flex-row items-center gap-2 bg-surface border border-slate-200 rounded-card px-3 py-2"
            style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
          >
            <View className="flex-1">
              <TextInput
                accessibilityLabel={`Item ${idx + 1} name`}
                value={item.name}
                onChangeText={(t) => renameItem(item.key, t)}
                className="text-slate-800"
                placeholder="Item name"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cycle priority for ${item.name}`}
              onPress={() => cyclePriority(item.key)}
              style={{ minHeight: Config.a11y.MIN_TAP_TARGET, justifyContent: 'center' }}
            >
              <View
                style={{
                  backgroundColor: `${PRIORITY_COLOR[item.priority]}33`,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
              <Text
                className="text-xs font-semibold"
                style={{ color: PRIORITY_COLOR[item.priority] }}
              >
                {PRIORITY_LABEL[item.priority]}
              </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Move ${item.name} up`}
              onPress={() => moveItem(item.key, -1)}
              disabled={idx === 0}
              className="w-9 h-9 items-center justify-center rounded-md bg-slate-200"
              style={{ opacity: idx === 0 ? 0.4 : 1 }}
            >
              <ArrowUp stroke={Colors.text.muted} size={16} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Move ${item.name} down`}
              onPress={() => moveItem(item.key, 1)}
              disabled={idx === state.items.length - 1}
              className="w-9 h-9 items-center justify-center rounded-md bg-slate-200"
              style={{
                opacity: idx === state.items.length - 1 ? 0.4 : 1,
              }}
            >
              <ArrowDown stroke={Colors.text.muted} size={16} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.name}`}
              onPress={() => removeItem(item.key)}
              className="w-9 h-9 items-center justify-center rounded-md bg-accent/20"
            >
              <Trash2 stroke={Colors.accent.DEFAULT} size={16} />
            </Pressable>
          </View>
        ))}

        <View className="flex-row items-center gap-2 mt-1">
          <View className="flex-1">
            <TextInput
              accessibilityLabel="New item name"
              value={state.newItemText}
              onChangeText={(t) =>
                setState((s) => ({ ...s, newItemText: t }))
              }
              onSubmitEditing={addItem}
              returnKeyType="done"
              placeholder="Add an item"
              placeholderTextColor="#94a3b8"
              className="min-h-[48px] rounded-input border border-slate-200 bg-surface px-3 text-slate-800"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add item"
            onPress={addItem}
            className="w-12 h-12 items-center justify-center rounded-full bg-primary-600"
          >
            <Plus stroke="#ffffff" size={22} />
          </Pressable>
        </View>
      </View>

      <Button
        label={submitLabel}
        onPress={submit}
        loading={submitting}
      />

      {onDelete ? (
        <Button
          label="Delete checklist"
          variant="ghost"
          loading={deleting}
          onPress={onDelete}
        />
      ) : null}
    </ScrollView>
  );
}
