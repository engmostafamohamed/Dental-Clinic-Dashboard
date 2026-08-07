/**
 * patients.js — Patient roster, visit history and the dental chart model.
 * @module data/patients
 */
(function () {
  'use strict';

  const PATIENT_COUNT = 72;

  const PATIENTS = [
    { name: 'Willa Jennings',   phone: '(302) 555-0107', email: 'willa.jennings@mail.com',   registered: '12 Mar 2024', lastVisit: '05 Jun 2026', lastTreatment: 'Tooth Scaling + Bleaching', age: '32', gender: 'Female', address: '8309 Barby Hill, Portland OR' },
    { name: 'Michelle Rivera',  phone: '(208) 555-0112', email: 'michelle.rivera@mail.com',  registered: '12 Mar 2024', lastVisit: '03 May 2026', lastTreatment: 'Tooth Scaling + Veneers',   age: '41', gender: 'Female', address: '534 Victoria Trail, Portland OR' },
    { name: 'Tim Jennings',     phone: '(225) 555-0118', email: 'tim.jennings@mail.com',     registered: '10 Mar 2024', lastVisit: '17 Oct 2025', lastTreatment: 'Tooth Scaling',            age: '29', gender: 'Male',   address: '87 Dahle Way, Portland OR' },
    { name: 'Deanna Curtis',    phone: '(229) 555-0109', email: 'deanna.curtis@mail.com',    registered: '09 Mar 2024', lastVisit: '26 Oct 2025', lastTreatment: 'Root Canal Treatment',     age: '37', gender: 'Female', address: '755 Butterfield Place' },
    { name: 'Nathan Roberts',   phone: '(209) 555-0104', email: 'nathan.roberts@mail.com',   registered: '06 Mar 2024', lastVisit: '21 Mar 2026', lastTreatment: 'Tooth Scaling',            age: '45', gender: 'Male',   address: '14 3rd Avenue, Portland OR' },
    { name: 'Bill Sanders',     phone: '(207) 555-0119', email: 'bill.sanders@mail.com',     registered: '05 Mar 2024', lastVisit: '22 Jan 2026', lastTreatment: 'Tooth Scaling',            age: '52', gender: 'Male',   address: '4 Ridge Oak Parkway' },
    { name: 'Alma Lawson',      phone: '(808) 555-0111', email: 'alma.lawson@mail.com',      registered: '04 Mar 2024', lastVisit: '16 Apr 2026', lastTreatment: 'Dental Crown and Bridge',  age: '61', gender: 'Female', address: '516 Pawling Road' },
    { name: 'Debra Holt',       phone: '(205) 555-0100', email: 'debra.holt@mail.com',       registered: '05 Mar 2024', lastVisit: '23 Mar 2026', lastTreatment: 'Tooth Scaling',            age: '48', gender: 'Female', address: '815 Corscot Park' },
    { name: 'Micheal Mitc',     phone: '(219) 555-0114', email: 'michael.mitc@mail.com',     registered: '06 Mar 2024', lastVisit: '27 Jun 2026', lastTreatment: 'Tooth Scaling',            age: '33', gender: 'Male',   address: '2759 Pearson Terrace' },
    { name: 'Kenzi Lawson',     phone: '(270) 555-0117', email: 'kenzi.lawson@mail.com',     registered: '06 Mar 2024', lastVisit: '01 May 2026', lastTreatment: 'Tooth Scaling',            age: '26', gender: 'Female', address: '01 Chive Circle' }
  ];

  /** Visit timeline shown on the patient detail page. */
  const VISITS = [
    { mon: 'MAY', day: '08', title: 'Visit #4 – Root Canal Phase 4', dentist: 'Dr. Soap Mactavish', time: '11:00 am – 02:00 pm', rid: '#RSVA0014', state: 'upcoming' },
    { mon: 'MAY', day: '02', title: 'Visit #3 – Root Canal Phase 3', dentist: 'Dr. Soap Mactavish', time: '11:00 am – 02:00 pm', rid: '#RSVA0013', state: 'done' },
    { mon: 'APR', day: '26', title: 'Single Tooth Scaling',          dentist: 'Dr. Putri Larasati', time: '11:00 am – 12:00 pm', rid: '#RSVA0015', state: 'done' },
    { mon: 'APR', day: '22', title: 'Visit #2 – Root Canal Phase 2', dentist: 'Dr. Soap Mactavish', time: '11:00 am – 02:00 pm', rid: '#RSVA0012', state: 'done' }
  ];

  /* --------------------------------------------------------------------------
     Dental chart (FDI two-digit notation)
     Quadrants: 1x upper-right, 2x upper-left, 3x lower-left, 4x lower-right.
     -------------------------------------------------------------------------- */

  /** Four rows as drawn: upper-right, upper-left, lower-right, lower-left. */
  const ARCHES = [
    [18, 17, 16, 15, 14, 13, 12, 11],
    [21, 22, 23, 24, 25, 26, 27, 28],
    [48, 47, 46, 45, 44, 43, 42, 41],
    [31, 32, 33, 34, 35, 36, 37, 38]
  ];

  const ALL_TEETH = ARCHES.flat();

  /** Pre-existing chart state for the demo patient. */
  const TOOTH_STATE = { 11: 'treated', 18: 'pending', 21: 'treated', 22: 'treated', 34: 'pending' };

  const TOOTH_NAMES = {
    11: 'Maxillary Right Central Incisor',
    18: 'Maxillary Right 3rd Molar',
    21: 'Maxillary Left Central Incisor',
    22: 'Maxillary Left Lateral Incisor',
    34: 'Mandibular Left 1st Premolar'
  };

  /** Position within a quadrant → anatomical name. */
  const TOOTH_POSITIONS = {
    1: 'Central Incisor', 2: 'Lateral Incisor', 3: 'Canine', 4: '1st Premolar',
    5: '2nd Premolar', 6: '1st Molar', 7: '2nd Molar', 8: '3rd Molar'
  };

  /** Fall back to the generic positional name when a tooth has no entry. */
  const toothLabel = (n) =>
    TOOTH_NAMES[n] || TOOTH_POSITIONS[Number(String(n)[1])] || 'Tooth';

  /** Per-tooth treatment log rendered under the chart. */
  const TOOTH_LOG = [
    { mon: 'MAY', day: '02', condition: 'Pulpitis', treatment: 'Root canal', dentist: 'Dr. Soap Mactavish', state: 'done',    note: 'Canal cleaned and shaped. Temporary filling placed; patient reported no discomfort on percussion.' },
    { mon: 'APR', day: '22', condition: 'Caries',   treatment: 'Filling canal', dentist: 'Dr. Soap Mactavish', state: 'pending', note: 'Deep distal lesion. Scheduled for a second visit to complete the obturation.' }
  ];

  /** Oral-hygiene questionnaire shown on the patient info tab. */
  const ORAL_HABITS = [
    { label: 'Latest dental visit',  value: 'Less than 3 months ago' },
    { label: 'Brushes per day',      value: 'Twice' },
    { label: 'Uses mouthwash',       value: 'Yes' },
    { label: 'Uses floss',           value: 'Yes' },
    { label: 'Replaces toothbrush',  value: 'Every 3 months' },
    { label: 'Started dental care',  value: 'About 20 years ago' }
  ];

  /** Options for the chairside oral-check step. */
  const ORAL_QUESTIONS = [
    { key: 'lastVisit', label: 'Latest dental visit', options: ['< 3 months', '3–12 months', '> 1 year'] },
    { key: 'brush',     label: 'Brushes per day',     options: ['Once', 'Twice', '3 or more'] },
    { key: 'floss',     label: 'Uses floss',          options: ['Daily', 'Sometimes', 'Never'] },
    { key: 'rinse',     label: 'Uses mouthwash',      options: ['Yes', 'No'] }
  ];

  const MEDICAL_CONDITIONS = ['Diabetes', 'High blood pressure', 'Heart condition', 'Penicillin allergy', 'Latex allergy', 'Pregnancy', 'Asthma'];
  const SOFT_TISSUE = ['Healthy gums', 'Gum bleeding', 'Canker sores', 'Coated tongue', 'Dry mouth'];
  const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const GENDERS = ['Female', 'Male'];

  Ivora.define('data/patients', {
    PATIENT_COUNT: PATIENT_COUNT,
    PATIENTS: PATIENTS,
    VISITS: VISITS,
    ARCHES: ARCHES,
    ALL_TEETH: ALL_TEETH,
    TOOTH_STATE: TOOTH_STATE,
    TOOTH_NAMES: TOOTH_NAMES,
    toothLabel: toothLabel,
    TOOTH_LOG: TOOTH_LOG,
    ORAL_HABITS: ORAL_HABITS,
    ORAL_QUESTIONS: ORAL_QUESTIONS,
    MEDICAL_CONDITIONS: MEDICAL_CONDITIONS,
    SOFT_TISSUE: SOFT_TISSUE,
    BLOOD_TYPES: BLOOD_TYPES,
    GENDERS: GENDERS
  });
})();
