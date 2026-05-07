export type ItemPriority = 'critical' | 'high' | 'medium' | 'low';

export type RecurrencePattern =
  | 'daily'
  | 'weekdays'
  | 'weekly_monday'
  | 'weekly_sunday'
  | null;

export type ChecklistItem = {
  id: string;
  checklistId: string;
  name: string;
  priority: ItemPriority;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Checklist = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern;
  items: ChecklistItem[];
  geofenceIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ChecklistInstance = {
  id: string;
  checklistId: string;
  geofenceId: string;
  checkedItemIds: string[];
  completionPct: number;
  triggeredAt: string;
  completedAt: string | null;
};

export type ActiveSession = {
  checklistId: string;
  geofenceId: string;
  checkedItemIds: Set<string>;
  startedAt: Date;
};

export type ChecklistInput = {
  name: string;
  description?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  items: Array<Pick<ChecklistItem, 'name' | 'priority' | 'sortOrder'> & { id?: string }>;
  geofenceIds: string[];
};
