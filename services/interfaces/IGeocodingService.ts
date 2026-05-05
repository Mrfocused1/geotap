export type GeocodingResult = {
  address: string;
  latitude: number;
  longitude: number;
};

export interface IGeocodingService {
  /**
   * Free-text address search. Debounced — repeated calls within
   * Config.geocoding.DEBOUNCE_MS only fire the most recent.
   * Returns up to 5 matches. Resolves [] on empty input.
   */
  search(query: string): Promise<GeocodingResult[]>;
  cancel(): void;
}
