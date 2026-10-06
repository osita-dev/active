/** "10:24 AM" today · "Yesterday" · "Mon" this week · "12 Sep" otherwise */
export function formatWhen(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

/**
 * Turns "0812 345 6789", "812 345 6789" or "+234 812 345 6789" into "+2348123456789".
 * Returns null when it isn't a valid 10-digit Nigerian number. A full international
 * number is what makes the tel: and wa.me links actually work.
 */
export function normalizeNgPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? `+234${digits}` : null;
}
