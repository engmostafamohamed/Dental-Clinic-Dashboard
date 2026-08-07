/**
 * store.js — Single application state container.
 *
 * One mutable state object, a `setState` that shallow-merges and notifies,
 * and a subscriber list. `app.js` subscribes once and re-renders; nothing
 * else needs to know how rendering happens.
 *
 * Notifications are coalesced onto a microtask so a burst of setState calls
 * in one handler produces exactly one render.
 *
 * @module core/store
 */
(function () {
  'use strict';

  var { PATIENTS, APPOINTMENTS, SEED_DAYS, DOCTORS, SITE_SECTIONS, BILL_METHODS } = Ivora.require('data/index');

  /** Deep clone helper — the site tree is edited in place, so it starts fresh. */
  const clone = (v) => JSON.parse(JSON.stringify(v));

  /**
   * The initial state. Grouped by feature to stay navigable; every key that a
   * page reads is declared here so the shape is discoverable in one place.
   */
  function initialState() {
    return {
      // ── Navigation ──────────────────────────────────────────────────────
      page: 'dashboard',
      navOpen: false,
      userMenuOpen: false,
      vw: window.innerWidth,

      // ── Preferences (persisted) ─────────────────────────────────────────
      theme: 'light',
      lang: 'en',

      // ── Global search ───────────────────────────────────────────────────
      gq: '',

      // ── Patients ────────────────────────────────────────────────────────
      pq: '',
      patient: PATIENTS[0],
      pdTab: 'info',
      tooth: 22,

      // ── Reservations ────────────────────────────────────────────────────
      appts: APPOINTMENTS.map((a, i) => ({ ...a, day: SEED_DAYS[i] || 0 })),
      nextId: 100,
      dayOffset: 0,
      resvTab: 'calendar',
      rq: '',
      fDentist: 'All dentists',
      fStatus: 'All statuses',
      fTreatment: 'All treatments',
      drag: null,
      over: null,
      resv: null,
      resvStatus: null,
      // Inline reschedule editor on the reservation rail.
      resvEdit: false,
      resvDay: 0,
      resvHr: 9,
      resvDur: 1,

      // ── Staff ───────────────────────────────────────────────────────────
      doctors: clone(DOCTORS),
      staffFiltersOpen: false,
      sq: '',
      fSpec: 'All specialties',
      fType: 'All types',
      fDay: 'Any working day',

      // ── Stocks ──────────────────────────────────────────────────────────
      stockTab: 'inventory',

      // ── Sales / billing ─────────────────────────────────────────────────
      billOpen: false,
      bill: null,
      openRows: {},
      account: 'Free cash',
      accountOpen: false,
      note: '',
      method: 'Cash',
      showMore: false,

      // ── Payment methods page ────────────────────────────────────────────
      methodsOn: BILL_METHODS.reduce((acc, m) => {
        acc[m.name] = m.name !== 'E-wallet';
        return acc;
      }, {}),

      // ── Support ─────────────────────────────────────────────────────────
      ticket: 0,

      // ── Charts / range pickers ──────────────────────────────────────────
      cfRange: 'Last 12 months',
      ieRange: '6 mo',
      ptRange: 'This month',
      exRange: '6 mo',

      // ── Website builder ─────────────────────────────────────────────────
      site: clone(SITE_SECTIONS),
      siteSel: 'hero',
      siteDirty: false,
      siteDevice: 'desktop',
      previewOpen: false,
      siteNewId: 1,

      // ── Analytics ───────────────────────────────────────────────────────
      anRange: 'Last 7 days',
      anGeo: 'countries',

      // ── Profile ─────────────────────────────────────────────────────────
    profileTab: 'details',
    profileSaved: false,
    pwCurrent: '',
    pwNew: '',
    pwConfirm: '',
    pwErrors: {},
    pwDone: false,

    // ── Modals & panels ─────────────────────────────────────────────────
      modal: null,
      panel: null,

      // New / edit appointment form
      naMode: 'existing',
      naPatient: PATIENTS[0].name,
      naNewName: '',
      naNewPhone: '',
      naDentist: 'Dr. Soap Mactavish',
      naTreatment: 'General Checkup',
      naHr: 9,
      naDur: 1,
      naDay: 0,

      // Doctor form
      docStep: 1,
      docEdit: null,
      docType: 'full',
      docName: '',
      docEmail: '',
      docSpec: 'Pediatric Dentistry',
      docStart: 9,
      docEnd: 17,
      docBrk: 12,
      wd: {
        Monday: true, Tuesday: true, Wednesday: false, Thursday: false,
        Friday: true, Saturday: true, Sunday: false
      },
      svc: {
        'Teeth Whitening': true, 'Dental Crown': true, 'Inlays and Onlays': true,
        'Dental Implants': true, Bridges: true, Crowns: true, 'Root canal treatment': true
      },
      off: { 'Winter Holiday': true },

      // Treatment form
      tName: '',
      tCat: 'cosmetic',
      tDesc: '',
      tPrice: '1,000',
      tDuration: '1 hour',
      tVisits: 4,

      // Patient form
      patEdit: null,
      patName: '',
      patPhone: '',
      patEmail: '',
      patAge: '',
      patGender: 'Female',
      patAddress: '',
      patNote: '',

      // Transfer form
      trStage: 'form',
      trFrom: 'Free cash — $4,012,409',
      trTo: 'Treatment fund — $3,341,700',
      trAmount: '1000',
      trNote: '',

      // Receive stock form
      receiveOrder: null,
      rcv: {},
      rcNote: '',

      // ── Clinical record (chairside check-up) ────────────────────────────
      clinical: {},
      cuCursor: 0,
      cuSel: null,
      cuDraft: null,
      cuBp: '120/80',
      cuBlood: 'O+',
      cuMed: { Diabetes: true },
      cuComplaint: '',
      cuOralAns: { lastVisit: '< 3 months', brush: 'Twice', floss: 'Sometimes', rinse: 'Yes' },
      cuSoft: { 'Canker sores': true },
      cuOralNote: 'The lower and upper lips have canker sores',
      recChart: 'medical',

      // Visit scheduling (from the treatment plan panel)
      vEdit: null,
      vDay: 7,
      vHr: 11,
      vDur: 3,
      vDoctor: 'Dr. Soap Mactavish'
    };
  }

  /** @type {object} The live state. Read freely; never mutate directly. */
  const state = initialState();

  const listeners = new Set();
  let scheduled = false;

  /**
   * Merge a patch into state and schedule a render.
   *
   * @param {object|function} patch  An object to merge, or `(state) => patch`.
   *   Returning `null` from the function form skips the update entirely.
   */
  function setState(patch) {
    const next = typeof patch === 'function' ? patch(state) : patch;
    if (!next) return;
    Object.assign(state, next);
    schedule();
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  /** Force a render without changing state (used after imperative DOM work). */
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      for (const fn of listeners) fn(state);
    });
  }

  /**
   * Persisted preferences. Only theme and language survive a reload — the rest
   * of the state is demo data that should reset.
   */
  const PREFS_KEY = 'ivora.prefs';

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') || {};
    } catch {
      return {}; // storage blocked (private mode, file:// in some browsers)
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* storage blocked — preferences simply won't persist */
    }
  }

  Ivora.define('core/store', {
    initialState: initialState,
    state: state,
    setState: setState,
    subscribe: subscribe,
    schedule: schedule,
    loadPrefs: loadPrefs,
    savePrefs: savePrefs
  });
})();
