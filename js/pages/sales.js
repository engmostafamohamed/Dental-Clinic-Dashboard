/**
 * sales.js — Revenue summary and the expandable bill ledger.
 *
 * Each bill row expands to show its individual bill lines; a line with an
 * outstanding balance opens the payment drawer.
 *
 * @module pages/sales
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { initials, tintFor } = Ivora.require('core/format');
  var { flushCard, badge, button } = Ivora.require('components/ui');
  var { openBillDrawer } = Ivora.require('components/bill-drawer');
  var { BILLS } = Ivora.require('data/index');

  const COLS = '150px minmax(180px,1.4fr) 110px 130px 120px 130px 74px';
  const MIN = '1010px';

  /** Headline KPIs. */
  const SUMMARY = [
    { label: 'Revenue this month', value: '$154,280', icon: 'payments',      tint: 'var(--brand)',  bg: 'var(--brand-soft)', delta: '↑ 8.4%', deltaTone: 'var(--ok)' },
    { label: 'Profit this month',  value: '$41,905',  icon: 'savings',       tint: 'var(--info)',   bg: 'var(--info-soft)',  delta: '↓ 3.1%', deltaTone: 'var(--danger)' },
    { label: 'Outstanding',        value: '$8,640',   icon: 'hourglass_top', tint: 'var(--warn)',   bg: 'var(--warn-soft)',  sub: 'across 12 bills' },
    { label: 'Bills issued',       value: '148',      icon: 'receipt_long',  tint: 'var(--ink-3)',  bg: 'var(--hover)',      sub: '1 – 31 July 2026' }
  ];

  /** Bill status → badge. */
  const STATUS_BADGE = {
    paid:    () => badge('FULLY PAID', 'ok'),
    partial: () => badge('PARTIALLY PAID', 'warn'),
    unpaid:  () => badge('UNPAID', 'danger')
  };

  function summaryCard(s) {
    return h('div.card', {
      style: { borderRadius: '14px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }
    },
      h('div', {
        style: {
          width: '38px', height: '38px', borderRadius: '11px', background: s.bg,
          color: s.tint, display: 'grid', placeItems: 'center', flex: 'none'
        }
      }, icon(s.icon, { size: 20 })),
      h('div', { style: { minWidth: 0, flex: '1' } },
        h('div', { style: { fontSize: '12px', color: 'var(--ink-3)', fontWeight: 600 } }, s.label),
        h('div', {
          style: { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 8px', marginTop: '4px' }
        },
          h('div', { style: { fontSize: '23px', fontWeight: 800, letterSpacing: '-.03em' } }, s.value),
          s.delta && h('div', { style: { fontSize: '11.5px', fontWeight: 700, color: s.deltaTone } }, s.delta)
        ),
        s.sub && h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } }, s.sub)
      )
    );
  }

  /** The always-visible summary line for one bill. */
  function billRow(bill, index) {
    const open = !!state.openRows[bill.id];

    const toggle = () => setState((s) => ({
      openRows: { ...s.openRows, [bill.id]: !s.openRows[bill.id] }
    }));

    return h('div', { style: { display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: '12px', padding: '11px 20px' } },
      h('div.row', { style: { gap: '7px' } },
        h('span.mono', { style: { fontSize: '12px', color: 'var(--ink-2)' } }, bill.id),
        bill.isNew && h('span', {
          style: {
            fontSize: '9px', fontWeight: 800, letterSpacing: '.05em', color: 'var(--brand)',
            background: 'var(--brand-soft)', padding: '2px 6px', borderRadius: '5px'
          }
        }, 'NEW')
      ),
      h('div.row', { style: { gap: '10px', minWidth: 0 } },
        h('div.avatar', { style: { background: tintFor(index) } }, initials(bill.name)),
        h('span.truncate', { style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--brand)' } }, bill.name)
      ),
      h('div', { style: { fontSize: '12.5px', color: 'var(--ink-2)' } }, bill.bills),
      h('div', { style: { fontSize: '12.5px', color: 'var(--ink-2)' } }, bill.date),
      h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, bill.total),
      h('div', (STATUS_BADGE[bill.status] || STATUS_BADGE.unpaid)()),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
        h('button.header-icon-btn.header-icon-btn--ghost', {
          type: 'button',
          onclick: toggle,
          title: open ? 'Collapse' : 'Expand',
          style: { width: '28px', height: '28px', borderRadius: '8px' }
        }, icon(open ? 'expand_less' : 'expand_more', { size: 18 }))
      )
    );
  }

  /** One expanded bill line. */
  function billLine(bill, line) {
    return h('div', {
      style: {
        display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
        gap: '12px', padding: '10px 20px', borderBottom: '1px solid var(--line-soft)'
      }
    },
      h('div'),
      h('div', { style: { fontSize: '12px', color: 'var(--muted)' } },
        'Bill ID ',
        h('span.mono', { style: { fontWeight: 600, color: 'var(--ink-2)' } }, line.id)
      ),
      h('div', { style: { fontSize: '12px', color: 'var(--muted)', gridColumn: 'span 2' } },
        'For ',
        h('span', { style: { fontWeight: 700, color: 'var(--ink-2)' } }, line.forWhat)
      ),
      h('div', { style: { fontSize: '12px', color: 'var(--muted)' } },
        'Amount ',
        h('span', { style: { fontWeight: 700, color: 'var(--ink)' } }, line.amount)
      ),
      h('div', line.state === 'unpaid'
        ? badge('UNPAID', 'danger')
        : line.state === 'pay'
          ? h('button.btn.btn-brand.btn-sm', {
              type: 'button',
              onclick: () => openBillDrawer(bill, line),
              style: { height: '29px', padding: '0 14px' }
            }, 'Set Payment')
          : badge('PAID', 'ok')),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '2px' } },
        h('button.header-icon-btn.header-icon-btn--ghost', {
          type: 'button', title: 'Print bill',
          style: { width: '28px', height: '28px', borderRadius: '8px' }
        }, icon('print', { size: 17 }))
      )
    );
  }

  function salesPage() {
    return h('div',
      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(236px,1fr))',
          gap: '14px', marginBottom: '18px'
        }
      }, SUMMARY.map(summaryCard)),

      flushCard(
        h('div.card-toolbar', { style: { padding: '14px 20px' } },
          h('span', { style: { fontSize: '14.5px', fontWeight: 800 } }, 'Bills'),
          spacer(),
          h('button.btn.btn-outline', { type: 'button' },
            icon('calendar_today', { size: 17, color: 'var(--muted)' }),
            '1 – 31 Jul 2026',
            icon('expand_more', { size: 17, color: 'var(--muted-2)' })
          ),
          button('Export', { icon: 'ios_share', variant: 'brand' })
        ),

        h('div.dtable-scroll',
          h('div', { style: { minWidth: MIN } },
            // Header
            h('div', {
              style: {
                display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: '12px',
                padding: '10px 20px', background: 'var(--surface-2)',
                borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
                fontSize: '10.5px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--muted)'
              }
            },
              ['RESERVATION ID', 'PATIENT NAME', 'NUMBER OF BILL', 'DATE', 'TOTAL', 'PAYMENT', '']
                .map((label) => h('div', label))
            ),

            BILLS.map((bill, i) => h('div', {
              style: { borderBottom: '1px solid var(--line-soft)', minWidth: MIN }
            },
              billRow(bill, i),
              state.openRows[bill.id] && h('div', {
                style: { background: 'var(--surface-2)', borderTop: '1px solid var(--line-soft)', minWidth: MIN }
              }, bill.lines.map((line) => billLine(bill, line)))
            ))
          )
        )
      )
    );
  }

  Ivora.define('pages/sales', { salesPage: salesPage });
})();
