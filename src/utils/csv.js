import { createId } from './ids';
import { getDayLabel } from './date';

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

export function parseCsvText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV 데이터가 비어 있습니다.'] };
  }

  const headers = splitCsvLine(lines[0]).map((value) => value.trim());
  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const raw = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    const row = {
      id: createId('csv'),
      rawIndex: i + 1,
      date: raw.date?.trim(),
      startTime: raw.startTime?.trim(),
      className: raw.className?.trim(),
      subjectType: raw.subjectType?.trim() || '기타',
      schoolName: raw.schoolName?.trim() || '',
      grade: raw.grade?.trim() || '',
      bookName: raw.bookName?.trim() || '',
      homeworkAmount: raw.homeworkAmount?.trim() || '',
      studentNames: raw.studentNames
        ? raw.studentNames.split('|').map((item) => item.trim()).filter(Boolean)
        : [],
      classMemo: raw.classMemo?.trim() || ''
    };

    const missing = [];
    if (!row.date) missing.push('date');
    if (!row.startTime) missing.push('startTime');
    if (!row.className) missing.push('className');

    if (missing.length) {
      errors.push(`${i + 1}행: 필수값 누락 (${missing.join(', ')})`);
      continue;
    }

    row.dayOfWeek = getDayLabel(row.date);
    rows.push(row);
  }

  return { rows, errors };
}
