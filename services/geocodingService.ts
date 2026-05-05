import { Config } from '@/constants/config';
import type {
  GeocodingResult,
  IGeocodingService,
} from '@/services/interfaces/IGeocodingService';
import { debounceAsync } from '@/services/geocoding/debounce';
import { parseNominatimResponse } from '@/services/geocoding/parseNominatim';

async function fetchNominatim(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const url =
    `${Config.geocoding.NOMINATIM_URL}` +
    `?q=${encodeURIComponent(trimmed)}` +
    `&format=json&limit=5&addressdetails=0`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': Config.geocoding.USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}`);
  }
  const json = await res.json();
  return parseNominatimResponse(json);
}

const debounced = debounceAsync(fetchNominatim, Config.geocoding.DEBOUNCE_MS);

export const geocodingService: IGeocodingService = {
  search(query) {
    return debounced.call(query);
  },
  cancel() {
    debounced.cancel();
  },
};
