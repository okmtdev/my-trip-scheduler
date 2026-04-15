export type CategoryType =
  | 'transportation'
  | 'meal'
  | 'event'
  | 'sightseeing'
  | 'accommodation';

export type TransportationType =
  | 'plane'
  | 'train'
  | 'bus'
  | 'car'
  | 'other';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  transportation: '移動',
  meal: '食事',
  event: 'イベント',
  sightseeing: '観光',
  accommodation: '宿泊',
};

export const TRANSPORTATION_LABELS: Record<TransportationType, string> = {
  plane: '飛行機',
  train: '電車',
  bus: 'バス',
  car: '車',
  other: 'その他',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  transportation: '🚀',
  meal: '🍽️',
  event: '🎉',
  sightseeing: '🏛️',
  accommodation: '🏨',
};

export const TRANSPORTATION_ICONS: Record<TransportationType, string> = {
  plane: '✈️',
  train: '🚆',
  bus: '🚌',
  car: '🚗',
  other: '🚶',
};

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  transportation: 'bg-blue-100 border-blue-400 text-blue-800',
  meal: 'bg-orange-100 border-orange-400 text-orange-800',
  event: 'bg-purple-100 border-purple-400 text-purple-800',
  sightseeing: 'bg-green-100 border-green-400 text-green-800',
  accommodation: 'bg-indigo-100 border-indigo-400 text-indigo-800',
};

export interface Family {
  id: string;
  name: string;
  color: string;
}

export interface ScheduleEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  category: CategoryType;
  transportationType?: TransportationType;
  name: string;
  url?: string;
  memo?: string;
  familyIds: string[];
}

export interface TripData {
  id: string;
  name: string;
  selectedDates: string[];
  families: Family[];
  events: ScheduleEvent[];
}

export const FAMILY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#EF4444', // red
  '#6366F1', // indigo
  '#84CC16', // lime
  '#F97316', // orange
];

export function createDefaultTripData(): TripData {
  return {
    id: generateId(),
    name: '新しい旅行プラン',
    selectedDates: [],
    families: [
      {
        id: generateId(),
        name: 'ファミリー 1',
        color: FAMILY_COLORS[0],
      },
    ],
    events: [],
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function formatDateJP(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${month}/${day}(${weekdays[date.getDay()]})`;
}
