/**
 * DentPro OS — Centralized Date & Time Utilities
 * Timezone: Asia/Kolkata (Indian Standard Time, UTC+5:30)
 *
 * Provides timezone-accurate dynamic date/time formatting,
 * appointment slot calculations, and database-safe conversions.
 */

export const CLINIC_TIMEZONE = "Asia/Kolkata";

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_MAP: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

export const STANDARD_CLINIC_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM"
];

export interface KolkataDateTimeParts {
  year: number;
  month: number; // 1-12
  monthStr: string; // "01"-"12"
  day: number; // 1-31
  dayStr: string; // "01"-"31"
  hours24: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
  monthShort: string; // "Oct"
  monthLong: string; // "October"
  amPm: "AM" | "PM";
  hours12: number; // 1-12
  time12: string; // "03:30 PM"
}

/**
 * Extracts date and time components strictly within Asia/Kolkata timezone.
 */
export function getKolkataParts(dateInput: Date = new Date()): KolkataDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(dateInput);
  const get = (type: string) => parts.find(p => p.type === type)?.value || "0";

  const year = parseInt(get("year"), 10);
  const month = parseInt(get("month"), 10);
  const day = parseInt(get("day"), 10);
  const hours24 = parseInt(get("hour"), 10);
  const minutes = parseInt(get("minute"), 10);
  const seconds = parseInt(get("second"), 10);

  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");

  const amPm: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const time12 = `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${amPm}`;

  const monthShort = MONTH_NAMES_SHORT[month - 1] || "Jan";
  const monthLong = MONTH_NAMES_LONG[month - 1] || "January";

  return {
    year,
    month,
    monthStr,
    day,
    dayStr,
    hours24,
    minutes,
    seconds,
    monthShort,
    monthLong,
    amPm,
    hours12,
    time12
  };
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata timezone.
 * Safe for database storage without UTC shifting.
 */
export function getTodayKolkataDbDate(): string {
  const parts = getKolkataParts();
  return `${parts.year}-${parts.monthStr}-${parts.dayStr}`;
}

/**
 * Returns today's date formatted as DD Mon YYYY in Asia/Kolkata timezone (e.g. "13 Oct 2026").
 */
export function getTodayKolkataUiDate(): string {
  const parts = getKolkataParts();
  return `${parts.dayStr} ${parts.monthShort} ${parts.year}`;
}

/**
 * Formats a DB date string (YYYY-MM-DD or ISO string) to UI format "DD Mon YYYY".
 * Avoids browser UTC shifting by parsing date components explicitly.
 */
export function formatDbDateToUi(dbDate?: string | null): string {
  if (!dbDate) return getTodayKolkataUiDate();

  // If already in DD Mon YYYY format
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dbDate.trim())) {
    return dbDate.trim();
  }

  // If in YYYY-MM-DD format
  const matchYmd = dbDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (matchYmd) {
    const year = matchYmd[1];
    const monthIndex = parseInt(matchYmd[2], 10) - 1;
    const day = matchYmd[3].padStart(2, "0");
    const month = MONTH_NAMES_SHORT[monthIndex] || "Jan";
    return `${day} ${month} ${year}`;
  }

  // Fallback for ISO timestamps
  try {
    const d = new Date(dbDate);
    if (!isNaN(d.getTime())) {
      const parts = getKolkataParts(d);
      return `${parts.dayStr} ${parts.monthShort} ${parts.year}`;
    }
  } catch {}

  return dbDate;
}

/**
 * Formats a UI date string ("DD Mon YYYY") into DB format "YYYY-MM-DD".
 */
export function formatUiDateToDb(uiDate?: string | null): string {
  if (!uiDate) return getTodayKolkataDbDate();
  const trimmed = uiDate.trim();

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Parse DD Mon YYYY
  const parts = trimmed.split(" ");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const monthKey = parts[1].substring(0, 3);
    const year = parts[2];
    const month = MONTH_MAP[monthKey] || "01";
    return `${year}-${month}-${day}`;
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const p = getKolkataParts(d);
      return `${p.year}-${p.monthStr}-${p.dayStr}`;
    }
  } catch {}

  return trimmed;
}

/**
 * Formats an ISO timestamp or date to clinic display string (with optional time) in Asia/Kolkata.
 * E.g., "13 Oct 2026, 03:30 PM"
 */
export function formatTimestampToKolkataUi(isoTimestamp?: string | null, includeTime: boolean = false): string {
  if (!isoTimestamp) return getTodayKolkataUiDate();

  try {
    const d = new Date(isoTimestamp);
    if (!isNaN(d.getTime())) {
      const p = getKolkataParts(d);
      if (includeTime) {
        return `${p.dayStr} ${p.monthShort} ${p.year}, ${p.time12}`;
      }
      return `${p.dayStr} ${p.monthShort} ${p.year}`;
    }
  } catch {}

  return formatDbDateToUi(isoTimestamp);
}

/**
 * Converts a slot time string (e.g. "09:30 AM" or "02:00 PM") to total minutes from midnight.
 */
export function parseSlotTimeToMinutes(slotStr: string): number {
  const match = slotStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && h < 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Determines whether a given slot has already passed for the specified date.
 * If targetDateDb is not today (e.g. future date), no slot is considered past.
 */
export function isSlotInThePast(slotStr: string, targetDateDb?: string): boolean {
  const todayDb = getTodayKolkataDbDate();
  const dateToCheck = targetDateDb ? formatUiDateToDb(targetDateDb) : todayDb;

  // If checking a future date, slot is not in the past
  if (dateToCheck > todayDb) return false;
  // If checking a past date, all slots are in the past
  if (dateToCheck < todayDb) return true;

  // For today, check current Kolkata minutes
  const nowParts = getKolkataParts();
  const currentMinutes = nowParts.hours24 * 60 + nowParts.minutes;
  const slotMinutes = parseSlotTimeToMinutes(slotStr);

  return slotMinutes <= currentMinutes;
}

/**
 * Returns the next available upcoming slot for today (or default "09:00 AM" if tomorrow/future).
 * Avoids automatically selecting a time that has already passed today.
 */
export function getNextAvailableAppointmentSlot(targetDateDb?: string, slotList: string[] = STANDARD_CLINIC_SLOTS): string {
  const todayDb = getTodayKolkataDbDate();
  const dateToCheck = targetDateDb ? formatUiDateToDb(targetDateDb) : todayDb;

  if (dateToCheck > todayDb) {
    return slotList[0] || "09:00 AM";
  }

  const nowParts = getKolkataParts();
  // Add a 10-minute buffer so if it's 09:25 AM, 09:30 AM is allowed, but 09:00 AM is skipped
  const currentMinutesWithBuffer = nowParts.hours24 * 60 + nowParts.minutes + 10;

  for (const slot of slotList) {
    const slotMinutes = parseSlotTimeToMinutes(slot);
    if (slotMinutes >= currentMinutesWithBuffer) {
      return slot;
    }
  }

  // If all clinic slots for today have ended, fallback to earliest slot or last slot
  return slotList[0] || "09:00 AM";
}

/**
 * Generates an array of the 15 calendar days ending at refDate (or today) in Asia/Kolkata.
 * Used for dynamic dashboard performance charts without hardcoded July/August 2026.
 */
export function getPast15DaysKolkata(refDateDb?: string) {
  const todayParts = getKolkataParts();
  let baseDate: Date;

  if (refDateDb) {
    const dbFmt = formatUiDateToDb(refDateDb);
    const [y, m, d] = dbFmt.split("-").map(Number);
    baseDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  } else {
    baseDate = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day, 12, 0, 0));
  }

  const days = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const p = getKolkataParts(d);
    const dbDate = `${p.year}-${p.monthStr}-${p.dayStr}`;
    const uiDate = `${p.dayStr} ${p.monthShort} ${p.year}`;
    const dateLabel = `${p.day} ${p.monthShort}`;
    const fullDate = `${p.monthShort} ${p.day}, ${p.year}`;
    days.push({
      date: dateLabel,
      fullDate,
      dbDate,
      uiDate
    });
  }

  return days;
}

/**
 * Returns start and end dates for the current calendar month in Asia/Kolkata.
 * Used as default custom range in reports.
 */
export function getCurrentMonthRangeKolkata() {
  const parts = getKolkataParts();
  const startDb = `${parts.year}-${parts.monthStr}-01`;
  const endDb = `${parts.year}-${parts.monthStr}-${parts.dayStr}`;
  return { startDb, endDb };
}
