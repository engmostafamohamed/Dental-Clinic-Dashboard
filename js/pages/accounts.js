/**
 * accounts.js — Asset summary plus active and inactive account cards.
 * @module pages/accounts
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { button } = Ivora.require('components/ui');
  var { openTransferModal } = Ivora.require('components/modals/transfer-modal');
  var { ACCOUNTS, INACTIVE_ACCOUNTS } = Ivora.require('data/index');

  /** Headline asset totals. */
  const SUMMARY = [
    { label: 'TOTAL ASSET VALUE', value: '$13,232,432', icon: 'savings',     tint: 'var(--brand)',  bg: 'var(--brand-soft)' },
    { label: 'LIQUID ASSETS',     value: '$8,983,123',  icon: 'water_drop',  tint: 'var(--info)',   bg: 'var(--info-soft)',   delta: '↑ 4.51%', deltaTone: 'var(--ok)' },
    { label: 'PHYSICAL ASSETS',   value: '$4,249,309',  icon: 'chair',       tint: 'var(--purple)', bg: 'var(--purple-soft)', delta: '↓ 2.51%', deltaTone: 'var(--danger)' }
  ];

  function summaryCard(s) {
    return h('div.card', {
      style: { borderRadius: '14px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'center' }
    },
      h('div', {
        style: {
          width: '38px', height: '38px', borderRadius: '11px', background: s.bg,
          color: s.tint, display: 'grid', placeItems: 'center', flex: 'none'
        }
      }, icon(s.icon, { size: 20 })),
      h('div',
        h('div.stat__label', s.label),
        h('div.row.row--wrap', { style: { alignItems: 'baseline', gap: '7px', marginTop: '3px' } },
          h('span', { style: { fontSize: '22px', fontWeight: 800, letterSpacing: '-.03em' } }, s.value),
          s.delta && h('span', { style: { fontSize: '11.5px', fontWeight: 700, color: s.deltaTone } }, s.delta)
        )
      )
    );
  }

  function activeCard(a) {
    return h('div.card', { style: { borderRadius: '14px', padding: '16px 18px' } },
      h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px' } },
        h('div', {
          style: {
            width: '38px', height: '38px', borderRadius: '11px', display: 'grid',
            placeItems: 'center', color: 'var(--surface)', flex: 'none', background: a.tint
          }
        }, icon(a.icon, { size: 20 })),
        h('div', { style: { flex: '1', minWidth: 0 } },
          h('div.stat__label', a.label),
          h('div', { style: { fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em', marginTop: '3px' } }, a.amount)
        ),
        h('button.header-icon-btn.header-icon-btn--ghost', {
          type: 'button', title: 'Account actions',
          style: { width: '28px', height: '28px', borderRadius: '8px' }
        }, icon('more_horiz', { size: 18 }))
      ),
      h('div', {
        style: {
          fontSize: '11.5px', color: 'var(--muted)', marginTop: '12px',
          paddingTop: '12px', borderTop: '1px solid var(--line-soft)'
        }
      }, a.note)
    );
  }

  function inactiveCard(a) {
    return h('div', {
      style: {
        background: 'var(--surface-2)', border: '1px solid var(--line)',
        borderRadius: '14px', padding: '16px 18px'
      }
    },
      h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px' } },
        h('div', {
          style: {
            width: '38px', height: '38px', borderRadius: '11px', background: 'var(--bg)',
            color: 'var(--muted-2)', display: 'grid', placeItems: 'center', flex: 'none'
          }
        }, icon(a.icon, { size: 20 })),
        h('div', { style: { flex: '1', minWidth: 0 } },
          h('div', {
            style: { fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--muted-2)' }
          }, a.label),
          h('div', {
            style: { fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em', marginTop: '3px', color: 'var(--muted)' }
          }, a.amount)
        ),
        h('button.btn.btn-sm', {
          type: 'button',
          style: {
            height: '28px', padding: '0 11px', borderRadius: '8px',
            border: '1px solid var(--brand-line)', background: 'var(--surface)',
            color: 'var(--brand)', fontSize: '11px', fontWeight: 700, flex: 'none'
          }
        }, 'Activate')
      ),
      h('div', {
        style: {
          fontSize: '11.5px', color: 'var(--muted-2)', marginTop: '12px',
          paddingTop: '12px', borderTop: '1px solid var(--bg)'
        }
      }, `No rek. ${a.note}`)
    );
  }

  const cardGrid = (children) => h('div', {
    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }
  }, children);

  function accountsPage() {
    return h('div',
      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '14px' }
      }, SUMMARY.map(summaryCard)),

      h('div.row.row--wrap', { style: { gap: '12px', margin: '22px 0 14px' } },
        h('div',
          h('div', { style: { fontSize: '16px', fontWeight: 800, letterSpacing: '-.02em' } }, 'List Account'),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            'All accounts are set up manually')
        ),
        spacer(),
        button('Transfer money', { icon: 'swap_horiz', onClick: openTransferModal }),
        button('Add new account', { icon: 'add', variant: 'brand' })
      ),

      h('div.eyebrow', { style: { marginBottom: '10px' } }, 'ACTIVE LIST'),
      cardGrid(ACCOUNTS.map(activeCard)),

      h('div.eyebrow', { style: { margin: '22px 0 10px' } }, 'INACTIVE LIST'),
      cardGrid(INACTIVE_ACCOUNTS.map(inactiveCard))
    );
  }

  Ivora.define('pages/accounts', { accountsPage: accountsPage });
})();
