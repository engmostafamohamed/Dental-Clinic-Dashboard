/**
 * format.js — Pure formatting and date helpers.
 *
 * No DOM, no state. Everything here is a total function so it can be reused
 * freely by pages, components and the demo data layer.
 *
 * @module core/format
 */
(function () {
  'use strict';

  /** The demo clinic's "today". Fixing it keeps the seeded data coherent. */
  const CAL_BASE = [2026, 7, 1]; // 1 August 2026

  const MONTHS_UP = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * Initials from a person's name, ignoring an honorific.
   * `'Dr. Soap Mactavish'` → `'SM'`
   */
  function initials(name) {
    return String(name)
      .replace(/^(Dr\.?|Drg\.?)\s+/i, '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /** 24h hour → compact label. `9` → `'9am'`, `13` → `'1pm'` */
  function hourLabel(h) {
    return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`;
  }

  /** 24h hour → clock label. `9` → `'09:00 AM'` */
  function hourClock(h) {
    const hh = String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0');
    return `${hh}:00 ${h < 12 ? 'AM' : 'PM'}`;
  }

  /** Start hour + duration → `'11:00 AM – 02:00 PM'` */
  function hourRange(h, duration) {
    return `${hourClock(h)} – ${hourClock(h + duration)}`;
  }

  /** Map of compact hour labels back to 24h numbers, 7am–8pm. */
  const HOUR_BY_LABEL = (() => {
    const map = {};
    for (let h = 7; h <= 20; h++) map[hourLabel(h)] = h;
    return map;
  })();

  /** A Date `offset` days after the fixed base date. */
  function calDate(offset) {
    return new Date(CAL_BASE[0], CAL_BASE[1], CAL_BASE[2] + offset);
  }

  /** `'Sat, 1 Aug 2026'` for a day offset. */
  function dayLabel(offset) {
    const d = calDate(offset);
    return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** Long form: `'Saturday, 1 August 2026'`. */
  function longDayLabel(offset) {
    const d = calDate(offset);
    const monthLong = d.toLocaleString('en-GB', { month: 'long' });
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${monthLong} ${d.getFullYear()}`;
  }

  /** 63 selectable days from the base date, for date <select> controls. */
  const DAY_OPTIONS = Array.from({ length: 63 }, (_, i) => ({
    off: i,
    label: dayLabel(i)
  }));

  const DAY_BY_LABEL = DAY_OPTIONS.reduce((map, d) => {
    map[d.label] = d.off;
    return map;
  }, {});

  /**
   * Format a number as US dollars with no decimals.
   * `4012409` → `'$4,012,409'`
   */
  function money(n, decimals = 0) {
    return `$${Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  /** Thousands separators, no currency symbol. */
  function num(n) {
    return Number(n).toLocaleString('en-US');
  }

  /** Parse `'$1,240'` / `'1,000'` → `1240` / `1000`. Returns 0 on junk. */
  function parseMoney(str) {
    const n = Number(String(str).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  /** Clamp a number into a range. */
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  /** Percentage of a total, guarding against divide-by-zero. */
  const pct = (value, total) => (total ? (value / total) * 100 : 0);

  /** Deterministic tint for a list index — keeps avatar colours stable. */
  const TINTS = ['#0e7a70', '#3a51a8', '#b26a00', '#8a4bb8', '#c0362c', '#1f7a9c', '#5b6474', '#14875a'];
  const tintFor = (i) => TINTS[i % TINTS.length];

  /** Case-insensitive "does haystack contain needle", tolerant of null. */
  const has = (haystack, needle) =>
    String(haystack ?? '').toLowerCase().includes(String(needle ?? '').toLowerCase());

  Ivora.define('core/format', {
    CAL_BASE: CAL_BASE,
    MONTHS_UP: MONTHS_UP,
    MONTHS: MONTHS,
    WEEKDAYS_SHORT: WEEKDAYS_SHORT,
    WEEKDAYS: WEEKDAYS,
    initials: initials,
    hourLabel: hourLabel,
    hourClock: hourClock,
    hourRange: hourRange,
    HOUR_BY_LABEL: HOUR_BY_LABEL,
    calDate: calDate,
    dayLabel: dayLabel,
    longDayLabel: longDayLabel,
    DAY_OPTIONS: DAY_OPTIONS,
    DAY_BY_LABEL: DAY_BY_LABEL,
    money: money,
    num: num,
    parseMoney: parseMoney,
    clamp: clamp,
    pct: pct,
    TINTS: TINTS,
    tintFor: tintFor,
    has: has
  });
})();
