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
