'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripData, ScheduleEvent, Family, createDefaultTripData } from '@/lib/types';
import { loadTripData, saveTripData, clearTripData } from '@/lib/storage';
import Header from '@/components/Header';
import FamilyManager from '@/components/FamilyManager';
import CalendarPicker from '@/components/CalendarPicker';
import DailySchedule from '@/components/DailySchedule';
import EventFormModal from '@/components/EventFormModal';
import ExportImportModal from '@/components/ExportImportModal';
import GeminiPanel from '@/components/GeminiPanel';

export default function Home() {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [defaultStartHour, setDefaultStartHour] = useState<number | undefined>(undefined);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    setTripData(loadTripData());
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    if (tripData) {
      saveTripData(tripData);
    }
  }, [tripData]);

  // Set active date when dates change
  useEffect(() => {
    if (tripData && tripData.selectedDates.length > 0) {
      if (!activeDate || !tripData.selectedDates.includes(activeDate)) {
        setActiveDate(tripData.selectedDates[0]);
      }
    } else {
      setActiveDate(null);
    }
  }, [tripData?.selectedDates, activeDate]);

  const updateTripData = useCallback((updater: (prev: TripData) => TripData) => {
    setTripData((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  }, []);

  const handleNameChange = useCallback(
    (name: string) => {
      updateTripData((prev) => ({ ...prev, name }));
    },
    [updateTripData]
  );

  const handleFamiliesChange = useCallback(
    (families: Family[]) => {
      updateTripData((prev) => {
        // Clean up event familyIds when families are removed
        const familyIds = new Set(families.map((f) => f.id));
        const events = prev.events.map((event) => ({
          ...event,
          familyIds: event.familyIds.filter((id) => familyIds.has(id)),
        }));
        return { ...prev, families, events };
      });
    },
    [updateTripData]
  );

  const handleDatesChange = useCallback(
    (dates: string[]) => {
      updateTripData((prev) => {
        // Remove events for dates that are no longer selected
        const dateSet = new Set(dates);
        const events = prev.events.filter((e) => dateSet.has(e.date));
        return { ...prev, selectedDates: dates, events };
      });
    },
    [updateTripData]
  );

  const handleSaveEvent = useCallback(
    (event: ScheduleEvent) => {
      updateTripData((prev) => {
        const existingIdx = prev.events.findIndex((e) => e.id === event.id);
        if (existingIdx >= 0) {
          const events = [...prev.events];
          events[existingIdx] = event;
          return { ...prev, events };
        }
        return { ...prev, events: [...prev.events, event] };
      });
    },
    [updateTripData]
  );

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      updateTripData((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== eventId),
      }));
    },
    [updateTripData]
  );

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    setEditingEvent(event);
    setDefaultStartHour(undefined);
    setShowEventForm(true);
  }, []);

  const handleTimeSlotClick = useCallback((hour: number) => {
    setEditingEvent(null);
    setDefaultStartHour(hour);
    setShowEventForm(true);
  }, []);

  const handleImport = useCallback((data: TripData) => {
    setTripData(data);
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) {
      clearTripData();
      setTripData(createDefaultTripData());
      setActiveDate(null);
    }
  }, []);

  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  const activeDateEvents = activeDate
    ? tripData.events.filter((e) => e.date === activeDate)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        tripData={tripData}
        onNameChange={handleNameChange}
        onExportImport={() => setShowExportImport(true)}
        onGemini={() => setShowGemini(true)}
        onReset={handleReset}
      />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
          <FamilyManager
            families={tripData.families}
            onFamiliesChange={handleFamiliesChange}
          />
          <CalendarPicker
            selectedDates={tripData.selectedDates}
            onDatesChange={handleDatesChange}
          />

          {/* Family filter */}
          {tripData.families.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                🔍 表示フィルター
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedFamilyFilter(null)}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                    selectedFamilyFilter === null
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  全員の予定
                </button>
                {tripData.families.map((family) => (
                  <button
                    key={family.id}
                    onClick={() =>
                      setSelectedFamilyFilter(
                        selectedFamilyFilter === family.id ? null : family.id
                      )
                    }
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors flex items-center gap-2 ${
                      selectedFamilyFilter === family.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: family.color }}
                    />
                    {family.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {tripData.selectedDates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-lg">カレンダーから日付を選択してください</p>
                <p className="text-sm mt-1">
                  日付をクリックすると予定表が作成されます
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Date tabs */}
              <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
                {tripData.selectedDates.map((date) => {
                  const dateEvents = tripData.events.filter(
                    (e) => e.date === date
                  );
                  const [, month, day] = date.split('-').map(Number);
                  const d = new Date(
                    parseInt(date.split('-')[0]),
                    month - 1,
                    day
                  );
                  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

                  return (
                    <button
                      key={date}
                      onClick={() => setActiveDate(date)}
                      className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                        activeDate === date
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {month}/{day}({weekdays[d.getDay()]})
                      {dateEvents.length > 0 && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                            activeDate === date
                              ? 'bg-blue-400'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {dateEvents.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add event button */}
              {activeDate && (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setDefaultStartHour(9);
                      setShowEventForm(true);
                    }}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    + 予定を追加
                  </button>
                </div>
              )}

              {/* Daily schedule */}
              {activeDate && (
                <DailySchedule
                  date={activeDate}
                  events={activeDateEvents}
                  families={tripData.families}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                  selectedFamilyFilter={selectedFamilyFilter}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {activeDate && (
        <EventFormModal
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={
            editingEvent
              ? () => handleDeleteEvent(editingEvent.id)
              : undefined
          }
          event={editingEvent}
          date={activeDate}
          families={tripData.families}
          defaultStartHour={defaultStartHour}
        />
      )}

      <ExportImportModal
        isOpen={showExportImport}
        onClose={() => setShowExportImport(false)}
        tripData={tripData}
        onImport={handleImport}
      />

      <GeminiPanel
        isOpen={showGemini}
        onClose={() => setShowGemini(false)}
        tripData={tripData}
      />
    </div>
  );
}
