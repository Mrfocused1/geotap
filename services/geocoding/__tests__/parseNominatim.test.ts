import { parseNominatimResponse } from '@/services/geocoding/parseNominatim';

describe('parseNominatimResponse', () => {
  it('returns [] for non-array input', () => {
    expect(parseNominatimResponse(null)).toEqual([]);
    expect(parseNominatimResponse({})).toEqual([]);
    expect(parseNominatimResponse('boom')).toEqual([]);
  });

  it('parses well-formed entries into GeocodingResult', () => {
    const raw = [
      { display_name: '1 Main St, City', lat: '37.7749', lon: '-122.4194' },
    ];
    expect(parseNominatimResponse(raw)).toEqual([
      {
        address: '1 Main St, City',
        latitude: 37.7749,
        longitude: -122.4194,
      },
    ]);
  });

  it('skips entries with missing fields or non-numeric lat/lon', () => {
    const raw = [
      { display_name: 'A', lat: 'oops', lon: '-122' },
      { display_name: 'B', lat: '37', lon: '-122' },
      { lat: '37', lon: '-122' },
    ];
    expect(parseNominatimResponse(raw)).toEqual([
      { address: 'B', latitude: 37, longitude: -122 },
    ]);
  });

  it('caps results at 5', () => {
    const raw = Array.from({ length: 8 }, (_, i) => ({
      display_name: `entry ${i}`,
      lat: '37',
      lon: '-122',
    }));
    expect(parseNominatimResponse(raw)).toHaveLength(5);
  });
});
