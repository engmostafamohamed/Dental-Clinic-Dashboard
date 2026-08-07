/**
 * support.js — Patient message inbox and reply pane.
 * @module pages/support
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { initials } = Ivora.require('core/format');
  var { flushCard, badge, button, textarea } = Ivora.require('components/ui');
  var { TICKETS, UNREAD_TICKETS } = Ivora.require('data/index');

  function inboxRow(ticket, index) {
    const active = state.ticket === index;

    return h('button', {
      type: 'button',
      onclick: () => setState({ ticket: index }),
      style: {
        width: '100%', textAlign: 'start', border: 'none', display: 'block',
        padding: '13px 16px', cursor: 'pointer',
        borderBottom: '1px solid var(--line-soft)',
        background: active ? 'var(--brand-soft)' : 'var(--surface)',
        boxShadow: active ? 'inset 2px 0 0 var(--brand)' : 'none'
      },
      onmouseenter: (e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; },
      onmouseleave: (e) => { if (!active) e.currentTarget.style.background = 'var(--surface)'; }
    },
      h('div.row', { style: { gap: '8px' } },
        h('span', { style: { fontSize: '12.5px', fontWeight: 700 } }, ticket.from),
        spacer(),
        h('span', { style: { fontSize: '10.5px', color: 'var(--muted)' } }, ticket.time)
      ),
      h('div', { style: { fontSize: '12px', color: 'var(--ink-2)', marginTop: '3px', fontWeight: 600 } },
        ticket.subject),
      h('div.truncate', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
        ticket.preview)
    );
  }

  function supportPage() {
    const ticket = TICKETS[state.ticket] || TICKETS[0];

    return h('div.grid-auto', { style: { alignItems: 'start' } },
      // Inbox
      flushCard(
        h('div.row', {
          style: { padding: '14px 16px', borderBottom: '1px solid var(--bg)', gap: '10px' }
        },
          h('span', { style: { fontSize: '14px', fontWeight: 800 } }, 'Inbox'),
          h('span', {
            style: {
              fontSize: '10px', fontWeight: 800, color: 'var(--surface)',
              background: 'var(--danger)', padding: '2px 7px', borderRadius: '10px'
            }
          }, UNREAD_TICKETS)
        ),
        TICKETS.map(inboxRow)
      ),

      // Conversation
      h('div.card', { style: { padding: '20px' } },
        h('div.row.row--wrap', { style: { gap: '12px' } },
          h('div.avatar.avatar--md', { style: { background: 'var(--brand)' } }, initials(ticket.from)),
          h('div',
            h('div', { style: { fontSize: '14.5px', fontWeight: 800 } }, ticket.subject),
            h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
              `${ticket.from} · ${ticket.time}`)
          ),
          spacer(),
          badge('OPEN', 'warn')
        ),

        h('div', {
          style: {
            marginTop: '18px', fontSize: '13px', lineHeight: 1.65,
            color: 'var(--ink-2)', textWrap: 'pretty'
          }
        }, ticket.body),

        h('textarea.textarea', {
          placeholder: 'Write a reply...',
          style: { marginTop: '18px', minHeight: '110px', borderRadius: '12px', padding: '12px 14px', fontSize: '13px' }
        }),

        h('div.row', { style: { gap: '10px', marginTop: '12px' } },
          button('Send reply', { variant: 'brand', size: 'lg' }),
          button('Mark resolved', { size: 'lg' })
        )
      )
    );
  }

  Ivora.define('pages/support', { supportPage: supportPage });
})();
