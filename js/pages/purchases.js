/**
 * purchases.js — Vendor invoices.
 * @module pages/purchases
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { flushCard, table, tableRow, badge, button } = Ivora.require('components/ui');
  var { PURCHASES } = Ivora.require('data/index');

  const COLS = '140px minmax(170px,1.2fr) minmax(170px,1fr) 140px 130px 140px';
  const HEAD = ['INVOICE', 'VENDOR', 'CATEGORY', 'DATE', 'AMOUNT', 'STATUS'];

  /** Month-to-date spend shown in the toolbar. */
  const MONTH_TOTAL = '$61,234';

  function purchasesPage() {
    return flushCard(
      h('div.card-toolbar',
        icon('shopping_bag', { size: 20, color: 'var(--brand)' }),
        h('span', { style: { fontSize: '15px', fontWeight: 800 } }, MONTH_TOTAL),
        h('span.t-md.c-muted', 'purchased this month'),
        spacer(),
        button('New Purchase', { icon: 'add', variant: 'brand' })
      ),

      table({
        cols: COLS,
        min: '940px',
        head: HEAD,
        rows: PURCHASES.map((p) => tableRow([
          h('div.mono', { style: { fontSize: '12px', color: 'var(--ink-2)' } }, p.id),
          h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, p.vendor),
          h('div.c-ink-3', p.category),
          h('div.c-ink-3', p.date),
          h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, p.amount),
          h('div', p.status === 'paid' ? badge('PAID', 'ok') : badge('DUE', 'warn'))
        ]))
      })
    );
  }

  Ivora.define('pages/purchases', { purchasesPage: purchasesPage });
})();
