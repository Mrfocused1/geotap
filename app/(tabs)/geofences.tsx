import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { List, Map as MapIcon, Plus } from 'lucide-react-native';
import type { Region } from 'react-native-maps';
import { TraceBackMapView } from '@/components/map/TraceBackMapView';
import { GeofenceCircle } from '@/components/map/GeofenceCircle';
import { GeofenceMarker } from '@/components/map/GeofenceMarker';
import { GeofenceCard } from '@/components/geofences/GeofenceCard';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeofenceStore } from '@/stores/useGeofenceStore';

type ViewMode = 'map' | 'list';

const FALLBACK_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function GeofencesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const geofences = useGeofenceStore((s) => s.geofences);
  const isLoading = useGeofenceStore((s) => s.isLoading);
  const loadGeofences = useGeofenceStore((s) => s.loadGeofences);
  const deleteGeofence = useGeofenceStore((s) => s.deleteGeofence);
  const toggleActive = useGeofenceStore((s) => s.toggleActive);

  const [mode, setMode] = useState<ViewMode>('map');

  useEffect(() => {
    if (user) loadGeofences(user.id);
  }, [user, loadGeofences]);

  const initialRegion = useMemo<Region>(() => {
    const first = geofences[0];
    if (!first) return FALLBACK_REGION;
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [geofences]);

  const onCreate = () => {
    if (geofences.length >= Config.geofence.MAX_GEOFENCES) {
      Alert.alert(
        'Limit reached',
        `You can save up to ${Config.geofence.MAX_GEOFENCES} geofences. Delete one to add a new one.`
      );
      return;
    }
    router.push('/geofences/create');
  };

  const onEdit = (id: string) => {
    router.push(`/geofences/${id}`);
  };

  const onDelete = (id: string) => {
    const g = geofences.find((x) => x.id === id);
    Alert.alert(
      'Delete geofence?',
      g ? `Delete "${g.name}"? This cannot be undone.` : 'Delete this geofence?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGeofence(id).catch((e) => {
              Alert.alert('Delete failed', String(e));
            });
          },
        },
      ]
    );
  };

  const onToggle = (id: string, _next: boolean) => {
    toggleActive(id).catch((e) => {
      Alert.alert('Toggle failed', String(e));
    });
  };

  return (
    <View className="flex-1 bg-surface-dark">
      <View className="px-6 pt-16 pb-3 flex-row items-center justify-between">
        <Text className="text-slate-50 text-3xl font-bold">Geofences</Text>
        <View className="flex-row bg-surface rounded-pill p-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Map view"
            onPress={() => setMode('map')}
            className={`min-h-[36px] px-3 rounded-pill items-center justify-center flex-row gap-1 ${
              mode === 'map' ? 'bg-primary-600' : ''
            }`}
          >
            <MapIcon
              stroke={mode === 'map' ? '#ffffff' : Colors.text.muted}
              size={16}
            />
            <Text
              className={
                mode === 'map'
                  ? 'text-white text-sm font-semibold'
                  : 'text-slate-400 text-sm'
              }
            >
              Map
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="List view"
            onPress={() => setMode('list')}
            className={`min-h-[36px] px-3 rounded-pill items-center justify-center flex-row gap-1 ${
              mode === 'list' ? 'bg-primary-600' : ''
            }`}
          >
            <List
              stroke={mode === 'list' ? '#ffffff' : Colors.text.muted}
              size={16}
            />
            <Text
              className={
                mode === 'list'
                  ? 'text-white text-sm font-semibold'
                  : 'text-slate-400 text-sm'
              }
            >
              List
            </Text>
          </Pressable>
        </View>
      </View>

      {mode === 'map' ? (
        <View className="flex-1">
          <TraceBackMapView initialRegion={initialRegion}>
            {geofences.map((g) => (
              <GeofenceMarker
                key={`m-${g.id}`}
                latitude={g.latitude}
                longitude={g.longitude}
                title={g.name}
                description={g.address}
                isActive={g.isActive}
                onPress={() => onEdit(g.id)}
              />
            ))}
            {geofences.map((g) => (
              <GeofenceCircle
                key={`c-${g.id}`}
                latitude={g.latitude}
                longitude={g.longitude}
                radiusMeters={g.radiusMeters}
                isActive={g.isActive}
              />
            ))}
          </TraceBackMapView>
        </View>
      ) : (
        <FlatList
          data={geofences}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 96,
            gap: 12,
          }}
          refreshing={isLoading}
          onRefresh={() => user && loadGeofences(user.id)}
          ListEmptyComponent={
            <Text className="text-slate-400 text-center mt-12">
              No geofences yet. Tap + to add your first.
            </Text>
          }
          renderItem={({ item }) => (
            <GeofenceCard
              geofence={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggle}
            />
          )}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create geofence"
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
    </View>
  );
}
