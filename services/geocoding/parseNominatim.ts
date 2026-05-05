import type { GeocodingResult } from '@/services/interfaces/IGeocodingService';

type NominatimRaw = {
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
};

export function parseNominatimResponse(raw: unknown): GeocodingResult[] {
  if (!Array.isArray(raw)) return [];
  const out: GeocodingResult[] = [];
  for (const item of raw as NominatimRaw[]) {
    if (
      typeof item?.display_name !== 'string' ||
      typeof item?.lat !== 'string' ||
      typeof item?.lon !== 'string'
    ) {
      continue;
    }
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    out.push({
      address: item.display_name,
      latitude: lat,
      longitude: lon,
    });
  }
  return out.slice(0, 5);
}
