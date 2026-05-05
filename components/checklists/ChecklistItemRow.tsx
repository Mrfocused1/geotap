import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import type { ChecklistItem, ItemPriority } from '@/types/checklist';

type Props = {
  item: ChecklistItem;
  checked: boolean;
  onToggle: (itemId: string) => void;
  highlightCritical?: boolean;
};

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

export function ChecklistItemRow({
  item,
  checked,
  onToggle,
  highlightCritical = false,
}: Props) {
  const isCriticalUnchecked =
    highlightCritical && !checked && item.priority === 'critical';
  const containerClass = isCriticalUnchecked
    ? 'flex-row items-center gap-3 px-4 py-3 rounded-card bg-accent/15 border border-accent/40'
    : 'flex-row items-center gap-3 px-4 py-3 rounded-card bg-surface border border-slate-200';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${item.name}, priority ${PRIORITY_LABEL[item.priority]}`}
      onPress={() => onToggle(item.id)}
      style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
      className={containerClass}
    >
      <View
        className="w-7 h-7 rounded-md items-center justify-center"
        style={{
          borderWidth: 2,
          borderColor: checked
            ? Colors.primary[600]
            : '#94a3b8',
          backgroundColor: checked ? Colors.primary[600] : 'transparent',
        }}
      >
        {checked ? <Check stroke="#ffffff" size={18} /> : null}
      </View>
      <View className="flex-1">
        <Text
          className="text-base"
          style={{
            color: checked ? Colors.text.muted : Colors.text.light,
            textDecorationLine: checked ? 'line-through' : 'none',
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: `${PRIORITY_COLOR[item.priority]}33`,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          alignSelf: 'center',
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
  );
}
