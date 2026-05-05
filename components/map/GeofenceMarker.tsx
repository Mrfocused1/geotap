import { Marker } from 'react-native-maps';
import { Colors } from '@/constants/colors';

type Props = {
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  isActive?: boolean;
  onPress?: () => void;
};

export function GeofenceMarker({
  latitude,
  longitude,
  title,
  description,
  isActive = true,
  onPress,
}: Props) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={title}
      description={description}
      pinColor={isActive ? Colors.primary[600] : Colors.text.muted}
      onPress={onPress}
    />
  );
}
