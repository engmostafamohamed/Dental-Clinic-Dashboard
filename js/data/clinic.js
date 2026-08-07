/**
 * clinic.js — Navigation, staff, schedules and the appointment book.
 * @module data/clinic
 */
(function () {
  'use strict';

  /** Sidebar structure. `group` starts a captioned section, `rule` draws a divider. */
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { group: 'CLINIC' },
    { id: 'reservations', label: 'Reservations', icon: 'calendar_month' },
    { id: 'patients', label: 'Patients', icon: 'groups' },
    { id: 'treatments', label: 'Treatments', icon: 'medical_services' },
    { id: 'staff', label: 'Staff List', icon: 'badge' },
    { group: 'FINANCE' },
    { id: 'accounts', label: 'Accounts', icon: 'account_balance' },
    { id: 'sales', label: 'Sales', icon: 'payments' },
    { id: 'purchases', label: 'Purchases', icon: 'shopping_bag' },
    { id: 'payment', label: 'Payment Method', icon: 'credit_card' },
    { group: 'WEBSITE' },
    { id: 'website', label: 'Website Settings', icon: 'language' },
    { id: 'analytics', label: 'Website Analytics', icon: 'monitoring' },
    { group: 'PHYSICAL ASSET' },
    { id: 'stocks', label: 'Stocks', icon: 'inventory_2' },
    { id: 'peripherals', label: 'Peripherals', icon: 'handyman' },
    { rule: true },
    { id: 'report', label: 'Report', icon: 'bar_chart_4_bars' },
    { id: 'support', label: 'Customer Support', icon: 'support_agent' }
  ];

  const CLINIC = {
    name: 'Northgate Dental',
    address: '1142 Alder St, Portland OR',
    domain: 'ivoradental.com',
    user: {
      name: 'Dana Sørensen',
      role: 'Super admin',
      initials: 'DS',
      email: 'dana@northgate.com',
      phone: '(503) 555-0142',
      title: 'Practice Manager',
      joined: '04 Feb 2019',
      lastSignIn: 'Today at 08:12 · Portland, OR',
      twoFactor: true
    }
  };

  /* Dentist name constants — referenced by seeded appointments and forms. */
  const DR_SOAP = 'Dr. Soap Mactavish';
  const DR_PUTRI = 'Dr. Putri Larasati';
  const DR_JERALD = 'Dr. Jerald O’Hara';
  const DR_RONALD = 'Dr. Ronald Richards';

  /** Today's roster summary shown above the dashboard calendar. */
  const DENTISTS_TODAY = [
    { name: DR_SOAP, count: 4 },
    { name: DR_PUTRI, count: 5 },
    { name: DR_JERALD, count: 3 },
    { name: DR_RONALD, count: 4 }
  ];

  /** Appointment status → colour pair. */
  const STATUS_TONES = {
    Finished:   { tone: 'var(--ok)',     bg: 'var(--ok-soft)' },
    Encounter:  { tone: 'var(--warn)',   bg: 'var(--warn-soft)' },
    Registered: { tone: 'var(--info)',   bg: 'var(--info-soft)' },
    Waiting:    { tone: 'var(--ink-3)',  bg: 'var(--hover)' }
  };

  const STATUSES = ['Registered', 'Waiting', 'Encounter', 'Finished'];

  /** Seeded appointment book. `day` is added at store init from SEED_DAYS. */
  const APPOINTMENTS = [
    { id: 1,  hr: 9,  doctor: DR_SOAP,   patient: 'Rafli Jainudin',    dur: 1, treatment: 'General Checkup', status: 'Finished' },
    { id: 2,  hr: 9,  doctor: DR_JERALD, patient: 'Nadia Fawcett',     dur: 1, treatment: 'Bleaching',       status: 'Finished' },
    { id: 3,  hr: 10, doctor: DR_SOAP,   patient: 'Sekar Nandita',     dur: 1, treatment: 'Scaling',         status: 'Finished' },
    { id: 4,  hr: 10, doctor: DR_PUTRI,  patient: 'Angkasa Pura',      dur: 1, treatment: 'Bleaching',       status: 'Registered' },
    { id: 5,  hr: 11, doctor: DR_RONALD, patient: 'Halimah Yusuf',     dur: 1, treatment: 'Root Canal',      status: 'Encounter' },
    { id: 6,  hr: 12, doctor: DR_SOAP,   patient: 'Lembayung Senja',   dur: 1, treatment: 'Extraction',      status: 'Encounter' },
    { id: 7,  hr: 13, doctor: DR_JERALD, patient: 'Tobias Lindqvist',  dur: 1, treatment: 'Tooth Filling',   status: 'Waiting' },
    { id: 8,  hr: 14, doctor: DR_PUTRI,  patient: 'Daniswara Putri',   dur: 1, treatment: 'General Checkup', status: 'Registered' },
    { id: 9,  hr: 15, doctor: DR_RONALD, patient: 'Emeka Balogun',     dur: 1, treatment: 'Crown Fitting',   status: 'Registered' },
    { id: 10, hr: 16, doctor: DR_SOAP,   patient: 'Sofia Marchetti',   dur: 1, treatment: 'Veneers',         status: 'Registered' }
  ];

  /** Which day offset each seeded appointment lands on. */
  const SEED_DAYS = [0, 0, 0, 0, 0, 0, 3, 3, 4, 4];

  /** Hours rendered as rows on the reservation board. */
  const BOARD_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  const TREATMENT_NAMES = [
    'General Checkup', 'Scaling', 'Bleaching', 'Extraction',
    'Root Canal', 'Tooth Filling', 'Crown Fitting', 'Veneers'
  ];

  /** Reservation activity feed. */
  const ACTIVITY_LOG = [
    { rid: '#RSVA0011', when: 'Today 09:12',     patient: 'Rafli Jainudin',      treatment: 'General Checkup', dentist: DR_SOAP,   action: 'Marked as finished',       icon: 'check_circle',    tone: 'var(--ok)' },
    { rid: '#RSVA0014', when: 'Today 08:55',     patient: 'Angkasa Pura',        treatment: 'Bleaching',       dentist: DR_PUTRI,  action: 'Checked in at front desk', icon: 'login',           tone: 'var(--info)' },
    { rid: '#RSVA0018', when: 'Today 08:40',     patient: 'Halimah Yusuf',       treatment: 'Root Canal',      dentist: DR_RONALD, action: 'Moved from 10:00 to 11:00', icon: 'swap_vert',      tone: 'var(--warn)' },
    { rid: '#RSVA0021', when: 'Yesterday 17:30', patient: 'Clara Nightingale',   treatment: 'Scaling',         dentist: DR_JERALD, action: 'Cancelled by patient',     icon: 'cancel',          tone: 'var(--danger)' },
    { rid: '#RSVA0022', when: 'Yesterday 16:04', patient: 'Emeka Balogun',       treatment: 'Crown Fitting',   dentist: DR_RONALD, action: 'Booked online',            icon: 'event_available', tone: 'var(--brand)' },
    { rid: '#RSVA0023', when: 'Yesterday 14:18', patient: 'Sofia Marchetti',     treatment: 'Veneers',         dentist: DR_SOAP,   action: 'Reassigned from Dr. Lane', icon: 'swap_horiz',      tone: 'var(--purple)' },
    { rid: '#RSVA0024', when: '30 Jul 11:02',    patient: 'Tobias Lindqvist',    treatment: 'Tooth Filling',   dentist: DR_JERALD, action: 'Reminder sent by SMS',     icon: 'sms',             tone: 'var(--ink-3)' },
    { rid: '#RSVA0025', when: '30 Jul 09:47',    patient: 'Priya Raghunathan',   treatment: 'Extraction',      dentist: DR_PUTRI,  action: 'No-show recorded',         icon: 'person_off',      tone: 'var(--danger)' }
  ];

  /** Base staff records (contact + speciality). */
  const STAFF_BASE = [
    { name: DR_RONALD,            specialty: 'Pediatric Dentistry', phone: '209 555-0104', email: 'ronald@northgate.com', services: 'Dental service',            type: 'part' },
    { name: DR_JERALD,            specialty: 'Orthodontics',        phone: '302 555-0107', email: 'jerald@northgate.com', services: 'Dental, Oral Disease +2',   type: 'full' },
    { name: DR_PUTRI,             specialty: 'Endodontics',         phone: '629 555-0129', email: 'putri@northgate.com',  services: 'Dental service',            type: 'full' },
    { name: DR_SOAP,              specialty: 'Oral Surgery',        phone: '303 555-0105', email: 'soap@northgate.com',   services: 'Oral Disease service',      type: 'part' },
    { name: 'Dr. Devon Lane',     specialty: 'Periodontics',        phone: '603 555-0123', email: 'devon@northgate.com',  services: 'Dental, Oral Disease +2',   type: 'full' },
    { name: 'Dr. Jacob Jones',    specialty: 'Prosthodontics',      phone: '704 555-0127', email: 'jacob@northgate.com',  services: 'Dental, Oral Disease +2',   type: 'part' },
    { name: 'Dr. Marvin McKinney', specialty: 'Pediatric Dentistry', phone: '907 555-0101', email: 'marvin@northgate.com', services: 'Dental service',           type: 'part' },
    { name: 'Dr. Dianne Russell', specialty: 'General Dentistry',   phone: '406 555-0120', email: 'dianne@northgate.com', services: 'Dental, Oral Disease +2',   type: 'full' }
  ];

  /**
   * Working pattern per staff member, positionally aligned with STAFF_BASE.
   * `on` holds JS weekday numbers (0 = Sunday); `brk` is the lunch hour.
   */
  const SCHEDULES = [
    { on: [0, 2, 3, 4, 6],       start: 9,  end: 17, brk: 13 },
    { on: [1, 2, 3, 4, 5, 6],    start: 9,  end: 17, brk: 12 },
    { on: [0, 1, 2, 3, 4, 5, 6], start: 9,  end: 16, brk: 13 },
    { on: [1, 2, 3, 4, 5, 6],    start: 9,  end: 17, brk: 11 },
    { on: [1, 2, 3, 4],          start: 8,  end: 16, brk: 12 },
    { on: [2, 3, 4, 5, 6],       start: 11, end: 18, brk: 14 },
    { on: [1, 2, 4, 5],          start: 9,  end: 17, brk: 12 },
    { on: [0, 1, 2, 3, 4, 5],    start: 9,  end: 17, brk: 13 }
  ];

  /** Staff joined with their schedule — the shape every page consumes. */
  const DOCTORS = STAFF_BASE.map((d, i) => ({ ...d, ...SCHEDULES[i], on: SCHEDULES[i].on.slice() }));

  const SPECIALTIES = [
    'Oral Surgery', 'General Dentistry', 'Pediatric Dentistry', 'Orthodontics',
    'Endodontics', 'Periodontics', 'Prosthodontics'
  ];

  /** Weekday order used by the doctor form (Monday-first). */
  const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const DAYS_OFF = [
    { name: 'Winter Holiday',             range: '23 Dec 2026 – 03 Jan 2027' },
    { name: 'Independence Day',           range: '04 Jul 2027 – 05 Jul 2027' },
    { name: 'Continuing education week',  range: '14 Sep 2026 – 18 Sep 2026' }
  ];

  /** Service groups offered when configuring a dentist. */
  const COSMETIC_SERVICES = ['Teeth Whitening', 'Dental Veneers', 'Dental Bonding', 'Dental Crown', 'Inlays and Onlays', 'Dental Implants'];
  const MEDICAL_SERVICES = ['Bridges', 'Crowns', 'Fillings', 'Root canal treatment'];

  Ivora.define('data/clinic', {
    NAV: NAV,
    CLINIC: CLINIC,
    DR_SOAP: DR_SOAP,
    DR_PUTRI: DR_PUTRI,
    DR_JERALD: DR_JERALD,
    DR_RONALD: DR_RONALD,
    DENTISTS_TODAY: DENTISTS_TODAY,
    STATUS_TONES: STATUS_TONES,
    STATUSES: STATUSES,
    APPOINTMENTS: APPOINTMENTS,
    SEED_DAYS: SEED_DAYS,
    BOARD_HOURS: BOARD_HOURS,
    TREATMENT_NAMES: TREATMENT_NAMES,
    ACTIVITY_LOG: ACTIVITY_LOG,
    DOCTORS: DOCTORS,
    SPECIALTIES: SPECIALTIES,
    WEEK: WEEK,
    DAYS_OFF: DAYS_OFF,
    COSMETIC_SERVICES: COSMETIC_SERVICES,
    MEDICAL_SERVICES: MEDICAL_SERVICES
  });
})();
