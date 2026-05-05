import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';
import { useNearestGeofence } from '@/hooks/useNearestGeofence';

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const geofences = useGeofenceStore((s) => s.geofences);
  const loadGeofences = useGeofenceStore((s) => s.loadGeofences);

  useEffect(() => {
    if (user) loadGeofences(user.id);
  }, [user, loadGeofences]);

  const { geofence: nearest, distanceMeters, permissionDenied } =
    useNearestGeofence();
  const activeCount = geofences.filter((g) => g.isActive).length;

  return (
    <View className="flex-1 bg-surface-dark px-6 pt-20 gap-4">
      <Text className="text-slate-50 text-3xl font-bold">
        Welcome, {user?.displayName ?? 'friend'}
      </Text>

      <View className="bg-surface rounded-card p-4 gap-2 border border-slate-700">
        <View className="flex-row items-center gap-2">
          <Navigation stroke={Colors.primary[600]} size={18} />
          <Text className="text-slate-300 text-sm">Nearest geofence</Text>
        </View>
        {nearest && distanceMeters != null ? (
          <>
            <Text className="text-slate-50 text-2xl font-semibold">
              {nearest.name}
            </Text>
            <Text className="text-slate-400">
              {formatDistance(distanceMeters)} away
            </Text>
          </>
        ) : permissionDenied ? (
          <Text className="text-slate-400">
            Allow location access to see your nearest geofence.
          </Text>
        ) : geofences.length === 0 ? (
          <Text className="text-slate-400">
            No geofences yet — add your first below.
          </Text>
        ) : (
          <Text className="text-slate-400">Locating…</Text>
        )}
      </View>

      <View className="bg-surface rounded-card p-4 flex-row items-center justify-between border border-slate-700">
        <View className="flex-row items-center gap-2">
          <MapPin stroke={Colors.primary[600]} size={18} />
          <Text className="text-slate-300">Active geofences</Text>
        </View>
        <Text className="text-slate-50 text-xl font-semibold">
          {activeCount}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add geofence"
        onPress={() => router.push('/geofences/create')}
        className="min-h-[48px] flex-row items-center justify-center gap-2 rounded-card bg-primary-600 px-5"
      >
        <Plus stroke="#ffffff" size={18} />
        <Text className="text-white font-semibold">Add geofence</Text>
      </Pressable>
    </View>
  );
}
