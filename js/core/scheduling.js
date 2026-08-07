/**
 * scheduling.js — Appointment availability rules.
 *
 * The single source of truth for "can this dentist take this slot?". Both the
 * reservation board and the new-appointment form ask these functions rather
 * than re-deriving the rules, so a change to clinic policy lands in one place.
 *
 * @module core/scheduling
 */
(function () {
  'use strict';

  var { state } = Ivora.require('core/store');
  var { calDate, hourLabel, dayLabel } = Ivora.require('core/format');

  /** Does this dentist work on the given day offset? */
  function worksOn(doctor, dayOffset) {
    return !!doctor && doctor.on.includes(calDate(dayOffset).getDay());
  }

  /**
   * Why a slot cannot be booked, or `null` when it is free.
   *
   * @param {object} doctor
   * @param {number} dayOffset
   * @param {number} hour      Start hour, 24h.
   * @param {number} duration  Length in hours.
   * @param {number|null} [ignoreId]  Appointment id to disregard (when moving it).
   * @returns {'off'|'shift'|'break'|'taken'|null}
   */
  function slotBlocked(doctor, dayOffset, hour, duration, ignoreId = null) {
    if (!worksOn(doctor, dayOffset)) return 'off';
    if (hour < doctor.start || hour + duration > doctor.end) return 'shift';

    // A booking may not straddle the lunch hour.
    if (doctor.brk != null && hour <= doctor.brk && hour + duration > doctor.brk) return 'break';

    const clash = state.appts.some((a) =>
      a.day === dayOffset &&
      a.doctor === doctor.name &&
      a.id !== ignoreId &&
      hour < a.hr + a.dur &&
      a.hr < hour + duration
    );

    return clash ? 'taken' : null;
  }

  /**
   * Human explanation for a `slotBlocked` reason.
   * @returns {string} Empty string when the slot is bookable.
   */
  function blockedMessage(reason, doctor, dayOffset, hour) {
    if (!reason || !doctor) return '';

    switch (reason) {
      case 'off':
        return `${doctor.name} does not work on ${dayLabel(dayOffset)}. Pick another date or dentist.`;
      case 'taken':
        return `${doctor.name} already has an appointment at ${hourLabel(hour)} on ${dayLabel(dayOffset)}.`;
      case 'shift':
        return `${doctor.name} works ${hourLabel(doctor.start)} – ${hourLabel(doctor.end)}. `
          + 'This slot falls outside that shift.';
      case 'break':
        return `${doctor.name} is on break at ${hourLabel(doctor.brk)}. `
          + 'Pick a slot that does not overlap it.';
      default:
        return '';
    }
  }

  /** Is a single hour inside the doctor's shift and not their break? */
  const bookable = (doctor, hour) =>
    !!doctor && hour >= doctor.start && hour < doctor.end && hour !== doctor.brk;

  /** Find a doctor record by name. */
  const doctorByName = (name) => state.doctors.find((d) => d.name === name);

  /** Doctors rostered on for a given day offset. */
  const doctorsOnDuty = (dayOffset) => {
    const weekday = calDate(dayOffset).getDay();
    return state.doctors.filter((d) => d.on.includes(weekday));
  };

  Ivora.define('core/scheduling', {
    worksOn: worksOn,
    slotBlocked: slotBlocked,
    blockedMessage: blockedMessage,
    bookable: bookable,
    doctorByName: doctorByName,
    doctorsOnDuty: doctorsOnDuty
  });
})();
