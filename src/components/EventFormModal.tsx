'use client';

import { useState, useEffect } from 'react';
import {
  ScheduleEvent,
  Family,
  CategoryType,
  TransportationType,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  TRANSPORTATION_LABELS,
  TRANSPORTATION_ICONS,
  generateId,
} from '@/lib/types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  onDelete?: () => void;
  event?: ScheduleEvent | null;
  date: string;
  families: Family[];
  defaultStartHour?: number;
}

const CATEGORIES: CategoryType[] = [
  'transportation',
  'meal',
  'event',
  'sightseeing',
  'accommodation',
];

const TRANSPORTATION_TYPES: TransportationType[] = [
  'plane',
  'train',
  'bus',
  'car',
  'other',
];

export default function EventFormModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  date,
  families,
  defaultStartHour,
}: EventFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('sightseeing');
  const [transportationType, setTransportationType] = useState<TransportationType>('train');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setCategory(event.category);
      setTransportationType(event.transportationType || 'train');
      setStartHour(event.startHour);
      setStartMinute(event.startMinute);
      setEndHour(event.endHour);
      setEndMinute(event.endMinute);
      setUrl(event.url || '');
      setMemo(event.memo || '');
      setSelectedFamilyIds(event.familyIds);
    } else {
      setName('');
      setCategory('sightseeing');
      setTransportationType('train');
      setStartHour(defaultStartHour ?? 9);
      setStartMinute(0);
      setEndHour((defaultStartHour ?? 9) + 1);
      setEndMinute(0);
      setUrl('');
      setMemo('');
      setSelectedFamilyIds(families.map((f) => f.id));
    }
  }, [event, families, defaultStartHour, isOpen]);

  const toggleFamily = (familyId: string) => {
    if (selectedFamilyIds.includes(familyId)) {
      if (selectedFamilyIds.length > 1) {
        setSelectedFamilyIds(selectedFamilyIds.filter((id) => id !== familyId));
      }
    } else {
      setSelectedFamilyIds([...selectedFamilyIds, familyId]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: event?.id || generateId(),
      date,
      startHour,
      startMinute,
      endHour,
      endMinute,
      category,
      transportationType: category === 'transportation' ? transportationType : undefined,
      name: name.trim(),
      url: url.trim() || undefined,
      memo: memo.trim() || undefined,
      familyIds: selectedFamilyIds,
    });
    onClose();
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const handleNumberInput = (
    raw: string,
    min: number,
    max: number,
    setter: (v: number) => void,
  ) => {
    if (raw === '') { setter(min); return; }
    const n = parseInt(raw, 10);
    if (!isNaN(n)) setter(clamp(n, min, max));
  };

  if (!isOpen) return null;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const allMinutes = Array.from({ length: 60 }, (_, i) => i);

  const timeInputClass =
    'w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">
            {event ? '予定を編集' : '予定を追加'}
          </h2>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              予定名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="例: 東京タワー見学"
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    category === cat
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Transportation type */}
          {category === 'transportation' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                移動手段
              </label>
              <div className="flex flex-wrap gap-2">
                {TRANSPORTATION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTransportationType(type)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      transportationType === type
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {TRANSPORTATION_ICONS[type]} {TRANSPORTATION_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始時間
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  list="hour-options"
                  min={0}
                  max={23}
                  value={startHour.toString().padStart(2, '0')}
                  onChange={(e) => handleNumberInput(e.target.value, 0, 23, setStartHour)}
                  className={timeInputClass}
                />
                <span className="text-gray-500">:</span>
                <input
                  type="number"
                  list="minute-options"
                  min={0}
                  max={59}
                  value={startMinute.toString().padStart(2, '0')}
                  onChange={(e) => handleNumberInput(e.target.value, 0, 59, setStartMinute)}
                  className={timeInputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  list="hour-options"
                  min={0}
                  max={23}
                  value={endHour.toString().padStart(2, '0')}
                  onChange={(e) => handleNumberInput(e.target.value, 0, 23, setEndHour)}
                  className={timeInputClass}
                />
                <span className="text-gray-500">:</span>
                <input
                  type="number"
                  list="minute-options"
                  min={0}
                  max={59}
                  value={endMinute.toString().padStart(2, '0')}
                  onChange={(e) => handleNumberInput(e.target.value, 0, 59, setEndMinute)}
                  className={timeInputClass}
                />
              </div>
            </div>
            <datalist id="hour-options">
              {hours.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
            <datalist id="minute-options">
              {allMinutes.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          {/* URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Memo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              rows={3}
              placeholder="メモを入力..."
            />
          </div>

          {/* Participating families */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              参加ファミリー
            </label>
            <div className="flex flex-wrap gap-2">
              {families.map((family) => {
                const isSelected = selectedFamilyIds.includes(family.id);
                return (
                  <button
                    key={family.id}
                    onClick={() => toggleFamily(family.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border-2 transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'bg-white text-gray-500 border-gray-300'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: family.color, borderColor: family.color }
                        : undefined
                    }
                  >
                    {family.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <div>
              {event && onDelete && (
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  削除
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-6 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {event ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
