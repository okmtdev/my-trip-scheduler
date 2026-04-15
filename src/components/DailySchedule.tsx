'use client';

import {
  ScheduleEvent,
  Family,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  TRANSPORTATION_ICONS,
  formatTime,
  formatDateJP,
} from '@/lib/types';

interface DailyScheduleProps {
  date: string;
  events: ScheduleEvent[];
  families: Family[];
  onEventClick: (event: ScheduleEvent) => void;
  onTimeSlotClick: (hour: number) => void;
  selectedFamilyFilter: string | null;
}

export default function DailySchedule({
  date,
  events,
  families,
  onEventClick,
  onTimeSlotClick,
  selectedFamilyFilter,
}: DailyScheduleProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const filteredEvents = selectedFamilyFilter
    ? events.filter((e) => e.familyIds.includes(selectedFamilyFilter))
    : events;

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aTime = a.startHour * 60 + a.startMinute;
    const bTime = b.startHour * 60 + b.startMinute;
    return aTime - bTime;
  });

  // Calculate event positions for overlapping detection
  const getEventPosition = (event: ScheduleEvent) => {
    const startMinutes = event.startHour * 60 + event.startMinute;
    const endMinutes = event.endHour * 60 + event.endMinute;
    const top = (startMinutes / (24 * 60)) * 100;
    const height = Math.max(((endMinutes - startMinutes) / (24 * 60)) * 100, 1.5);
    return { top, height };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{formatDateJP(date)}</h2>
        <span className="text-sm text-gray-500">
          {filteredEvents.length}件の予定
        </span>
      </div>

      <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Timeline */}
        <div className="relative" style={{ height: '1152px' }}>
          {/* Hour lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full border-t border-gray-100 flex cursor-pointer hover:bg-gray-50/50 transition-colors"
              style={{
                top: `${(hour / 24) * 100}%`,
                height: `${100 / 24}%`,
              }}
              onClick={() => onTimeSlotClick(hour)}
            >
              <div className="w-14 flex-shrink-0 px-2 py-0.5 text-xs text-gray-400 font-mono bg-gray-50/80">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1" />
            </div>
          ))}

          {/* Events */}
          {sortedEvents.map((event) => {
            const pos = getEventPosition(event);
            const colorClass = CATEGORY_COLORS[event.category];
            const icon =
              event.category === 'transportation' && event.transportationType
                ? TRANSPORTATION_ICONS[event.transportationType]
                : CATEGORY_ICONS[event.category];

            const participatingFamilies = families.filter((f) =>
              event.familyIds.includes(f.id)
            );

            return (
              <div
                key={event.id}
                className={`absolute left-16 right-2 rounded-lg border-l-4 px-3 py-1.5 cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${colorClass}`}
                style={{
                  top: `${pos.top}%`,
                  height: `${pos.height}%`,
                  minHeight: '28px',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <div className="flex items-start gap-1.5">
                  <span className="text-sm flex-shrink-0">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      {event.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatTime(event.startHour, event.startMinute)} -{' '}
                      {formatTime(event.endHour, event.endMinute)}
                    </div>
                    {participatingFamilies.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {participatingFamilies.map((f) => (
                          <span
                            key={f.id}
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: f.color }}
                            title={f.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {event.url && (
                  <div className="text-xs opacity-60 truncate mt-0.5">
                    🔗 {event.url}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
