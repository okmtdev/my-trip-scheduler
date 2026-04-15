'use client';

import { useState } from 'react';
import { TripData } from '@/lib/types';
import { generateScheduleImage, downloadImage } from '@/lib/gemini';

interface GeminiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: TripData;
}

export default function GeminiPanel({
  isOpen,
  onClose,
  tripData,
}: GeminiPanelProps) {
  const [apiKey, setApiKey] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('gemini-api-key') || ''
      : ''
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('Gemini API キーを入力してください。');
      return;
    }

    // Save API key to localStorage
    localStorage.setItem('gemini-api-key', apiKey);

    setLoading(true);
    setError('');
    setImageUrl(null);

    try {
      const dataUrl = await generateScheduleImage(tripData, apiKey.trim());
      setImageUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像の生成に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const filename = `${tripData.name.replace(/[^a-zA-Z0-9ぁ-んァ-ヶ亜-熙]/g, '_')}_schedule.png`;
      downloadImage(imageUrl, filename);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🎨 AI 画像生成 (Gemini)</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            作成した予定表の内容をもとに、Gemini AI
            が美しいビジュアルのスケジュール画像を生成します。
          </p>

          {/* API Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gemini API キー
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              placeholder="AIzaSy..."
            />
            <p className="text-xs text-gray-400 mt-1">
              API キーはローカルストレージに保存され、外部に送信されません（Gemini
              API への直接リクエストのみに使用）。
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !apiKey.trim()}
            className="px-6 py-2 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>🎨 画像を生成</>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {imageUrl && (
            <div className="mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={imageUrl}
                  alt="生成されたスケジュール画像"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
              <button
                onClick={handleDownload}
                className="mt-3 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                📥 画像をダウンロード
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
