/**
 * report.js — Saved report library.
 * @module pages/report
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { flushCard, table, tableRow, badge, button } = Ivora.require('components/ui');
  var { REPORT_STATS, REPORTS } = Ivora.require('data/index');

  const COLS = 'minmax(220px,1.6fr) 170px 160px 140px';
  const HEAD = ['REPORT', 'PERIOD', 'GENERATED', 'FORMAT'];

  function statCard(s) {
    return h('div.card', { style: { borderRadius: '14px', padding: '16px 18px' } },
      h('div', { style: { fontSize: '11.5px', color: 'var(--ink-3)', fontWeight: 600 } }, s.label),
      h('div', { style: { fontSize: '23px', fontWeight: 800, letterSpacing: '-.03em', marginTop: '5px' } }, s.value),
      h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '3px' } }, s.sub)
    );
  }

  function reportPage() {
    return h('div',
      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: '14px', marginBottom: '16px'
        }
      }, REPORT_STATS.map(statCard)),

      flushCard(
        h('div.card-toolbar',
          h('span', { style: { fontSize: '15px', fontWeight: 800 } }, 'Saved reports'),
          spacer(),
          button('Export all', { icon: 'ios_share', variant: 'brand' })
        ),

        table({
          cols: COLS,
          min: '820px',
          head: HEAD,
          rows: REPORTS.map((r) => tableRow([
            h('div.row', { style: { gap: '10px', minWidth: 0 } },
              icon('description', { size: 18, color: 'var(--muted)' }),
              h('span.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, r.name)
            ),
            h('div.c-ink-3', r.period),
            h('div.c-ink-3', r.generated),
            h('div', badge(r.format, 'info'))
          ]))
        })
      )
    );
  }

  Ivora.define('pages/report', { reportPage: reportPage });
})();
