// Small shared formatting helpers used across the dashboard.

/** Format an ISO date/datetime as e.g. "Jun 25, 2026"; em dash for null. */
export function formatDate(value: string | null): string {
  if (value === null) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format an ISO datetime as e.g. "Nov 10, 5:00 AM CST", shown in `timeZone`
 * (an IANA name like "America/Chicago"). Passing the zone explicitly means
 * everyone sees the scan times in the schedule's zone, not their own.
 */
export function formatDateTime(value: string | null, timeZone: string): string {
  if (value === null) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });
}

/** The elapsed time between two ISO datetimes, e.g. "4m 12s" or "31s". */
export function formatDuration(start: string, end: string | null): string {
  if (end === null) return "—";
  const totalSec = Math.round((Date.parse(end) - Date.parse(start)) / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

/** A 24-hour "HH:MM" string as a friendly time, e.g. "05:00" → "5:00 AM". */
export function formatTimeOfDay(hhmm: string): string {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const suffix = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** An IANA timezone as a readable name, e.g. "America/Chicago" → "Central Time". */
export function formatTimeZone(timeZone: string): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longGeneric" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? timeZone
  );
}
