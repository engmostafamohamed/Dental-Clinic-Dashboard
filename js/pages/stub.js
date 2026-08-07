/**
 * stub.js — Placeholder for routes without a bespoke screen yet.
 * @module pages/stub
 */
(function () {
  'use strict';

  var { h, icon } = Ivora.require('core/dom');
  var { TITLES } = Ivora.require('core/router');

  function stubPage(page) {
    return h('div.card.card--pad', { style: { textAlign: 'center', padding: '60px 24px' } },
      icon('construction', { size: 40, color: 'var(--muted-2)' }),
      h('div', { style: { fontSize: '16px', fontWeight: 800, marginTop: '12px' } }, TITLES[page] || page),
      h('div.t-md.c-muted', { style: { marginTop: '6px' } }, 'This screen is not part of the current build.')
    );
  }

  Ivora.define('pages/stub', { stubPage: stubPage });
})();
