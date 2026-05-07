import { supabase } from '@/services/supabase/client';
import type { IGeofenceService } from '@/services/interfaces/IGeofenceService';
import type { Geofence, GeofenceInput } from '@/types/geofence';

type GeofenceRow = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function toGeofence(row: GeofenceRow): Geofence {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius_meters,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseGeofenceService: IGeofenceService = {
  async listForUser(userId): Promise<Geofence[]> {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .returns<GeofenceRow[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map(toGeofence);
  },

  async get(id): Promise<Geofence | null> {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('id', id)
      .single<GeofenceRow>();
    if (error) return null;
    return toGeofence(data);
  },

  async create(userId, input: GeofenceInput): Promise<Geofence> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('geofences')
      .insert({
        user_id: userId,
        name: input.name,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        radius_meters: input.radiusMeters,
        is_active: input.isActive,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single<GeofenceRow>();
    if (error) throw new Error(error.message);
    return toGeofence(data);
  },

  async update(id, patch): Promise<Geofence> {
    const updates: Partial<GeofenceRow> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.address !== undefined) updates.address = patch.address;
    if (patch.latitude !== undefined) updates.latitude = patch.latitude;
    if (patch.longitude !== undefined) updates.longitude = patch.longitude;
    if (patch.radiusMeters !== undefined) updates.radius_meters = patch.radiusMeters;
    if (patch.isActive !== undefined) updates.is_active = patch.isActive;

    const { data, error } = await supabase
      .from('geofences')
      .update(updates)
      .eq('id', id)
      .select()
      .single<GeofenceRow>();
    if (error) throw new Error(error.message);
    return toGeofence(data);
  },

  async delete(id): Promise<void> {
    const { error } = await supabase.from('geofences').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async setActive(id, isActive): Promise<Geofence> {
    const { data, error } = await supabase
      .from('geofences')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single<GeofenceRow>();
    if (error) throw new Error(error.message);
    return toGeofence(data);
  },
};
