/**
 * bill-drawer.js — Take a payment against a bill line.
 *
 * Slides in from the inline end of the viewport. Collects the destination
 * account, the payment method and an optional note.
 *
 * @module components/bill-drawer
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { initials } = Ivora.require('core/format');
  var { badge } = Ivora.require('components/ui');
  var { BILL_ACCOUNTS, BILL_METHODS } = Ivora.require('data/index');

  /** How many methods show before "Show more". */
  const COLLAPSED_METHODS = 2;

  /**
   * @param {object} bill  The parent bill row.
   * @param {object} line  The specific line being paid.
   */
  const openBillDrawer = (bill, line) => setState({
    billOpen: true,
    bill: { ...bill, line },
    account: BILL_ACCOUNTS[0].name,
    method: BILL_METHODS[0].name,
    note: '',
    showMore: false
  });

  const closeBillDrawer = () => setState({ billOpen: false, bill: null });

  /** A selectable row (account or payment method). */
  function optionRow(label, iconName, tint, selected, onClick) {
    return h('button', {
      type: 'button',
      onclick: onClick,
      style: {
        width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
        padding: '11px 12px', borderRadius: '11px', cursor: 'pointer', textAlign: 'start',
        background: selected ? 'var(--brand-soft)' : 'var(--surface)',
        border: `1.5px solid ${selected ? 'var(--brand)' : 'var(--line)'}`
      }
    },
      h('div', {
        style: {
          width: '32px', height: '32px', borderRadius: '9px', display: 'grid', placeItems: 'center',
          flex: 'none', background: tint ? 'transparent' : 'var(--surface-2)',
          color: tint || 'var(--ink-3)'
        }
      }, icon(iconName, { size: 18 })),
      h('span', { style: { fontSize: '12.5px', fontWeight: 600, flex: '1', minWidth: 0 } }, label),
      selected && icon('check_circle', { size: 18, color: 'var(--brand)', fill: true })
    );
  }

  function billDrawer() {
    if (!state.billOpen || !state.bill) return null;

    const bill = state.bill;
    const line = bill.line || {};
    const methods = state.showMore ? BILL_METHODS : BILL_METHODS.slice(0, COLLAPSED_METHODS);

    return [
      h('div.scrim.scrim--drawer', { onclick: closeBillDrawer }),

      h('div.drawer',
        h('div.drawer__head',
          h('div', { style: { flex: '1', minWidth: 0 } },
            h('div', { style: { fontSize: '15px', fontWeight: 800, letterSpacing: '-.02em' } }, 'Set payment'),
            h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
              `${bill.id} · ${bill.name}`)
          ),
          h('button.modal__close', { type: 'button', onclick: closeBillDrawer, title: 'Close' },
            icon('close', { size: 19 })
          )
        ),

        h('div.drawer__body', { style: { background: 'var(--surface-2)' } },
          // Amount summary
          h('div', {
            style: {
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: '13px', padding: '15px 16px'
            }
          },
            h('div.row', { style: { gap: '11px' } },
              h('div.avatar.avatar--md', { style: { background: 'var(--brand)' } }, initials(bill.name)),
              h('div', { style: { minWidth: 0, flex: '1' } },
                h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, bill.name),
                h('div.mono', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
                  `Bill ${line.id || '—'}`)
              ),
              badge('UNPAID', 'danger')
            ),

            h('div', { style: { height: '1px', background: 'var(--line-soft)', margin: '13px 0' } }),

            h('div.row',
              h('span', { style: { fontSize: '12px', color: 'var(--muted)' } }, line.forWhat || 'Treatment'),
              spacer(),
              h('span', { style: { fontSize: '20px', fontWeight: 800, letterSpacing: '-.03em' } },
                line.amount || bill.total)
            )
          ),

          h('div.eyebrow', { style: { margin: '18px 0 9px' } }, 'DEPOSIT TO'),
          h('div.stack', { style: { gap: '8px' } },
            BILL_ACCOUNTS.map((a) => optionRow(
              a.name, a.icon, a.tint,
              state.account === a.name,
              () => setState({ account: a.name })
            ))
          ),

          h('div.row', { style: { margin: '18px 0 9px' } },
            h('span.eyebrow', 'PAYMENT METHOD'),
            spacer(),
            h('button.btn-link', {
              type: 'button',
              onclick: () => setState((s) => ({ showMore: !s.showMore }))
            }, state.showMore ? 'Show less' : 'Show more')
          ),
          h('div.stack', { style: { gap: '8px' } },
            methods.map((m) => optionRow(
              m.name, m.icon, null,
              state.method === m.name,
              () => setState({ method: m.name })
            ))
          ),

          h('div.eyebrow', { style: { margin: '18px 0 9px' } }, 'NOTE'),
          h('textarea.textarea', {
            placeholder: 'Reference number, payer name...',
            style: { minHeight: '66px' },
            oninput: (e) => setState({ note: e.target.value })
          }, state.note)
        ),

        h('div.drawer__foot',
          h('div', { style: { display: 'flex', gap: '10px' } },
            h('button.btn.btn-outline', {
              type: 'button', onclick: closeBillDrawer,
              style: { flex: '1', height: '42px', borderRadius: '11px' }
            }, 'Cancel'),
            h('button.btn.btn-brand', {
              type: 'button', onclick: closeBillDrawer,
              style: { flex: '1.6', height: '42px', borderRadius: '11px' }
            }, 'Confirm payment')
          )
        )
      )
    ];
  }

  Ivora.define('components/bill-drawer', { openBillDrawer: openBillDrawer, closeBillDrawer: closeBillDrawer, billDrawer: billDrawer });
})();
