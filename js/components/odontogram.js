/**
 * odontogram.js — Interactive dental chart.
 *
 * Renders the four FDI arches as clickable teeth. Shared by the patient
 * Medical Record tab and the chairside check-up modal, which pass different
 * state sources through `stateOf`.
 *
 * @module components/odontogram
 */
(function () {
  'use strict';

  var { h } = Ivora.require('core/dom');
  var { ARCHES, TOOTH_STATE, toothLabel } = Ivora.require('data/index');

  /**
   * @param {object} [opts]
   *   `selected`  Tooth number currently focused.
   *   `onPick`    `(toothNumber) => void`
   *   `stateOf`   `(toothNumber) => 'treated'|'pending'|undefined`
   *               Defaults to the demo patient's stored chart.
   *   `large`     Bigger tap targets (used inside modals).
   * @returns {Element}
   */
  function odontogram(opts = {}) {
    const {
      selected = null,
      onPick,
      stateOf = (n) => TOOTH_STATE[n],
      large = false
    } = opts;

    return h(`div.odonto${large ? '.odonto--lg' : ''}`,
      ARCHES.map((arch) => h('div.odonto__arch',
        arch.map((n) => {
          const st = stateOf(n);
          const classes = [
            'tooth',
            st === 'treated' ? 'is-treated' : '',
            st === 'pending' ? 'is-pending' : '',
            n === selected ? 'is-selected' : ''
          ].filter(Boolean).join('.');

          return h(`button.${classes}`, {
            type: 'button',
            title: `Tooth ${n} — ${toothLabel(n)}`,
            onclick: () => onPick?.(n)
          }, n);
        })
      ))
    );
  }

  Ivora.define('components/odontogram', { odontogram: odontogram });
})();
