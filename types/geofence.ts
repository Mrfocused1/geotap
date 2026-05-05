export type Geofence = {
  id: string;
  userId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GeofenceInput = Omit<
  Geofence,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;
