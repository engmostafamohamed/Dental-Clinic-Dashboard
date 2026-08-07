/**
 * router.js — Hash-based routing.
 *
 * Every page is addressable (`#/patients`, `#/sales`) so links are
 * shareable and the browser Back button works. The router owns nothing but
 * the `page` key in the store.
 *
 * @module core/router
 */
(function () {
  'use strict';

  var { state, setState } = Ivora.require('core/store');

  /** Pages that have a real implementation. Anything else renders the stub. */
  const ROUTES = [
    'dashboard', 'reservations', 'patients', 'patientDetail', 'treatments',
    'staff', 'accounts', 'sales', 'purchases', 'payment', 'website',
    'analytics', 'stocks', 'peripherals', 'report', 'support', 'profile'
  ];

  /** Human titles shown in the header. */
  const TITLES = {
    dashboard: 'Dashboard',
    reservations: 'Reservations',
    patients: 'Patients',
    patientDetail: 'Patient',
    treatments: 'Treatments',
    staff: 'Staff List',
    accounts: 'Accounts',
    sales: 'Sales',
    purchases: 'Purchases',
    payment: 'Payment Method',
    website: 'Website Settings',
    analytics: 'Website Analytics',
    stocks: 'Stocks',
    peripherals: 'Peripherals',
    report: 'Report',
    support: 'Customer Support',
    profile: 'My Profile'
  };

  /**
   * Read the current route.
   *
   * The hash wins. Failing that, a page in pages/ may declare which screen it
   * opens on by setting `window.IVORA_START_PAGE` before the bundle loads —
   * that is what makes pages/patients.html land on Patients. Everything after
   * the first paint is hash navigation.
   */
  function fromHash() {
    const raw = location.hash.replace(/^#\/?/, '').trim();
    if (ROUTES.includes(raw)) return raw;

    const declared = typeof window !== 'undefined' ? window.IVORA_START_PAGE : null;
    return ROUTES.includes(declared) ? declared : 'dashboard';
  }

  /**
   * Navigate to a page. Writing the hash triggers `hashchange`, which is what
   * actually updates the store — so navigation has exactly one code path
   * whether it came from a click or a typed URL.
   *
   * @param {string} page
   * @param {object} [extra] Additional state to merge with the page change.
   */
  function go(page, extra = {}) {
    setState({ ...extra, navOpen: false, gq: '' });
    if (fromHash() === page && state.page === page) return;
    location.hash = `#/${page}`;
  }

  /**
   * Start the router. Syncs the store to the URL now and on every change.
   * @param {() => void} [onChange] Called after each route change.
   */
  function startRouter(onChange) {
    const sync = () => {
      const page = fromHash();
      if (state.page !== page) {
        // Leaving a page closes anything transient it had open.
        setState({ page, resv: null, modal: null, panel: null, billOpen: false });
      }
      onChange?.();
    };

    window.addEventListener('hashchange', sync);

    if (!location.hash) location.hash = `#/${fromHash()}`;
    else sync();
  }

  /** The page to highlight in the sidebar (detail pages map to their parent). */
  function navPageOf(page) {
    return page === 'patientDetail' ? 'patients' : page;
  }

  Ivora.define('core/router', { ROUTES: ROUTES, TITLES: TITLES, go: go, startRouter: startRouter, navPageOf: navPageOf });
})();
