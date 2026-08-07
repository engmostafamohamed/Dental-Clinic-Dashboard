/**
 * transfer-modal.js — Move money between clinic accounts.
 *
 * Two stages: the form, then a confirmation summary. `trStage` tracks which
 * is showing so the footer's primary action can change meaning.
 *
 * @module components/modals/transfer-modal
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { money, parseMoney } = Ivora.require('core/format');
  var { modalShell, modalActions, closeModal } = Ivora.require('components/modals/shell');
  var { select, note } = Ivora.require('components/ui');
  var { ACCOUNTS } = Ivora.require('data/index');

  /** Account picker labels, e.g. "Free cash — $4,012,409". */
  const accountOptions = () =>
    ACCOUNTS.map((a) => `${a.label.charAt(0)}${a.label.slice(1).toLowerCase()} — ${a.amount}`);

  const openTransferModal = () => setState({
    modal: 'transfer',
    trStage: 'form',
    trFrom: accountOptions()[0],
    trTo: accountOptions()[2],
    trAmount: '1000',
    trNote: ''
  });

  const field = (label, control) => h('div',
    h('div', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '6px' } }, label),
    control
  );

  /** Stage 1 — the form. */
  function formStage() {
    const options = accountOptions();
    const sameAccount = state.trFrom === state.trTo;
    const amount = parseMoney(state.trAmount);

    return h('div.stack', { style: { gap: '14px' } },
      field('From account', select({
        value: state.trFrom, options, size: 'lg',
        onChange: (v) => setState({ trFrom: v })
      })),

      h('div', { style: { display: 'grid', placeItems: 'center' } },
        h('div', {
          style: {
            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-soft)',
            color: 'var(--brand)', display: 'grid', placeItems: 'center'
          }
        }, icon('south', { size: 18 }))
      ),

      field('To account', select({
        value: state.trTo, options, size: 'lg',
        onChange: (v) => setState({ trTo: v })
      })),

      field('Amount', h('div.row', {
        style: {
          gap: '8px', height: '42px', borderRadius: '11px', border: '1px solid var(--line)',
          background: 'var(--surface)', padding: '0 13px'
        }
      },
        h('span', { style: { fontSize: '13px', color: 'var(--muted)', fontWeight: 700 } }, '$'),
        h('input', {
          value: state.trAmount,
          inputmode: 'decimal',
          style: {
            flex: '1', minWidth: 0, border: 'none', outline: 'none',
            fontSize: '13px', fontWeight: 600, background: 'transparent'
          },
          oninput: (e) => setState({ trAmount: e.target.value })
        })
      )),

      field('Note (optional)', h('textarea.textarea', {
        placeholder: 'What is this transfer for?',
        style: { minHeight: '66px' },
        oninput: (e) => setState({ trNote: e.target.value })
      }, state.trNote)),

      sameAccount
        ? note('Source and destination cannot be the same account.', 'danger', 'error')
        : amount <= 0
          ? note('Enter an amount greater than zero.', 'warn', 'warning')
          : null
    );
  }

  /** Stage 2 — confirmation summary. */
  function confirmStage() {
    const amount = parseMoney(state.trAmount);

    const row = (label, value) => h('div.row', {
      style: { padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }
    },
      h('span', { style: { fontSize: '12px', color: 'var(--muted)' } }, label),
      spacer(),
      h('span', { style: { fontSize: '12.5px', fontWeight: 700, textAlign: 'end' } }, value)
    );

    return h('div',
      h('div', { style: { textAlign: 'center', padding: '10px 0 18px' } },
        h('div', {
          style: {
            width: '52px', height: '52px', borderRadius: '50%', background: 'var(--brand-soft)',
            color: 'var(--brand)', display: 'grid', placeItems: 'center', margin: '0 auto 12px'
          }
        }, icon('swap_horiz', { size: 26 })),
        h('div', { style: { fontSize: '24px', fontWeight: 800, letterSpacing: '-.03em' } }, money(amount)),
        h('div', { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '4px' } }, 'will be transferred')
      ),

      row('From', state.trFrom),
      row('To', state.trTo),
      state.trNote && row('Note', state.trNote),

      note('This is a demo build — no money actually moves.', 'info', 'info')
    );
  }

  function transferModal() {
    const onForm = state.trStage === 'form';
    const amount = parseMoney(state.trAmount);
    const invalid = state.trFrom === state.trTo || amount <= 0;

    return modalShell({
      title: onForm ? 'Transfer money' : 'Confirm transfer',
      sub: onForm ? 'Move funds between clinic accounts' : 'Check the details before confirming',
      size: 'sm',
      body: onForm ? formStage() : confirmStage(),
      footer: onForm
        ? modalActions('Continue', () => setState({ trStage: 'confirm' }), { disabled: invalid })
        : modalActions('Confirm transfer', closeModal, {
            cancelLabel: 'Back',
            onCancel: () => setState({ trStage: 'form' })
          })
    });
  }

  Ivora.define('components/modals/transfer-modal', { openTransferModal: openTransferModal, transferModal: transferModal });
})();
