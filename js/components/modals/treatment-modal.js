/**
 * treatment-modal.js — Create a treatment (name, category, visits, pricing).
 * @module components/modals/treatment-modal
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { modalShell, modalActions, modalSection, radioCard, closeModal } = Ivora.require('components/modals/shell');

  /** Open the modal with a blank form. */
  const openTreatmentModal = () => setState({
    modal: 'treatment', tName: '', tCat: 'cosmetic', tDesc: '',
    tPrice: '1,000', tDuration: '1 hour', tVisits: 4
  });

  const label = (text, trailing) => h('div.row', { style: { margin: '14px 0 6px' } },
    h('span', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)' } }, text),
    trailing && spacer(),
    trailing
  );

  const hint = (text) => h('div.row', {
    style: { gap: '5px', fontSize: '11px', color: 'var(--muted)', marginTop: '5px' }
  }, icon('info', { size: 14 }), text);

  function treatmentModal() {
    const body = h('div',
      h('div', { style: { fontSize: '14px', fontWeight: 800, marginBottom: '12px' } }, 'Basic Info'),

      h('div', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '6px' } },
        'Treatment Name'),
      h('input.input', {
        value: state.tName,
        placeholder: 'e.g. Braces Treatment',
        style: { height: '42px', borderRadius: '11px', fontSize: '13px' },
        oninput: (e) => setState({ tName: e.target.value })
      }),

      label('Treatment Category'),
      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '11px' }
      },
        radioCard('Medical Service', state.tCat === 'medical', () => setState({ tCat: 'medical' })),
        radioCard('Cosmetic Service', state.tCat === 'cosmetic', () => setState({ tCat: 'cosmetic' }))
      ),

      label('Treatment Description',
        h('span.mono', { style: { fontSize: '11px', color: 'var(--muted-2)' } }, `${state.tDesc.length} chars`)),
      h('textarea.textarea', {
        placeholder: 'Describe what this treatment covers...',
        style: { minHeight: '84px', borderRadius: '11px', padding: '11px 13px' },
        oninput: (e) => setState({ tDesc: e.target.value })
      }, state.tDesc),

      // Visit planner
      h('div.row.row--wrap', {
        style: {
          marginTop: '14px', background: 'var(--surface)', border: '1px solid var(--line)',
          borderInlineStart: '3px solid var(--brand)', borderRadius: '11px',
          padding: '13px 15px', gap: '12px'
        }
      },
        h('div', { style: { minWidth: 0, flex: '1' } },
          h('div', { style: { fontSize: '13px', fontWeight: 800 } }, `${state.tVisits} visits`),
          h('div.truncate', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            'Oral Hygiene → Scaling → Braces Application → Bracket Fit')
        ),
        h('button.btn-link', {
          type: 'button', style: { fontSize: '12px' },
          onclick: () => setState((s) => ({ tVisits: s.tVisits + 1 }))
        }, 'Add visit'),
        h('button.btn-link', {
          type: 'button', style: { fontSize: '12px', color: 'var(--danger)' },
          onclick: () => setState((s) => ({ tVisits: Math.max(1, s.tVisits - 1) }))
        }, 'Remove')
      ),

      modalSection('Price & Duration'),
      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '12px' }
      },
        h('div',
          h('div', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '6px' } },
            'Price Treatment'),
          h('div.row', {
            style: {
              gap: '8px', height: '42px', borderRadius: '11px', border: '1px solid var(--line)',
              background: 'var(--surface)', padding: '0 13px'
            }
          },
            h('span', { style: { fontSize: '13px', color: 'var(--muted)', fontWeight: 700 } }, '$'),
            h('input', {
              value: state.tPrice,
              style: {
                flex: '1', minWidth: 0, border: 'none', outline: 'none',
                fontSize: '13px', fontWeight: 600, background: 'transparent'
              },
              oninput: (e) => setState({ tPrice: e.target.value })
            })
          ),
          hint('Price for all treatment visits')
        ),
        h('div',
          h('div', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '6px' } },
            'Estimate Duration'),
          h('input.input', {
            value: state.tDuration,
            style: { height: '42px', borderRadius: '11px', fontSize: '13px', fontWeight: 600 },
            oninput: (e) => setState({ tDuration: e.target.value })
          }),
          hint('Duration for one treatment')
        )
      )
    );

    return modalShell({
      title: 'Add Treatment',
      body,
      bodyStyle: { background: 'var(--surface-2)' },
      footer: modalActions('Save', closeModal)
    });
  }

  Ivora.define('components/modals/treatment-modal', { openTreatmentModal: openTreatmentModal, treatmentModal: treatmentModal });
})();
