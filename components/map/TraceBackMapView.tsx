import { forwardRef } from 'react';
import type { ComponentRef } from 'react';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import type { MapViewProps, Region } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export type TraceBackMapHandle = ComponentRef<typeof MapView>;

type Props = Omit<MapViewProps, 'provider'> & {
  initialRegion: Region;
};

export const TraceBackMapView = forwardRef<TraceBackMapHandle, Props>(
  function TraceBackMapView({ style, ...rest }, ref) {
    return (
      <MapView
        ref={ref}
        provider={PROVIDER_DEFAULT}
        style={[styles.map, style]}
        showsUserLocation
        showsMyLocationButton
        {...rest}
      />
    );
  }
);

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
