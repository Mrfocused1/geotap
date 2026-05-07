export type PlanId = 'free' | 'pro' | 'unlimited';

export type PlanLimits = {
  geofences: number;     // -1 = unlimited
  checklists: number;    // -1 = unlimited
  itemsPerChecklist: number; // -1 = unlimited
  historyDays: number;   // 0 = none, -1 = unlimited
};

export type Plan = {
  id: PlanId;
  name: string;
  priceCents: number; // monthly, USD; 0 = free
  limits: PlanLimits;
  features: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    limits: { geofences: 2, checklists: 2, itemsPerChecklist: 5, historyDays: 0 },
    features: [
      '2 geofences',
      '2 checklists',
      '5 items per checklist',
      'Push notifications',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 399,
    limits: { geofences: 10, checklists: -1, itemsPerChecklist: -1, historyDays: 30 },
    features: [
      '10 geofences',
      'Unlimited checklists & items',
      '30-day session history',
      'Priority notification delivery',
    ],
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    priceCents: 799,
    limits: { geofences: -1, checklists: -1, itemsPerChecklist: -1, historyDays: -1 },
    features: [
      'Unlimited geofences',
      'Unlimited checklists & items',
      'Full session history',
      'Shared checklists (read-only link)',
      'Early access to new features',
    ],
  },
};

export function formatPrice(priceCents: number): string {
  if (priceCents === 0) return 'Free';
  return `$${(priceCents / 100).toFixed(2)}/mo`;
}

export function limitLabel(value: number): string {
  return value === -1 ? 'Unlimited' : String(value);
}
