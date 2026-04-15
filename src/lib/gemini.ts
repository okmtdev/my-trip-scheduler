import {
  TripData,
  CATEGORY_LABELS,
  TRANSPORTATION_LABELS,
  formatTime,
} from './types';

function buildScheduleDescription(data: TripData): string {
  const lines: string[] = [];
  lines.push(`旅行プラン: ${data.name}`);

  const sortedDates = [...data.selectedDates].sort();

  for (const date of sortedDates) {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    lines.push(`\n${year}年${month}月${day}日(${weekdays[d.getDay()]})`);

    const dayEvents = data.events
      .filter((e) => e.date === date)
      .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));

    for (const event of dayEvents) {
      const start = formatTime(event.startHour, event.startMinute);
      const end = formatTime(event.endHour, event.endMinute);
      let cat = CATEGORY_LABELS[event.category];
      if (event.category === 'transportation' && event.transportationType) {
        cat += `(${TRANSPORTATION_LABELS[event.transportationType]})`;
      }
      lines.push(`  ${start}-${end} [${cat}] ${event.name}`);
      if (event.memo) {
        lines.push(`    メモ: ${event.memo}`);
      }
    }
  }

  return lines.join('\n');
}

export async function generateScheduleImage(
  data: TripData,
  apiKey: string
): Promise<string> {
  const description = buildScheduleDescription(data);

  const prompt = `以下の旅行スケジュールを基に、美しくデザインされた旅行スケジュール表の画像を生成してください。
カラフルで見やすいインフォグラフィック風のデザインにしてください。
日付ごとにセクションを分け、各予定をアイコンや色で分類してください。
タイトルは「${data.name}」です。

スケジュール内容:
${description}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-image-generation:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API エラー: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  // Extract image from response
  const candidates = result.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('画像の生成に失敗しました。');
  }

  const parts = candidates[0].content?.parts;
  if (!parts) {
    throw new Error('レスポンスにコンテンツがありません。');
  }

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('画像データが見つかりませんでした。テキストのみのレスポンスでした。');
}

export function downloadImage(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
