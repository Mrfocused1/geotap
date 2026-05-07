import { useAuthStore } from '@/stores/useAuthStore';
import { PLANS } from '@/constants/plans';
import type { Plan } from '@/constants/plans';

type PlanLimitHelpers = {
  plan: Plan;
  canAddGeofence: (currentCount: number) => boolean;
  canAddChecklist: (currentCount: number) => boolean;
  canAddItem: (currentCount: number) => boolean;
  geofenceLimit: number;
  checklistLimit: number;
  itemLimit: number;
};

export function usePlanLimits(): PlanLimitHelpers {
  const planId = useAuthStore((s) => s.user?.planId ?? 'free');
  const plan = PLANS[planId] ?? PLANS.free;

  return {
    plan,
    canAddGeofence: (n) => plan.limits.geofences === -1 || n < plan.limits.geofences,
    canAddChecklist: (n) => plan.limits.checklists === -1 || n < plan.limits.checklists,
    canAddItem: (n) => plan.limits.itemsPerChecklist === -1 || n < plan.limits.itemsPerChecklist,
    geofenceLimit: plan.limits.geofences,
    checklistLimit: plan.limits.checklists,
    itemLimit: plan.limits.itemsPerChecklist,
  };
}
