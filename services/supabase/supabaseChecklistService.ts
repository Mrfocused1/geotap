import type { IChecklistService } from '@/services/interfaces/IChecklistService';

// TODO: Plan 5 — wire to Supabase
export const supabaseChecklistService: IChecklistService = {
  async listForUser() { throw new Error('not implemented'); },
  async get() { throw new Error('not implemented'); },
  async create() { throw new Error('not implemented'); },
  async update() { throw new Error('not implemented'); },
  async delete() { throw new Error('not implemented'); },
  async listForGeofence() { throw new Error('not implemented'); },
  async recordInstance() { throw new Error('not implemented'); },
  async listInstancesForChecklist() { throw new Error('not implemented'); },
};
