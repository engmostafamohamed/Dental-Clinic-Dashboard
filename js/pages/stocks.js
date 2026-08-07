/**
 * stocks.js — Consumable inventory and purchase orders.
 * @module pages/stocks
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { pct } = Ivora.require('core/format');
  var { flushCard, table, tableRow, button, searchBox, tabs } = Ivora.require('components/ui');
  var { openReceiveModal } = Ivora.require('components/modals/receive-modal');
  var { PRODUCTS, ORDERS, STOCK_STATUS, ORDER_STATUS } = Ivora.require('data/index');

  /* Headline figures for the whole catalogue, not just the sampled rows. */
  const TOTAL_VALUE = '$1,020,323';
  const TOTAL_PRODUCTS = 32;
  const HEALTH = { in: 21, low: 7, out: 4 };

  const INVENTORY_COLS = 'minmax(180px,1.3fr) minmax(160px,1fr) 130px 150px 100px 140px 130px';
  const INVENTORY_HEAD = ['NAME', 'CATEGORY', 'SKU', 'VENDOR', 'STOCK', 'STATUS', 'ASSET VALUE'];

  const ORDER_COLS = 'minmax(170px,1fr) 150px minmax(150px,1fr) 160px 180px 120px';
  const ORDER_HEAD = ['ORDER', 'CREATED', 'FROM VENDOR', 'STATUS', 'ITEM RECEIVED', ''];

  const TABS = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'orders', label: 'Order Stock' }
  ];

  /** Stock-health summary bar shown above the table. */
  function summaryCard() {
    const dot = (color) => h('span', {
      style: { width: '7px', height: '7px', borderRadius: '50%', background: color }
    });

    return h('div.card', {
      style: {
        padding: '16px 20px', display: 'flex', alignItems: 'center',
        gap: '28px', flexWrap: 'wrap', marginBottom: '16px'
      }
    },
      h('div.row', { style: { gap: '12px' } },
        h('div', {
          style: {
            width: '38px', height: '38px', borderRadius: '11px', background: 'var(--brand-soft)',
            color: 'var(--brand)', display: 'grid', placeItems: 'center', flex: 'none'
          }
        }, icon('paid', { size: 20 })),
        h('div',
          h('div.stat__label', 'TOTAL ASSET VALUE'),
          h('div', { style: { fontSize: '21px', fontWeight: 800, letterSpacing: '-.03em', marginTop: '2px' } },
            TOTAL_VALUE)
        )
      ),

      h('div', { style: { width: '1px', height: '44px', background: 'var(--bg)' } }),

      h('div', { style: { minWidth: '220px', flex: '1' } },
        h('div.row', { style: { alignItems: 'baseline', gap: '7px' } },
          h('span', { style: { fontSize: '17px', fontWeight: 800 } }, TOTAL_PRODUCTS),
          h('span', { style: { fontSize: '12px', color: 'var(--muted)' } }, 'products')
        ),
        h('div', {
          style: { display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px', marginTop: '8px' }
        },
          h('div', { style: { flex: String(HEALTH.in), background: 'var(--brand)' } }),
          h('div', { style: { flex: String(HEALTH.low), background: 'var(--warn-accent)' } }),
          h('div', { style: { flex: String(HEALTH.out), background: 'var(--danger)' } })
        ),
        h('div.row.row--wrap', {
          style: { gap: '14px', marginTop: '8px', fontSize: '11px', color: 'var(--ink-3)' }
        },
          h('span.row', { style: { gap: '5px' } }, dot('var(--brand)'), `In stock: ${HEALTH.in}`),
          h('span.row', { style: { gap: '5px' } }, dot('var(--warn-accent)'), `Low stock: ${HEALTH.low}`),
          h('span.row', { style: { gap: '5px' } }, dot('var(--danger)'), `Out of stock: ${HEALTH.out}`)
        )
      )
    );
  }

  function inventoryTable() {
    return table({
      cols: INVENTORY_COLS,
      min: '980px',
      head: INVENTORY_HEAD,
      rows: PRODUCTS.map((p) => {
        const status = STOCK_STATUS[p.status];
        return tableRow([
          h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, p.name),
          h('div.truncate.c-ink-3', p.category),
          h('div.mono', { style: { fontSize: '11.5px', color: 'var(--ink-2)' } }, p.sku),
          h('div', p.vendor),
          h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, p.stock),
          h('div', h(`span.badge.${status.cls}`, status.label)),
          h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, p.value)
        ]);
      })
    });
  }

  function ordersTable() {
    return table({
      cols: ORDER_COLS,
      min: '980px',
      head: ORDER_HEAD,
      rows: ORDERS.map((o) => {
        const status = ORDER_STATUS[o.status];
        const done = o.got >= o.of;

        return tableRow([
          h('div',
            h('div.mono', { style: { fontSize: '12px', fontWeight: 600 } }, o.id),
            h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
              `${o.items} items · ${o.total}`)
          ),
          h('div.c-ink-3', o.created),
          h('div', o.vendor),
          h('div', h(`span.badge.${status.cls}`, status.label)),
          h('div.row', { style: { gap: '9px' } },
            h('div', {
              style: { flex: '1', height: '5px', borderRadius: '3px', background: 'var(--bg)', overflow: 'hidden' }
            }, h('div', { style: { height: '100%', background: 'var(--brand)', width: `${pct(o.got, o.of)}%` } })),
            h('span', {
              style: { fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }
            }, `${o.got}/${o.of}`)
          ),
          h('div', done
            ? h('span', { style: { fontSize: '11.5px', color: 'var(--muted-2)', fontWeight: 600 } }, 'Received')
            : h('button.btn.btn-sm', {
                type: 'button',
                onclick: () => openReceiveModal(o),
                style: {
                  border: '1px solid var(--brand-line)', background: 'var(--surface)',
                  color: 'var(--brand)', fontSize: '11.5px', fontWeight: 700, padding: '0 14px'
                }
              }, 'Receive'))
        ]);
      })
    });
  }

  function stocksPage() {
    const onInventory = state.stockTab === 'inventory';

    return h('div',
      summaryCard(),

      flushCard(
        tabs(TABS, state.stockTab, (id) => setState({ stockTab: id }), { inset: true }),

        h('div.card-toolbar',
          searchBox({ placeholder: 'Search product or SKU...', width: '280px' }),
          spacer(),
          button('Filters', { icon: 'tune' }),
          button('New Product', { icon: 'add', variant: 'brand' })
        ),

        onInventory ? inventoryTable() : ordersTable()
      )
    );
  }

  Ivora.define('pages/stocks', { stocksPage: stocksPage });
})();
