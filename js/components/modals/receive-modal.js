/**
 * receive-modal.js — Record a stock delivery against a purchase order.
 * @module components/modals/receive-modal
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { modalShell, modalActions, closeModal } = Ivora.require('components/modals/shell');
  var { check, note } = Ivora.require('components/ui');
  var { RECEIVABLE } = Ivora.require('data/index');

  /**
   * @param {object} order  The purchase order being received against.
   */
  const openReceiveModal = (order) => setState({
    modal: 'receive',
    receiveOrder: order,
    rcv: {},
    rcNote: ''
  });

  /** Toggle one line item's received flag. */
  const toggleLine = (sku) => setState((s) => ({
    rcv: { ...s.rcv, [sku]: !s.rcv[sku] }
  }));

  function receiveModal() {
    const order = state.receiveOrder;
    const checkedCount = RECEIVABLE.filter((r) => state.rcv[r.sku]).length;

    const body = h('div',
      order && h('div.row.row--wrap', {
        style: {
          gap: '12px', padding: '12px 14px', borderRadius: '12px',
          background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: '16px'
        }
      },
        h('div', {
          style: {
            width: '34px', height: '34px', borderRadius: '10px', background: 'var(--brand-soft)',
            color: 'var(--brand)', display: 'grid', placeItems: 'center', flex: 'none'
          }
        }, icon('local_shipping', { size: 19 })),
        h('div', { style: { minWidth: 0, flex: '1' } },
          h('div.mono', { style: { fontSize: '12px', fontWeight: 600, color: 'var(--ink)' } }, order.id),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            `${order.vendor} · ${order.items} items · ${order.total}`)
        ),
        h('span.badge.badge-muted', `${order.got}/${order.of} RECEIVED`)
      ),

      h('div.eyebrow', { style: { marginBottom: '10px' } }, 'ITEMS IN THIS DELIVERY'),

      h('div.stack', { style: { gap: '8px' } },
        RECEIVABLE.map((item) => {
          const on = !!state.rcv[item.sku];
          return h('div.row', {
            style: {
              gap: '11px', padding: '11px 13px', borderRadius: '11px',
              border: `1px solid ${on ? 'var(--brand-line)' : 'var(--line)'}`,
              background: on ? 'var(--brand-soft)' : 'var(--surface)',
              cursor: 'pointer'
            },
            onclick: () => toggleLine(item.sku)
          },
            check(on, () => toggleLine(item.sku)),
            h('div', { style: { minWidth: 0, flex: '1' } },
              h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, item.name),
              h('div.mono', { style: { fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' } }, item.sku)
            ),
            h('span', { style: { fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' } }, `× ${item.qty}`)
          );
        })
      ),

      h('div', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', margin: '16px 0 6px' } },
        'Delivery note'),
      h('textarea.textarea', {
        placeholder: 'Damaged packaging, short delivery, batch numbers...',
        style: { minHeight: '66px' },
        oninput: (e) => setState({ rcNote: e.target.value })
      }, state.rcNote),

      checkedCount === 0 && h('div', { style: { marginTop: '14px' } },
        note('Tick at least one item to record the delivery.', 'warn', 'warning'))
    );

    return modalShell({
      title: 'Receive delivery',
      sub: 'Confirm what physically arrived',
      body,
      footer: modalActions(
        `Receive ${checkedCount || ''} item${checkedCount === 1 ? '' : 's'}`.replace('  ', ' '),
        closeModal,
        { disabled: checkedCount === 0 }
      )
    });
  }

  Ivora.define('components/modals/receive-modal', { openReceiveModal: openReceiveModal, receiveModal: receiveModal });
})();
