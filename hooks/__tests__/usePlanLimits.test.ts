import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAuthStore } from '@/stores/useAuthStore';

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

// Suppress React hook rule lint — we call hooks in a test wrapper below
jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// usePlanLimits is a hook but we can call it directly since it only reads state
// via a mocked selector — no DOM/render context needed.
function callHook() {
  return (mockUseAuthStore as unknown as (sel: (s: { user: { planId: string } | null }) => string) => string)(
    (s) => s?.user?.planId ?? 'free'
  );
}

describe('usePlanLimits — unit tests against PLANS config', () => {
  it('free plan: geofenceLimit=2, checklistLimit=2, itemLimit=5', () => {
    mockUseAuthStore.mockReturnValue('free' as never);
    const { plan, geofenceLimit, checklistLimit, itemLimit, canAddGeofence, canAddChecklist } = usePlanLimits();
    expect(plan.id).toBe('free');
    expect(geofenceLimit).toBe(2);
    expect(checklistLimit).toBe(2);
    expect(itemLimit).toBe(5);
    expect(canAddGeofence(1)).toBe(true);
    expect(canAddGeofence(2)).toBe(false);
    expect(canAddChecklist(2)).toBe(false);
  });

  it('pro plan: 10 geofences, unlimited checklists/items', () => {
    mockUseAuthStore.mockReturnValue('pro' as never);
    const { plan, geofenceLimit, checklistLimit, canAddChecklist, canAddItem } = usePlanLimits();
    expect(plan.id).toBe('pro');
    expect(geofenceLimit).toBe(10);
    expect(checklistLimit).toBe(-1);
    expect(canAddChecklist(9999)).toBe(true);
    expect(canAddItem(9999)).toBe(true);
  });

  it('unlimited plan: everything allowed', () => {
    mockUseAuthStore.mockReturnValue('unlimited' as never);
    const { canAddGeofence, canAddChecklist, canAddItem } = usePlanLimits();
    expect(canAddGeofence(9999)).toBe(true);
    expect(canAddChecklist(9999)).toBe(true);
    expect(canAddItem(9999)).toBe(true);
  });

  it('defaults to free when planId is missing', () => {
    mockUseAuthStore.mockReturnValue(undefined as never);
    const { plan } = usePlanLimits();
    expect(plan.id).toBe('free');
  });
});
