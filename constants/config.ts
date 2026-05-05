export const Config = {
  geofence: {
    MIN_RADIUS_METERS: 50,
    MAX_RADIUS_METERS: 2000,
    DEFAULT_RADIUS_METERS: 150,
    MAX_GEOFENCES: 20,
  },
  session: {
    RESTORE_WINDOW_MS: 2 * 60 * 60 * 1000,
  },
  geocoding: {
    DEBOUNCE_MS: 500,
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org/search',
    USER_AGENT: 'TraceBackApp/0.1 (contact@traceback.app)',
  },
  storage: {
    SESSION_KEY: '@traceback/session',
    ACTIVE_SESSION_KEY: '@traceback/active-session',
    ONBOARDING_KEY: '@traceback/onboarding-complete',
  },
  tasks: {
    GEOFENCE_TASK: 'GEOFENCE_TASK',
  },
  snoozeOptions: [5, 15, 30, 60] as const,
  a11y: {
    MIN_TAP_TARGET: 48,
  },
} as const;
