import { distanceMeters } from '@/services/geofence/distance';

describe('distanceMeters', () => {
  it('returns 0 for identical points', () => {
    expect(distanceMeters(37.7, -122.4, 37.7, -122.4)).toBeCloseTo(0, 1);
  });

  it('matches expected km between SF and Oakland (~13km)', () => {
    const m = distanceMeters(37.7749, -122.4194, 37.8044, -122.2712);
    expect(m).toBeGreaterThan(12000);
    expect(m).toBeLessThan(15000);
  });
});
