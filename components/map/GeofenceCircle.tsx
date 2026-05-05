import { Circle } from 'react-native-maps';
import { Colors } from '@/constants/colors';

type Props = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive?: boolean;
};

export function GeofenceCircle({
  latitude,
  longitude,
  radiusMeters,
  isActive = true,
}: Props) {
  const stroke = isActive ? Colors.primary[600] : Colors.text.muted;
  const fill = isActive
    ? 'rgba(13, 148, 136, 0.18)'
    : 'rgba(100, 116, 139, 0.18)';
  return (
    <Circle
      center={{ latitude, longitude }}
      radius={radiusMeters}
      strokeColor={stroke}
      fillColor={fill}
      strokeWidth={2}
    />
  );
}
