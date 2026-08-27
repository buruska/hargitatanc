export const EVENT_TIME_ZONE = "Europe/Bucharest";

export type EventDateTimeParts = {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
};

const eventDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
});

export function getEventDateTimeParts(date: Date): EventDateTimeParts {
  const parts = Object.fromEntries(
    eventDateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    month: parts.month,
    year: parts.year,
  };
}

export function parseEventDateTime(parts: EventDateTimeParts) {
  const { day, hour, minute, month, year } = parts;

  if (![year, month, day, hour, minute].every(Number.isInteger)) return null;
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const requestedTimestamp = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = requestedTimestamp;

  // Convert the wall-clock value in Europe/Bucharest to a UTC instant. Iteration
  // also handles the offset change around daylight-saving transitions.
  for (let index = 0; index < 3; index += 1) {
    const represented = getEventDateTimeParts(new Date(timestamp));
    const representedTimestamp = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute,
    );
    const correction = requestedTimestamp - representedTimestamp;
    timestamp += correction;
    if (correction === 0) break;
  }

  const result = new Date(timestamp);
  const represented = getEventDateTimeParts(result);

  if (
    represented.year !== year ||
    represented.month !== month ||
    represented.day !== day ||
    represented.hour !== hour ||
    represented.minute !== minute
  ) return null;

  return result;
}

export function getEventDateKey(date: Date) {
  const { day, month, year } = getEventDateTimeParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getEventDateKeysBetween(startDate: Date, endDate: Date) {
  const start = getEventDateTimeParts(startDate);
  const end = getEventDateTimeParts(endDate);
  const firstTimestamp = Date.UTC(start.year, start.month - 1, start.day);
  const lastTimestamp = Date.UTC(end.year, end.month - 1, end.day);
  const dateKeys: string[] = [];

  for (let timestamp = firstTimestamp; timestamp <= lastTimestamp; timestamp += 24 * 60 * 60 * 1000) {
    const date = new Date(timestamp);
    dateKeys.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`);
  }

  return dateKeys;
}
