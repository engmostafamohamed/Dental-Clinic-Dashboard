/**
 * shell.js — Modal chrome shared by every dialog.
 *
 * Provides the scrim, the positioned panel, and the head/body/foot slots so
 * individual modals only describe their content.
 *
 * @module components/modals/shell
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { setState } = Ivora.require('core/store');

  /** Close whichever modal is open. */
  const closeModal = () => setState({ modal: null });

  /**
   * @param {object} opts
   *   `title`   Heading text.
   *   `sub`     Optional sub-heading.
   *   `body`    Element(s) for the scrolling body.
   *   `footer`  Element(s) for the sticky footer.
   *   `size`    'sm' | 'md' | undefined (default 600px).
   *   `stack`   Render above another overlay (drawer-launched modals).
   *   `headExtra` Element rendered between the title and the close button.
   *   `bodyStyle` Inline overrides for the body (e.g. tinted background).
   *   `onClose` Custom close handler; defaults to clearing `state.modal`.
   * @returns {Element[]} `[scrim, panel]` — spread into the overlay host.
   */
  function modalShell(opts) {
    const {
      title, sub, body, footer, size, stack = false,
      headExtra, bodyStyle, onClose = closeModal
    } = opts;

    const scrim = h(`div.scrim.${stack ? 'scrim--stack' : 'scrim--modal'}`, { onclick: onClose });

    const panel = h(`div.modal${stack ? '.modal--stack' : ''}${size ? `.modal--${size}` : ''}`, {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title
    },
      h('div.modal__head',
        h('div', { style: { flex: '1', minWidth: 0 } },
          h('h2.modal__title', title),
          sub && h('div.modal__sub', sub)
        ),
        headExtra,
        h('button.modal__close', { type: 'button', onclick: onClose, title: 'Close' },
          icon('close', { size: 19 })
        )
      ),

      h('div.modal__body', { style: bodyStyle }, body),

      footer && h('div.modal__foot', footer)
    );

    return [scrim, panel];
  }

  /**
   * Standard Cancel / confirm footer.
   * @param {string} confirmLabel
   * @param {Function} onConfirm
   * @param {object} [opts] `{ disabled, cancelLabel, onCancel, tone }`
   */
  function modalActions(confirmLabel, onConfirm, opts = {}) {
    const {
      disabled = false,
      cancelLabel = 'Cancel',
      onCancel = closeModal,
      tone = 'brand'
    } = opts;

    return [
      h('button.btn.btn-outline', {
        type: 'button', onclick: onCancel,
        style: { flex: '1', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, cancelLabel),
      h(`button.btn.btn-${tone}`, {
        type: 'button', onclick: onConfirm, disabled: disabled || undefined,
        style: { flex: '1.6', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, confirmLabel)
    ];
  }

  /** Small bold caption used to divide modal sections. */
  const modalSection = (label) =>
    h('div', { style: { fontSize: '14px', fontWeight: 800, margin: '20px 0 12px' } }, label);

  /** Field label used inside modals. */
  const modalLabel = (text, trailing) =>
    h('div.row', { style: { margin: '14px 0 6px' } },
      h('span', { style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)' } }, text),
      trailing && spacer(),
      trailing
    );

  /** Radio-style choice card, as used by the treatment-category picker. */
  function radioCard(label, selected, onClick) {
    const border = selected ? 'var(--brand)' : 'var(--line)';
    return h('button', {
      type: 'button', onclick: onClick,
      style: {
        height: '44px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px',
        borderRadius: '11px', background: 'var(--surface)', cursor: 'pointer',
        textAlign: 'start', border: `1.5px solid ${border}`
      }
    },
      h('span', {
        style: {
          width: '17px', height: '17px', borderRadius: '50%', flex: 'none', display: 'grid',
          placeItems: 'center', border: `1.5px solid ${border}`
        }
      }, h('span', {
        style: {
          width: '9px', height: '9px', borderRadius: '50%',
          background: selected ? 'var(--brand)' : 'transparent'
        }
      })),
      h('span', { style: { fontSize: '12.5px', fontWeight: 600 } }, label)
    );
  }

  Ivora.define('components/modals/shell', {
    closeModal: closeModal,
    modalShell: modalShell,
    modalActions: modalActions,
    modalSection: modalSection,
    modalLabel: modalLabel,
    radioCard: radioCard
  });
})();
