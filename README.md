# Trace Back

Geofence-based checklist reminder app. See `docs/superpowers/specs/2026-05-05-trace-back-design.md`.

## Plan 1 status — Foundation & Auth ✅

All tasks complete. The app shell is runnable with mock data.

### What works
- Onboarding: 3-screen walkthrough shown on first install, with Skip button
- Auth: login, register, reset-password screens wired to mock auth service
- Session persistence: staying logged in across app restarts via AsyncStorage
- Tab navigation: 4-tab bottom bar (Home, Checklists, Geofences, Settings)
- Logout: Settings tab → Log out → back to login
- `USE_MOCK = true` in `services/index.ts` — all data is in-memory mock

### Run
```bash
npx expo start
```

### Test
```bash
npm test
```

### Manual E2E verification checklist
Test on both iOS simulator and Android emulator:

- [ ] First launch → onboarding screen shows (not login)
- [ ] Tap through all 3 onboarding slides → Get Started → register screen
- [ ] Skip button on any onboarding slide → register screen
- [ ] Register with name/email/password → Home tab, greeting shows name
- [ ] All 4 tabs render with correct icons and labels
- [ ] Active tab icon tinted teal
- [ ] Settings → Log out → login screen
- [ ] Force-quit + relaunch → login screen (no session, onboarding skipped)
- [ ] Login with any email/password → Home tab (mock always succeeds)
- [ ] Force-quit while logged in + relaunch → Home tab (session restored)
- [ ] Reset password screen → enter email → success alert → back to login

### Next: Plan 2 — Geofences
Map view, Nominatim address search, radius slider, geofence CRUD.

## Architecture

See full design spec at: `docs/superpowers/specs/2026-05-05-trace-back-design.md`

```
UI (expo-router screens)
  ↕
Zustand stores (useAuthStore, useGeofenceStore, useChecklistStore, useNotificationStore)
  ↕
Service layer (services/index.ts — USE_MOCK=true)
  ├── services/mock/     ← active now
  └── services/supabase/ ← wired in Plan 5
```
