'use client';

import { useState, useEffect, useRef } from 'react';
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

function TimeComboBox({
  value,
  options,
  min,
  max,
  onChange,
}: {
  value: number;
  options: number[];
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString().padStart(2, '0'));
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value.toString().padStart(2, '0'));
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    setInputValue(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n);
    }
  };

  const handleBlur = () => {
    const n = parseInt(inputValue, 10);
    if (isNaN(n) || n < min || n > max) {
      setInputValue(value.toString().padStart(2, '0'));
    } else {
      onChange(n);
      setInputValue(n.toString().padStart(2, '0'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      setIsOpen(false);
      handleBlur();
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-14 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="ml-0.5 text-gray-400 hover:text-gray-600 text-xs"
        >
          ▼
        </button>
      </div>
      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-0 mt-1 w-16 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              data-selected={opt === value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setInputValue(opt.toString().padStart(2, '0'));
                setIsOpen(false);
              }}
              className={`w-full px-2 py-1.5 text-sm text-center hover:bg-blue-50 transition-colors ${
                opt === value ? 'bg-blue-100 text-blue-700 font-medium' : ''
              }`}
            >
              {opt.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  if (!isOpen) return null;

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

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
                <TimeComboBox value={startHour} options={hourOptions} min={0} max={23} onChange={setStartHour} />
                <span className="text-gray-500 font-medium">:</span>
                <TimeComboBox value={startMinute} options={minuteOptions} min={0} max={59} onChange={setStartMinute} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <div className="flex items-center gap-1">
                <TimeComboBox value={endHour} options={hourOptions} min={0} max={23} onChange={setEndHour} />
                <span className="text-gray-500 font-medium">:</span>
                <TimeComboBox value={endMinute} options={minuteOptions} min={0} max={59} onChange={setEndMinute} />
              </div>
            </div>
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
