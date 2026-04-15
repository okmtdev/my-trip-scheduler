'use client';

import { useRef, useState } from 'react';
import { TripData } from '@/lib/types';
import { exportToMarkdown, importFromMarkdown, downloadMarkdown, downloadText } from '@/lib/markdown';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: TripData;
  onImport: (data: TripData) => void;
}

export default function ExportImportModal({
  isOpen,
  onClose,
  tripData,
  onImport,
}: ExportImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  if (!isOpen) return null;

  const markdown = exportToMarkdown(tripData);

  const handleExportMarkdown = () => {
    const filename = `${tripData.name.replace(/[^a-zA-Z0-9ぁ-んァ-ヶ亜-熙]/g, '_')}.md`;
    downloadMarkdown(markdown, filename);
  };

  const handleExportText = () => {
    const filename = `${tripData.name.replace(/[^a-zA-Z0-9ぁ-んァ-ヶ亜-熙]/g, '_')}.txt`;
    downloadText(markdown, filename);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setPreview(text);

      const parsed = importFromMarkdown(text);
      if (parsed) {
        onImport(parsed);
        onClose();
      } else {
        setError('ファイルの解析に失敗しました。正しい形式のMarkdownファイルを選択してください。');
      }
    } catch {
      setError('ファイルの読み込みに失敗しました。');
    }
  };

  const handlePasteImport = () => {
    setError('');
    if (!preview.trim()) {
      setError('テキストを入力してください。');
      return;
    }
    const parsed = importFromMarkdown(preview);
    if (parsed) {
      onImport(parsed);
      onClose();
    } else {
      setError('テキストの解析に失敗しました。正しい形式のMarkdownを入力してください。');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">エクスポート / インポート</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'export'
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📤 エクスポート
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'import'
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📥 インポート
            </button>
          </div>

          {activeTab === 'export' && (
            <div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleExportMarkdown}
                  className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  📄 Markdownでダウンロード (.md)
                </button>
                <button
                  onClick={handleExportText}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  📝 テキストでダウンロード (.txt)
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {markdown}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Markdownファイルをアップロードするか、テキストを貼り付けてインポートします。
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.markdown"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📁 ファイルを選択
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  または、テキストを貼り付け:
                </label>
                <textarea
                  value={preview}
                  onChange={(e) => setPreview(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                  rows={10}
                  placeholder="# 旅行プラン名&#10;&#10;## ファミリー&#10;- ファミリー 1&#10;&#10;## 2024年1月15日(月)&#10;..."
                />
                <button
                  onClick={handlePasteImport}
                  className="mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  インポート実行
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
