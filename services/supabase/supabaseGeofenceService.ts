import type { IGeofenceService } from '@/services/interfaces/IGeofenceService';

// TODO: Plan 5 — wire to Supabase
export const supabaseGeofenceService: IGeofenceService = {
  async listForUser() { throw new Error('not implemented'); },
  async get() { throw new Error('not implemented'); },
  async create() { throw new Error('not implemented'); },
  async update() { throw new Error('not implemented'); },
  async delete() { throw new Error('not implemented'); },
  async setActive() { throw new Error('not implemented'); },
};
