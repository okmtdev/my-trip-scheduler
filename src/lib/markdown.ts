import {
  TripData,
  ScheduleEvent,
  Family,
  CategoryType,
  TransportationType,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  TRANSPORTATION_LABELS,
  TRANSPORTATION_ICONS,
  FAMILY_COLORS,
  formatTime,
  generateId,
} from './types';

export function exportToMarkdown(data: TripData): string {
  const lines: string[] = [];

  lines.push(`# ${data.name}`);
  lines.push('');

  // Families
  lines.push('## ファミリー');
  for (const family of data.families) {
    lines.push(`- ${family.name}`);
  }
  lines.push('');

  // Sort dates
  const sortedDates = [...data.selectedDates].sort();

  for (const date of sortedDates) {
    const dayEvents = data.events
      .filter((e) => e.date === date)
      .sort((a, b) => {
        const aTime = a.startHour * 60 + a.startMinute;
        const bTime = b.startHour * 60 + b.startMinute;
        return aTime - bTime;
      });

    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    lines.push(`## ${year}年${month}月${day}日(${weekdays[d.getDay()]})`);
    lines.push('');

    if (dayEvents.length === 0) {
      lines.push('予定なし');
      lines.push('');
      continue;
    }

    for (const event of dayEvents) {
      const icon = CATEGORY_ICONS[event.category];
      const categoryLabel = CATEGORY_LABELS[event.category];
      let categoryDisplay = `${icon} ${categoryLabel}`;
      if (event.category === 'transportation' && event.transportationType) {
        const transIcon = TRANSPORTATION_ICONS[event.transportationType];
        const transLabel = TRANSPORTATION_LABELS[event.transportationType];
        categoryDisplay = `${transIcon} ${categoryLabel}(${transLabel})`;
      }

      const startTime = formatTime(event.startHour, event.startMinute);
      const endTime = formatTime(event.endHour, event.endMinute);

      lines.push(`### ${startTime} - ${endTime} | ${categoryDisplay} | ${event.name}`);

      if (event.url) {
        lines.push(`- URL: ${event.url}`);
      }
      if (event.memo) {
        lines.push(`- メモ: ${event.memo}`);
      }

      const participants = event.familyIds
        .map((fid) => data.families.find((f) => f.id === fid)?.name)
        .filter(Boolean);
      if (participants.length > 0) {
        lines.push(`- 参加: ${participants.join(', ')}`);
      }

      lines.push('');
    }
  }

  return lines.join('\n');
}

export function importFromMarkdown(markdown: string): TripData | null {
  try {
    const lines = markdown.split('\n');
    let lineIdx = 0;

    // Parse trip name
    let tripName = '旅行プラン';
    if (lines[lineIdx]?.startsWith('# ')) {
      tripName = lines[lineIdx].substring(2).trim();
      lineIdx++;
    }

    // Skip empty lines
    while (lineIdx < lines.length && lines[lineIdx].trim() === '') lineIdx++;

    // Parse families
    const families: Family[] = [];
    if (lines[lineIdx]?.startsWith('## ファミリー')) {
      lineIdx++;
      while (lineIdx < lines.length && lines[lineIdx].startsWith('- ')) {
        const familyName = lines[lineIdx].substring(2).trim();
        families.push({
          id: generateId(),
          name: familyName,
          color: FAMILY_COLORS[families.length % FAMILY_COLORS.length],
        });
        lineIdx++;
      }
    }

    if (families.length === 0) {
      families.push({
        id: generateId(),
        name: 'ファミリー 1',
        color: FAMILY_COLORS[0],
      });
    }

    // Skip empty lines
    while (lineIdx < lines.length && lines[lineIdx].trim() === '') lineIdx++;

    // Parse dates and events
    const selectedDates: string[] = [];
    const events: ScheduleEvent[] = [];

    while (lineIdx < lines.length) {
      const line = lines[lineIdx];

      // Date header: ## 2024年1月15日(月)
      const dateMatch = line.match(/^## (\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2].padStart(2, '0');
        const day = dateMatch[3].padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        selectedDates.push(dateStr);
        lineIdx++;

        // Skip empty lines
        while (lineIdx < lines.length && lines[lineIdx].trim() === '') lineIdx++;

        // Parse events for this date
        while (lineIdx < lines.length && !lines[lineIdx]?.startsWith('## ')) {
          const eventLine = lines[lineIdx];

          // Event header: ### 08:00 - 09:00 | 🍽️ 食事 | Breakfast
          const eventMatch = eventLine.match(
            /^### (\d{2}):(\d{2}) - (\d{2}):(\d{2}) \| .+? \| (.+)$/
          );
          if (eventMatch) {
            const startHour = parseInt(eventMatch[1]);
            const startMinute = parseInt(eventMatch[2]);
            const endHour = parseInt(eventMatch[3]);
            const endMinute = parseInt(eventMatch[4]);
            const eventName = eventMatch[5].trim();

            // Detect category from line
            let category: CategoryType = 'event';
            let transportationType: TransportationType | undefined;

            if (eventLine.includes('移動') || eventLine.includes('✈️') || eventLine.includes('🚆') || eventLine.includes('🚌') || eventLine.includes('🚗') || eventLine.includes('🚶') || eventLine.includes('🚀')) {
              category = 'transportation';
              if (eventLine.includes('飛行機') || eventLine.includes('✈️')) transportationType = 'plane';
              else if (eventLine.includes('電車') || eventLine.includes('🚆')) transportationType = 'train';
              else if (eventLine.includes('バス') || eventLine.includes('🚌')) transportationType = 'bus';
              else if (eventLine.includes('車') || eventLine.includes('🚗')) transportationType = 'car';
              else transportationType = 'other';
            } else if (eventLine.includes('食事') || eventLine.includes('🍽️')) {
              category = 'meal';
            } else if (eventLine.includes('イベント') || eventLine.includes('🎉')) {
              category = 'event';
            } else if (eventLine.includes('観光') || eventLine.includes('🏛️')) {
              category = 'sightseeing';
            } else if (eventLine.includes('宿泊') || eventLine.includes('🏨')) {
              category = 'accommodation';
            }

            lineIdx++;

            let url: string | undefined;
            let memo: string | undefined;
            const eventFamilyIds: string[] = [];

            // Parse event details
            while (lineIdx < lines.length && lines[lineIdx].startsWith('- ')) {
              const detailLine = lines[lineIdx];
              if (detailLine.startsWith('- URL: ')) {
                url = detailLine.substring(7).trim();
              } else if (detailLine.startsWith('- メモ: ')) {
                memo = detailLine.substring(6).trim();
              } else if (detailLine.startsWith('- 参加: ')) {
                const participantNames = detailLine.substring(6).trim().split(', ');
                for (const pName of participantNames) {
                  const family = families.find((f) => f.name === pName.trim());
                  if (family) {
                    eventFamilyIds.push(family.id);
                  }
                }
              }
              lineIdx++;
            }

            events.push({
              id: generateId(),
              date: dateStr,
              startHour,
              startMinute,
              endHour,
              endMinute,
              category,
              transportationType,
              name: eventName,
              url,
              memo,
              familyIds: eventFamilyIds.length > 0 ? eventFamilyIds : [families[0].id],
            });
          } else {
            lineIdx++;
          }
        }
      } else {
        lineIdx++;
      }
    }

    return {
      id: generateId(),
      name: tripName,
      selectedDates,
      families,
      events,
    };
  } catch {
    return null;
  }
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
