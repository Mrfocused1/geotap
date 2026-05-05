import { mockAuthService } from '@/services/mock/mockAuthService';
import { mockChecklistService } from '@/services/mock/mockChecklistService';
import { mockGeofenceService } from '@/services/mock/mockGeofenceService';
import { supabaseAuthService } from '@/services/supabase/supabaseAuthService';
import { supabaseChecklistService } from '@/services/supabase/supabaseChecklistService';
import { supabaseGeofenceService } from '@/services/supabase/supabaseGeofenceService';
import { geocodingService } from '@/services/geocodingService';
import type { IAuthService } from '@/services/interfaces/IAuthService';
import type { IChecklistService } from '@/services/interfaces/IChecklistService';
import type { IGeofenceService } from '@/services/interfaces/IGeofenceService';
import type { IGeocodingService } from '@/services/interfaces/IGeocodingService';

export const USE_MOCK = true as const;

export const authService: IAuthService = USE_MOCK
  ? mockAuthService
  : supabaseAuthService;

export const geofenceService: IGeofenceService = USE_MOCK
  ? mockGeofenceService
  : supabaseGeofenceService;

export const checklistService: IChecklistService = USE_MOCK
  ? mockChecklistService
  : supabaseChecklistService;

export { geocodingService };
export type { IGeocodingService };
