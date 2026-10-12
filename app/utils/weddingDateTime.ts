// Keep event wall-clock values independent of the visitor's device timezone.
export function timeInputValue(value = ''): string {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return '';
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();
  if (minutes > 59 || hours > (period ? 12 : 23) || (period && hours < 1))
    return '';
  if (period) hours = (hours % 12) + (period === 'PM' ? 12 : 0);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatWeddingTime(value = ''): string {
  const time = timeInputValue(value);
  if (!time) return value; // Preserve existing descriptive times, e.g. “After prayers”.
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

export function eventDateTimeValue(event: {
  date: string;
  displayTime?: string;
  time?: string;
  countdownTarget?: unknown;
}): string {
  if (typeof event.countdownTarget === 'string' && event.countdownTarget)
    return event.countdownTarget.slice(0, 16);
  const time = timeInputValue(event.displayTime || event.time);
  return event.date && time ? `${event.date}T${time}` : '';
}

export function eventUtcOffset(
  timestamp: unknown,
  fallbackMinutes: number,
): string {
  if (typeof timestamp === 'string') {
    if (timestamp.endsWith('Z')) return '+00:00';
    const offset = timestamp.match(/([+-]\d{2}:\d{2})$/)?.[1];
    if (offset) return offset;
  }
  const sign = fallbackMinutes < 0 ? '-' : '+';
  const minutes = Math.abs(fallbackMinutes);
  return `${sign}${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function eventScheduleFields(value: string, offset: string) {
  if (!value) return { date: '', displayTime: '', countdownTarget: '' };
  const [date, time] = value.split('T');
  return {
    date,
    displayTime: formatWeddingTime(time),
    countdownTarget: `${value}:00${offset}`,
  };
}
