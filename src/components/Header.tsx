'use client';

import { TripData } from '@/lib/types';

interface HeaderProps {
  tripData: TripData;
  onNameChange: (name: string) => void;
  onExportImport: () => void;
  onGemini: () => void;
  onReset: () => void;
}

export default function Header({
  tripData,
  onNameChange,
  onExportImport,
  onGemini,
  onReset,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">🗺️</span>
          <input
            type="text"
            value={tripData.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1 flex-1 min-w-0"
            placeholder="旅行プラン名"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onExportImport}
            className="px-3 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
          >
            <span>📄</span>
            エクスポート / インポート
          </button>
          <button
            onClick={onGemini}
            className="px-3 py-2 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-1"
          >
            <span>🎨</span>
            画像生成
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            リセット
          </button>
        </div>
      </div>
    </header>
  );
}
