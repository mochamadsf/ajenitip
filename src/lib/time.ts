/**
 * Time utilities for WIB (Waktu Indonesia Barat / UTC+7) timezone operations.
 */

const WIB_TIMEZONE = "Asia/Jakarta";

/** Get current Date adjusted to WIB display */
export function getWIBDate(): Date {
  return new Date();
}

/** Format time as HH:MM:SS WIB */
export function formatTimeWIB(date: Date = new Date()): string {
  return date.toLocaleTimeString("id-ID", {
    timeZone: WIB_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Format time as HH:MM WIB (no seconds) */
export function formatTimeShortWIB(date: Date = new Date()): string {
  return date.toLocaleTimeString("id-ID", {
    timeZone: WIB_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Normalisasi "HH:MM:SS" (atau "HH:MM") menjadi "HH:MM" format 24 jam */
export function normalizeTimeShort(t: string | null | undefined): string {
  if (!t) return "";
  return t.substring(0, 5);
}

/**
 * Gabungkan dua waktu "HH:MM" menjadi rentang "07:00 - 08:00" (24 jam).
 * Mengembalikan null jika keduanya kosong.
 */
export function formatTimeRange(
  start?: string | null,
  end?: string | null,
): string | null {
  const s = normalizeTimeShort(start);
  const e = normalizeTimeShort(end);
  if (!s && !e) return null;
  if (s && e) return `${s} - ${e}`;
  return s || e;
}

/** Format date as "Senin, 1 Januari 2025" */
export function formatDateWIB(date: Date = new Date()): string {
  return date.toLocaleDateString("id-ID", {
    timeZone: WIB_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Format date as "1 Jan 2025" (short) */
export function formatDateShortWIB(date: Date = new Date()): string {
  return date.toLocaleDateString("id-ID", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Format as ISO date string YYYY-MM-DD in WIB */
export function formatISODateWIB(date: Date = new Date()): string {
  const wibStr = date.toLocaleDateString("en-CA", {
    timeZone: WIB_TIMEZONE,
  });
  return wibStr; // en-CA formats as YYYY-MM-DD
}

/**
 * Parse a time string "HH:MM" or "HH:MM:SS" and a date into a Date object in WIB.
 */
export function parseTimeOnDate(timeStr: string, dateStr: string): Date {
  const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
  // Create date in WIB by constructing ISO string with +07:00
  const iso = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}+07:00`;
  return new Date(iso);
}

/**
 * Calculate remaining safe time in seconds.
 * Returns negative if past safe time.
 */
export function calculateRemainingSeconds(
  deliveryTime: Date,
  safeHours: number,
): number {
  const safeUntil = new Date(deliveryTime.getTime() + safeHours * 3600 * 1000);
  const now = new Date();
  return Math.floor((safeUntil.getTime() - now.getTime()) / 1000);
}

/**
 * Format seconds as "X jam Y menit Z detik"
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Waktu habis";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`);

  return parts.join(" ");
}

/**
 * Format seconds as "HH:MM:SS" for compact display
 */
export function formatDurationCompact(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export type SafetyStatus = "AMAN" | "PERINGATAN" | "BAHAYA";

/**
 * Determine food safety status based on remaining seconds & safe hours.
 * - AMAN: > 25% time remaining
 * - PERINGATAN: 0-25% time remaining
 * - BAHAYA: past safe time
 */
export function getSafetyStatus(
  remainingSeconds: number,
  totalSafeSeconds: number,
): SafetyStatus {
  if (remainingSeconds <= 0) return "BAHAYA";
  const ratio = remainingSeconds / totalSafeSeconds;
  if (ratio <= 0.25) return "PERINGATAN";
  return "AMAN";
}

/**
 * Get progress percentage (1 = full, 0 = empty)
 */
export function getProgressRatio(
  remainingSeconds: number,
  totalSafeSeconds: number,
): number {
  if (totalSafeSeconds <= 0) return 0;
  return Math.max(0, Math.min(1, remainingSeconds / totalSafeSeconds));
}
