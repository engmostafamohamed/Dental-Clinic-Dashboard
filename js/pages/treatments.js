/**
 * treatments.js — Service catalogue and pricing.
 * @module pages/treatments
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { flushCard, table, tableRow, badge, button, tabs } = Ivora.require('components/ui');
  var { openTreatmentModal } = Ivora.require('components/modals/treatment-modal');
  var { TREATMENTS } = Ivora.require('data/index');

  const COLS = 'minmax(190px,1.4fr) 150px 180px 150px 120px 130px';
  const HEAD = ['TREATMENT NAME', 'PRICE', 'ESTIMATE DURATION', 'TYPE OF VISIT', 'RATING', 'REVIEW'];

  /** The Inactive tab is presentational in this build — the catalogue is live. */
  const TABS = [
    { id: 'active', label: 'Active Treatment' },
    { id: 'inactive', label: 'Inactive Treatment' }
  ];

  function treatmentsPage() {
    return flushCard(
      tabs(TABS, 'active', () => {}, { inset: true }),

      h('div.card-toolbar',
        icon('medical_services', { size: 20, color: 'var(--brand)' }),
        h('span', { style: { fontSize: '15px', fontWeight: 800 } }, TREATMENTS.length),
        h('span.t-md.c-muted', 'treatments'),
        spacer(),
        button('Filters', { icon: 'tune' }),
        button('Add Treatment', { icon: 'add', variant: 'brand', onClick: () => openTreatmentModal() })
      ),

      table({
        cols: COLS,
        min: '980px',
        head: HEAD,
        rows: TREATMENTS.map((t) => tableRow([
          h('div.row', { style: { gap: '8px', minWidth: 0 } },
            h('span.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, t.name),
            t.sample && h('span', {
              style: {
                fontSize: '9px', fontWeight: 800, letterSpacing: '.05em', color: 'var(--muted)',
                background: 'var(--line-soft)', padding: '2px 6px', borderRadius: '5px'
              }
            }, 'SAMPLE')
          ),
          h('div.c-ink-3', 'Start from ', h('span', { style: { fontWeight: 700, color: 'var(--ink)' } }, t.price)),
          h('div', t.duration),
          h('div', t.visit === 'single'
            ? badge('SINGLE VISIT', 'ok')
            : badge('MULTIPLE VISIT', 'purple')),
          h('div.row', { style: { gap: '5px', fontSize: '12.5px', fontWeight: 700 } },
            icon('star', { size: 16, color: 'var(--warn-accent)', fill: true }),
            t.rating
          ),
          h('div.c-ink-3', `${t.reviews} review(s)`)
        ]))
      })
    );
  }

  Ivora.define('pages/treatments', { treatmentsPage: treatmentsPage });
})();
