/**
 * overlays.js — Single host for everything that floats above the page.
 *
 * `app.js` calls `renderOverlays()` once, at the end of the shell, so the
 * z-index ladder in overlays.css is the only thing deciding stacking order.
 *
 * @module components/overlays
 */
(function () {
  'use strict';

  var { state } = Ivora.require('core/store');

  var { apptModal } = Ivora.require('components/modals/appt-modal');
  var { doctorModal } = Ivora.require('components/modals/doctor-modal');
  var { patientModal } = Ivora.require('components/modals/patient-modal');
  var { treatmentModal } = Ivora.require('components/modals/treatment-modal');
  var { transferModal } = Ivora.require('components/modals/transfer-modal');
  var { receiveModal } = Ivora.require('components/modals/receive-modal');
  var { checkupModal } = Ivora.require('components/modals/checkup-modal');

  var { reservationRail } = Ivora.require('components/reservation-panel');
  var { billDrawer } = Ivora.require('components/bill-drawer');
  var { sitePreview } = Ivora.require('components/site-preview');

  /** Modal id → builder. */
  const MODALS = {
    appt: apptModal,
    doctor: doctorModal,
    patient: patientModal,
    treatment: treatmentModal,
    transfer: transferModal,
    receive: receiveModal,
    checkup: checkupModal
  };

  /**
   * Which overlays were on screen last render.
   *
   * A state change rebuilds the whole tree, so an open dialog is a brand new
   * element on every click inside it. Entry animations therefore have to be
   * opt-in per render, or they restart constantly — see the note in
   * css/overlays.css.
   */
  let previous = {};

  /**
   * Mark an overlay as entering, but only the first time it appears.
   *
   * Builders return either a single element (site preview) or an array of
   * them (a scrim plus its panel), so both shapes are accepted.
   *
   * @param {string} name         Stable key for this overlay.
   * @param {string} id           Changes when a *different* overlay of the same
   *                              kind opens — one modal replacing another
   *                              should animate again.
   * @param {Element|Array} nodes Element(s) to flag.
   */
  function markEntering(name, id, nodes) {
    if (previous[name] !== id) {
      const list = Array.isArray(nodes) ? nodes : [nodes];
      for (const node of list) {
        if (node && node.classList) node.classList.add('is-entering');
      }
    }
    previous[name] = id;
  }

  /**
   * Build every open overlay.
   * @returns {Array} Nodes to append after the shell (may be empty).
   */
  function renderOverlays() {
    const out = [];
    const seen = {};

    // Reservation rail sits below modals so a check-up can open on top of it.
    const rail = reservationRail();
    if (rail) {
      const id = String(state.resv && state.resv.id) + ':' + String(state.panel);
      markEntering('rail', id, rail);
      seen.rail = true;
      out.push(rail);
    }

    const drawer = billDrawer();
    if (drawer) {
      markEntering('drawer', String(state.bill && state.bill.id), drawer);
      seen.drawer = true;
      out.push(drawer);
    }

    const modal = MODALS[state.modal];
    if (modal) {
      const nodes = modal();
      markEntering('modal', state.modal, nodes);
      seen.modal = true;
      out.push(nodes);
    }

    const preview = sitePreview();
    if (preview) {
      markEntering('preview', 'open', preview);
      seen.preview = true;
      out.push(preview);
    }

    // Forget overlays that closed, so reopening them animates again.
    for (const key of Object.keys(previous)) {
      if (!seen[key]) delete previous[key];
    }

    return out;
  }

  Ivora.define('components/overlays', { renderOverlays: renderOverlays });
})();
