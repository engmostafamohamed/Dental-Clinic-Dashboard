/**
 * peripherals.js — Fixed equipment register.
 * @module pages/peripherals
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { flushCard, table, tableRow, badge, button } = Ivora.require('components/ui');
  var { PERIPHERALS, ASSET_STATUS } = Ivora.require('data/index');

  const COLS = 'minmax(220px,1.5fr) minmax(150px,1fr) 150px 140px 140px';
  const HEAD = ['NAME', 'CATEGORY', 'ASSIGNED TO', 'STATUS', 'ASSET VALUE'];

  /** Total register size, including items not shown in this sample. */
  const TOTAL_ITEMS = 21;

  function peripheralsPage() {
    return flushCard(
      h('div.card-toolbar',
        icon('handyman', { size: 20, color: 'var(--brand)' }),
        h('span', { style: { fontSize: '15px', fontWeight: 800 } }, TOTAL_ITEMS),
        h('span.t-md.c-muted', 'equipment items'),
        spacer(),
        button('Filters', { icon: 'tune' }),
        button('Add Peripheral', { icon: 'add', variant: 'brand' })
      ),

      table({
        cols: COLS,
        min: '900px',
        head: HEAD,
        rows: PERIPHERALS.map((p) => {
          const status = ASSET_STATUS[p.status];
          return tableRow([
            h('div', { style: { minWidth: 0 } },
              h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, p.name),
              h('div.mono', { style: { fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' } }, p.sku)
            ),
            h('div.c-ink-3', p.category),
            h('div.row', { style: { gap: '6px' } },
              icon('meeting_room', { size: 16, color: 'var(--muted)' }),
              p.room
            ),
            h('div', h(`span.badge.${status.cls}`, status.label)),
            h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, p.value)
          ]);
        })
      })
    );
  }

  Ivora.define('pages/peripherals', { peripheralsPage: peripheralsPage });
})();
