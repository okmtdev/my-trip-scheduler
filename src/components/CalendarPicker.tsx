'use client';

import { useState } from 'react';

interface CalendarPickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function CalendarPicker({
  selectedDates,
  onDatesChange,
}: CalendarPickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const toggleDate = (date: Date) => {
    const dateStr = formatDateStr(date);
    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter((d) => d !== dateStr));
    } else {
      onDatesChange([...selectedDates, dateStr].sort());
    }
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
        📅 日付を選択
      </h3>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
        >
          ◀
        </button>
        <span className="text-sm font-medium">
          {viewYear}年 {monthNames[viewMonth]}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
        >
          ▶
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = formatDateStr(day);
          const isSelected = selectedDates.includes(dateStr);
          const isToday = formatDateStr(today) === dateStr;
          const dayOfWeek = day.getDay();

          return (
            <button
              key={dateStr}
              onClick={() => toggleDate(day)}
              className={`h-8 text-xs rounded transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white font-bold shadow-sm'
                  : isToday
                    ? 'bg-blue-50 text-blue-600 font-medium ring-1 ring-blue-300'
                    : dayOfWeek === 0
                      ? 'text-red-500 hover:bg-red-50'
                      : dayOfWeek === 6
                        ? 'text-blue-500 hover:bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          {selectedDates.length}日間 選択中
        </div>
      )}
    </div>
  );
}
