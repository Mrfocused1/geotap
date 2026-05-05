import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import type { Region } from 'react-native-maps';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { TraceBackMapView } from '@/components/map/TraceBackMapView';
import type { TraceBackMapHandle } from '@/components/map/TraceBackMapView';
import { GeofenceCircle } from '@/components/map/GeofenceCircle';
import { GeofenceMarker } from '@/components/map/GeofenceMarker';
import { RadiusSlider } from '@/components/geofences/RadiusSlider';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import { geocodingService } from '@/services';
import type { GeocodingResult } from '@/services/interfaces/IGeocodingService';
import type { GeofenceInput } from '@/types/geofence';

type Props = {
  initialValue?: Partial<GeofenceInput>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (input: GeofenceInput) => void | Promise<void>;
  onDelete?: () => void;
  deleting?: boolean;
};

type FormState = {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  isActive: boolean;
};

export function GeofenceForm({
  initialValue,
  submitLabel,
  submitting = false,
  onSubmit,
  onDelete,
  deleting = false,
}: Props) {
  const [state, setState] = useState<FormState>({
    name: initialValue?.name ?? '',
    address: initialValue?.address ?? '',
    latitude: initialValue?.latitude ?? null,
    longitude: initialValue?.longitude ?? null,
    radiusMeters:
      initialValue?.radiusMeters ?? Config.geofence.DEFAULT_RADIUS_METERS,
    isActive: initialValue?.isActive ?? true,
  });

  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const mapRef = useRef<TraceBackMapHandle | null>(null);

  useEffect(() => {
    return () => geocodingService.cancel();
  }, []);

  const onAddressChange = (text: string) => {
    setState((s) => ({ ...s, address: text }));
    setSearchError(null);
    if (text.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    geocodingService
      .search(text)
      .then((r) => {
        setResults(r);
        setSearching(false);
      })
      .catch((e) => {
        setSearching(false);
        setSearchError(e instanceof Error ? e.message : 'search failed');
      });
  };

  const onSelectResult = (r: GeocodingResult) => {
    setState((s) => ({
      ...s,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
    setShowResults(false);
    mapRef.current?.animateToRegion(
      {
        latitude: r.latitude,
        longitude: r.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400
    );
  };

  const onUseMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location required',
        'Allow location access in Settings to use your current position.'
      );
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState((s) => ({
        ...s,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        address: s.address || 'Current location',
      }));
      mapRef.current?.animateToRegion(
        {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400
      );
    } catch (e) {
      Alert.alert(
        'Location error',
        e instanceof Error ? e.message : 'Could not read location.'
      );
    }
  };

  const submit = async () => {
    if (!state.name.trim()) {
      Alert.alert('Name required', 'Please give your geofence a name.');
      return;
    }
    if (state.latitude == null || state.longitude == null) {
      Alert.alert(
        'Location required',
        'Search an address or use your current location to pick a spot.'
      );
      return;
    }
    const input: GeofenceInput = {
      name: state.name.trim(),
      address: state.address.trim() || 'Saved location',
      latitude: state.latitude,
      longitude: state.longitude,
      radiusMeters: state.radiusMeters,
      isActive: state.isActive,
    };
    await onSubmit(input);
  };

  const initialRegion: Region = {
    latitude: state.latitude ?? 37.7749,
    longitude: state.longitude ?? -122.4194,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 64 }}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Address"
        value={state.address}
        onChangeText={onAddressChange}
        placeholder="Search an address or place"
      />
      {showResults ? (
        <View className="bg-white rounded-card border border-slate-200 max-h-56">
          {searching ? (
            <View className="p-4 flex-row items-center gap-2">
              <ActivityIndicator color={Colors.primary[600]} />
              <Text className="text-slate-600">Searching…</Text>
            </View>
          ) : searchError ? (
            <Text className="p-4 text-accent text-sm">{searchError}</Text>
          ) : results.length === 0 ? (
            <Text className="p-4 text-slate-500 text-sm">No matches.</Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(r, i) => `${r.latitude},${r.longitude},${i}`}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Pick ${item.address}`}
                  onPress={() => onSelectResult(item)}
                  className="px-4 py-3 border-b border-slate-200"
                >
                  <Text className="text-slate-800 text-sm">
                    {item.address}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use my location"
        onPress={onUseMyLocation}
        className="flex-row items-center gap-2 self-start"
      >
        <LocateFixed stroke={Colors.primary[600]} size={16} />
        <Text className="text-primary-600 font-medium">Use my location</Text>
      </Pressable>

      <View
        className="rounded-card overflow-hidden border border-slate-200"
        style={{ height: 280 }}
      >
        <TraceBackMapView ref={mapRef} initialRegion={initialRegion}>
          {state.latitude != null && state.longitude != null ? (
            <>
              <GeofenceMarker
                latitude={state.latitude}
                longitude={state.longitude}
                title={state.name || 'New geofence'}
              />
              <GeofenceCircle
                latitude={state.latitude}
                longitude={state.longitude}
                radiusMeters={state.radiusMeters}
              />
            </>
          ) : null}
        </TraceBackMapView>
      </View>

      <RadiusSlider
        value={state.radiusMeters}
        onChange={(v) => setState((s) => ({ ...s, radiusMeters: v }))}
      />

      <TextField
        label="Name"
        value={state.name}
        onChangeText={(t) => setState((s) => ({ ...s, name: t }))}
        placeholder="Home, Office, Gym…"
        autoCapitalize="words"
      />

      <Button
        label={submitLabel}
        onPress={submit}
        loading={submitting}
      />

      {onDelete ? (
        <Button
          label="Delete geofence"
          variant="ghost"
          loading={deleting}
          onPress={onDelete}
        />
      ) : null}
    </ScrollView>
  );
}
