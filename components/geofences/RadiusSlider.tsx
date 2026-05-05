import Slider from '@react-native-community/slider';
import { Text, View } from 'react-native';
import { Config } from '@/constants/config';
import { Colors } from '@/constants/colors';

type Props = {
  value: number;
  onChange: (next: number) => void;
};

function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function RadiusSlider({ value, onChange }: Props) {
  const { MIN_RADIUS_METERS, MAX_RADIUS_METERS } = Config.geofence;
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Text className="text-slate-700 dark:text-slate-700 font-medium text-sm">
          Radius
        </Text>
        <Text
          accessible={true}
          accessibilityLabel={`Radius ${formatRadius(value)}`}
          className="text-primary-600 font-semibold text-sm"
        >
          {formatRadius(value)}
        </Text>
      </View>
      <Slider
        minimumValue={MIN_RADIUS_METERS}
        maximumValue={MAX_RADIUS_METERS}
        step={10}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.primary[600]}
        maximumTrackTintColor={Colors.border.dark}
        thumbTintColor={Colors.primary[600]}
      />
      <View className="flex-row justify-between">
        <Text className="text-slate-500 text-xs">
          {formatRadius(MIN_RADIUS_METERS)}
        </Text>
        <Text className="text-slate-500 text-xs">
          {formatRadius(MAX_RADIUS_METERS)}
        </Text>
      </View>
    </View>
  );
}
