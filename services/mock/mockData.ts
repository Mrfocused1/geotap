import type { Checklist, ChecklistItem } from '@/types/checklist';
import type { Geofence } from '@/types/geofence';
import type { User } from '@/types/user';

const NOW = '2026-05-05T00:00:00.000Z';

export const MOCK_USER: User = {
  id: 'user-mock-1',
  email: 'demo@traceback.app',
  displayName: 'Demo User',
  avatarUrl: null,
  notificationSettings: {
    globalEnabled: true,
    sound: true,
    vibration: true,
  },
  planId: 'free',
  createdAt: NOW,
  updatedAt: NOW,
};

export const MOCK_GEOFENCES: Geofence[] = [
  {
    id: 'gf-home',
    userId: MOCK_USER.id,
    name: 'Home',
    address: '123 Mock Lane, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    radiusMeters: 150,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'gf-office',
    userId: MOCK_USER.id,
    name: 'Office',
    address: '500 Market Street, San Francisco, CA',
    latitude: 37.7935,
    longitude: -122.3964,
    radiusMeters: 200,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'gf-gym',
    userId: MOCK_USER.id,
    name: 'Gym',
    address: '1 Fitness Ave, San Francisco, CA',
    latitude: 37.7836,
    longitude: -122.4089,
    radiusMeters: 100,
    isActive: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const homeItems: ChecklistItem[] = [
  {
    id: 'it-keys',
    checklistId: 'cl-leaving-home',
    name: 'Keys',
    priority: 'critical',
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'it-wallet',
    checklistId: 'cl-leaving-home',
    name: 'Wallet',
    priority: 'critical',
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'it-phone',
    checklistId: 'cl-leaving-home',
    name: 'Phone charger',
    priority: 'high',
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'it-mask',
    checklistId: 'cl-leaving-home',
    name: 'Mask',
    priority: 'medium',
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const officeItems: ChecklistItem[] = [
  {
    id: 'it-laptop',
    checklistId: 'cl-leaving-office',
    name: 'Laptop',
    priority: 'critical',
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'it-laptop-charger',
    checklistId: 'cl-leaving-office',
    name: 'Laptop charger',
    priority: 'high',
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'it-badge',
    checklistId: 'cl-leaving-office',
    name: 'Badge',
    priority: 'medium',
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: 'cl-leaving-home',
    userId: MOCK_USER.id,
    name: 'Leaving Home',
    description: 'Daily essentials',
    isRecurring: true,
    recurrencePattern: 'daily',
    items: homeItems,
    geofenceIds: ['gf-home'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'cl-leaving-office',
    userId: MOCK_USER.id,
    name: 'Leaving Office',
    description: null,
    isRecurring: true,
    recurrencePattern: 'weekdays',
    items: officeItems,
    geofenceIds: ['gf-office'],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const MOCK_NOW = NOW;
