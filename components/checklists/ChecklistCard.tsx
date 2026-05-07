import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ListChecks } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import type { Checklist } from '@/types/checklist';
import type { Geofence } from '@/types/geofence';

type Props = {
  checklist: Checklist;
  geofences: Geofence[];
  progressPct?: number;
  onPress: (id: string) => void;
};

export function ChecklistCard({
  checklist,
  geofences,
  progressPct = 0,
  onPress,
}: Props) {
  const [barWidth, setBarWidth] = useState(0);
  const linkedNames = checklist.geofenceIds
    .map((gid) => geofences.find((g) => g.id === gid)?.name)
    .filter((n): n is string => Boolean(n));
  const linkedLabel =
    linkedNames.length === 0
      ? 'No geofences linked'
      : linkedNames.join(' · ');
  const itemCount = checklist.items.length;
  const clamped = Math.max(0, Math.min(100, Math.round(progressPct)));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open checklist ${checklist.name}, ${clamped}% complete`}
      onPress={() => onPress(checklist.id)}
      className="bg-surface-light rounded-card border border-slate-200 overflow-hidden flex-row"
    >
      <View style={{ width: 4, backgroundColor: Colors.primary[600] }} />
      <View className="flex-1 p-4 gap-2">
        <View className="flex-row items-center gap-2">
          <ListChecks stroke={Colors.primary[600]} size={18} />
          <Text
            className="text-slate-900 font-semibold text-lg flex-1"
            numberOfLines={1}
          >
            {checklist.name}
          </Text>
        </View>
        <Text className="text-slate-500 text-sm" numberOfLines={1}>
          {linkedLabel}
        </Text>
        <Text className="text-slate-500 text-xs">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </Text>
        <View
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: clamped }}
          accessibilityLabel={`${clamped}% complete`}
          className="h-2 rounded-full bg-slate-200 overflow-hidden mt-1"
        >
          <View
            style={{
              width: barWidth * (clamped / 100),
              height: '100%',
              backgroundColor: Colors.primary[600],
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}
