'use client';

import { useState } from 'react';
import { Family, FAMILY_COLORS, generateId } from '@/lib/types';

interface FamilyManagerProps {
  families: Family[];
  onFamiliesChange: (families: Family[]) => void;
}

export default function FamilyManager({
  families,
  onFamiliesChange,
}: FamilyManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const addFamily = () => {
    const idx = families.length % FAMILY_COLORS.length;
    const newFamily: Family = {
      id: generateId(),
      name: `ファミリー ${families.length + 1}`,
      color: FAMILY_COLORS[idx],
    };
    onFamiliesChange([...families, newFamily]);
  };

  const removeFamily = (id: string) => {
    if (families.length <= 1) return;
    onFamiliesChange(families.filter((f) => f.id !== id));
  };

  const startEdit = (family: Family) => {
    setEditingId(family.id);
    setEditName(family.name);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onFamiliesChange(
      families.map((f) =>
        f.id === editingId ? { ...f, name: editName.trim() } : f
      )
    );
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
        👨‍👩‍👧‍👦 ファミリー
      </h3>
      <div className="space-y-2">
        {families.map((family) => (
          <div
            key={family.id}
            className="flex items-center gap-2 group"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: family.color }}
            />
            {editingId === family.id ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span
                  className="flex-1 text-sm cursor-pointer hover:text-blue-600"
                  onClick={() => startEdit(family)}
                >
                  {family.name}
                </span>
                {families.length > 1 && (
                  <button
                    onClick={() => removeFamily(family.id)}
                    className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addFamily}
        className="mt-3 w-full py-1.5 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
      >
        + 家族を追加
      </button>
    </div>
  );
}
