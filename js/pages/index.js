/**
 * index.js — Page registry.
 *
 * Maps a route id to the function that builds its screen. `app.js` never
 * imports a page directly, so adding a screen means adding one line here.
 *
 * @module pages
 */
(function () {
  'use strict';

  var { dashboardPage } = Ivora.require('pages/dashboard');
  var { reservationsPage } = Ivora.require('pages/reservations');
  var { patientsPage } = Ivora.require('pages/patients');
  var { patientDetailPage } = Ivora.require('pages/patient-detail');
  var { treatmentsPage } = Ivora.require('pages/treatments');
  var { staffPage } = Ivora.require('pages/staff');
  var { accountsPage } = Ivora.require('pages/accounts');
  var { salesPage } = Ivora.require('pages/sales');
  var { purchasesPage } = Ivora.require('pages/purchases');
  var { paymentPage } = Ivora.require('pages/payment');
  var { websitePage } = Ivora.require('pages/website');
  var { analyticsPage } = Ivora.require('pages/analytics');
  var { stocksPage } = Ivora.require('pages/stocks');
  var { peripheralsPage } = Ivora.require('pages/peripherals');
  var { reportPage } = Ivora.require('pages/report');
  var { supportPage } = Ivora.require('pages/support');
  var { profilePage } = Ivora.require('pages/profile');
  var { stubPage } = Ivora.require('pages/stub');

  const PAGES = {
    dashboard: dashboardPage,
    reservations: reservationsPage,
    patients: patientsPage,
    patientDetail: patientDetailPage,
    treatments: treatmentsPage,
    staff: staffPage,
    accounts: accountsPage,
    sales: salesPage,
    purchases: purchasesPage,
    payment: paymentPage,
    website: websitePage,
    analytics: analyticsPage,
    stocks: stocksPage,
    peripherals: peripheralsPage,
    report: reportPage,
    support: supportPage,
    profile: profilePage
  };

  /**
   * Build the screen for a route.
   * @param {string} page
   * @returns {Element}
   */
  function pageFor(page) {
    const build = PAGES[page];
    return build ? build() : stubPage(page);
  }

  Ivora.define('pages/index', { pageFor: pageFor });
})();
