import { Pressable, Switch, Text, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import type { Geofence } from '@/types/geofence';
import { Colors } from '@/constants/colors';

type Props = {
  geofence: Geofence;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function GeofenceCard({
  geofence,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <View className="bg-surface dark:bg-surface rounded-card p-4 gap-3 border border-slate-700">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text
            className="text-slate-50 font-semibold text-lg"
            numberOfLines={1}
          >
            {geofence.name}
          </Text>
          <Text className="text-slate-400 text-sm mt-0.5" numberOfLines={2}>
            {geofence.address}
          </Text>
          <Text className="text-slate-500 text-xs mt-1">
            Radius: {formatRadius(geofence.radiusMeters)}
          </Text>
        </View>
        <Switch
          accessibilityLabel={`${geofence.name} active`}
          value={geofence.isActive}
          onValueChange={(v) => onToggleActive(geofence.id, v)}
          trackColor={{
            false: Colors.border.dark,
            true: Colors.primary[600],
          }}
          thumbColor="#ffffff"
        />
      </View>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${geofence.name}`}
          onPress={() => onEdit(geofence.id)}
          className="flex-1 min-h-[48px] flex-row items-center justify-center gap-2 rounded-input bg-slate-700"
        >
          <Pencil stroke={Colors.text.dark} size={16} />
          <Text className="text-slate-100 font-medium">Edit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${geofence.name}`}
          onPress={() => onDelete(geofence.id)}
          className="flex-1 min-h-[48px] flex-row items-center justify-center gap-2 rounded-input bg-accent/20"
        >
          <Trash2 stroke={Colors.accent.DEFAULT} size={16} />
          <Text className="text-accent font-medium">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
