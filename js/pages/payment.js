/**
 * payment.js — Checkout methods the front desk can accept.
 * @module pages/payment
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { button, toggle } = Ivora.require('components/ui');
  var { PAY_METHODS } = Ivora.require('data/index');

  /** Flip a method on or off. */
  const toggleMethod = (name) => setState((s) => ({
    methodsOn: { ...s.methodsOn, [name]: !s.methodsOn[name] }
  }));

  function methodCard(m) {
    const on = !!state.methodsOn[m.name];

    const fact = (label, value) => h('div',
      h('div', { style: { fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--muted)' } }, label),
      h('div', { style: { fontSize: '12.5px', fontWeight: 700, marginTop: '2px' } }, value)
    );

    return h('div.card', { style: { borderRadius: '14px', padding: '16px 18px' } },
      h('div.row', { style: { gap: '12px' } },
        h('div', {
          style: {
            width: '38px', height: '38px', borderRadius: '11px', background: 'var(--hover)',
            color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flex: 'none'
          }
        }, icon(m.icon, { size: 20 })),
        h('div', { style: { flex: '1', minWidth: 0 } },
          h('div', { style: { fontSize: '13.5px', fontWeight: 700 } }, m.name),
          h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '1px' } }, m.detail)
        ),
        toggle(on, () => toggleMethod(m.name))
      ),
      h('div.row', {
        style: {
          gap: '14px', marginTop: '14px', paddingTop: '12px',
          borderTop: '1px solid var(--line-soft)'
        }
      },
        fact('FEE', m.fee),
        fact('USED THIS MONTH', m.used)
      )
    );
  }

  function paymentPage() {
    return h('div',
      h('div.row.row--wrap', { style: { gap: '12px', marginBottom: '14px' } },
        h('div',
          h('div', { style: { fontSize: '16px', fontWeight: 800, letterSpacing: '-.02em' } }, 'Payment Methods'),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            'Methods your front desk can accept at checkout')
        ),
        spacer(),
        button('Add Method', { icon: 'add', variant: 'brand' })
      ),

      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '14px' }
      }, PAY_METHODS.map(methodCard))
    );
  }

  Ivora.define('pages/payment', { paymentPage: paymentPage });
})();
