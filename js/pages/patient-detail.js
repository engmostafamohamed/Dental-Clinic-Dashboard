/**
 * patient-detail.js — Single patient record.
 *
 * Four tabs: general information, appointment history, the next treatment
 * plan, and the odontogram-backed medical record.
 *
 * @module pages/patient-detail
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { go } = Ivora.require('core/router');
  var { initials } = Ivora.require('core/format');
  var { card, flushCard, badge, button, tabs, kv } = Ivora.require('components/ui');
  var { odontogram } = Ivora.require('components/odontogram');
  var { openPatientModal } = Ivora.require('components/modals/patient-modal');
  var { openApptModal } = Ivora.require('components/modals/appt-modal');
  var { VISITS, ORAL_HABITS, TOOTH_LOG, toothLabel } = Ivora.require('data/index');

  const TABS = [
    { id: 'info', label: 'Patient Information' },
    { id: 'history', label: 'Appointment History' },
    { id: 'next', label: 'Next Treatment' },
    { id: 'record', label: 'Medical Record' }
  ];

  /** Default note when the patient record carries none. */
  const DEFAULT_NOTE = 'Patient prefers morning appointments.';

  /* --------------------------------------------------------------------------
     Header
     -------------------------------------------------------------------------- */
  function patientHeader(p) {
    return h('div.card', {
      style: { padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }
    },
      h('div.avatar.avatar--lg', { style: { background: 'var(--brand)' } }, initials(p.name)),

      h('div', { style: { minWidth: 0 } },
        h('div', { style: { fontSize: '18px', fontWeight: 800, letterSpacing: '-.02em' } }, p.name),
        h('div.row', {
          style: {
            gap: '8px', marginTop: '6px', border: '1px solid var(--line)',
            borderRadius: '9px', padding: '6px 10px', background: 'var(--surface-2)'
          }
        },
          icon('sticky_note_2', { size: 16, color: 'var(--muted)' }),
          h('span', { style: { fontSize: '11.5px', color: 'var(--ink-2)' } }, p.note || DEFAULT_NOTE),
          h('button.btn-link', { type: 'button', onclick: () => openPatientModal(p) }, 'Edit')
        )
      ),

      spacer(),
      button('Edit Patient', { icon: 'edit', onClick: () => openPatientModal(p) }),
      button('Create Appointment', {
        variant: 'brand',
        onClick: () => openApptModal({ patient: p.name })
      })
    );
  }

  /* --------------------------------------------------------------------------
     Tab: information
     -------------------------------------------------------------------------- */
  function infoTab(p) {
    return h('div.grid-auto', { style: { marginTop: '16px' } },
      card(
        h('div.eyebrow', { style: { marginBottom: '12px' } }, 'GENERAL INFO'),
        h('div.kv-grid',
          kv('FULL NAME', p.name),
          kv('PHONE', p.phone),
          kv('AGE', p.age),
          h('div',
            h('div.kv__k', 'EMAIL'),
            h('div.kv__v', { style: { wordBreak: 'break-all' } }, p.email)
          ),
          kv('GENDER', p.gender),
          kv('ADDRESS', p.address)
        )
      ),
      card(
        h('div.eyebrow', { style: { marginBottom: '12px' } }, 'ORAL HYGIENE HABITS'),
        h('div.kv-grid',
          ORAL_HABITS.map((o) => h('div',
            h('div', { style: { fontSize: '11px', color: 'var(--muted)' } }, o.label),
            h('div', { style: { fontSize: '12.5px', fontWeight: 700, marginTop: '2px' } }, o.value)
          ))
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Tab: appointment history
     -------------------------------------------------------------------------- */
  function historyTab() {
    return flushCard({ style: { marginTop: '16px' } },
      VISITS.map((v) => h('div.lrow',
        h('div', { style: { width: '52px', textAlign: 'center', flex: 'none' } },
          h('div', { style: { fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.05em' } }, v.mon),
          h('div', { style: { fontSize: '18px', fontWeight: 800, letterSpacing: '-.02em' } }, v.day)
        ),
        h('div', { style: { minWidth: '180px', flex: '1' } },
          h('div', { style: { fontSize: '13px', fontWeight: 700 } }, v.title),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            `${v.dentist} · ${v.time}`)
        ),
        h('span.mono', v.rid),
        v.state === 'done' ? badge('DONE', 'ok') : badge('UPCOMING', 'info')
      ))
    );
  }

  /* --------------------------------------------------------------------------
     Tab: next treatment
     -------------------------------------------------------------------------- */
  function nextTab() {
    const done = VISITS.filter((v) => v.state === 'done').length;

    return h('div.card', { style: { marginTop: '16px', padding: '18px 20px' } },
      h('div.row', { style: { gap: '10px', marginBottom: '4px' } },
        h('span', { style: { fontSize: '15px', fontWeight: 800 } }, 'Tooth Scaling'),
        h('span', {
          style: {
            fontSize: '9px', fontWeight: 800, letterSpacing: '.05em', color: 'var(--info)',
            background: 'var(--info-soft)', padding: '3px 7px', borderRadius: '5px'
          }
        }, 'MULTIPLE')
      ),
      h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginBottom: '16px' } },
        `Total treatment: ${done}/${VISITS.length} visits`),

      VISITS.map((v) => h('div.row.row--wrap', {
        style: { gap: '14px', padding: '12px 0', borderTop: '1px solid var(--line-soft)' }
      },
        h('div', { style: { width: '46px', textAlign: 'center', flex: 'none' } },
          h('div', { style: { fontSize: '10px', fontWeight: 700, color: 'var(--muted)' } }, v.mon),
          h('div', { style: { fontSize: '17px', fontWeight: 800 } }, v.day)
        ),
        h('div', { style: { flex: '1', minWidth: '170px' } },
          h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, v.title),
          h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
            `${v.time} · ${v.dentist}`)
        ),
        v.state === 'done'
          ? h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--ok)' } }, '✓ Done')
          : h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--info)' } }, 'Upcoming')
      ))
    );
  }

  /* --------------------------------------------------------------------------
     Tab: medical record
     -------------------------------------------------------------------------- */
  function recordTab() {
    const tooth = state.tooth;

    return h('div.grid-auto', { style: { marginTop: '16px', alignItems: 'start' } },
      card(
        h('div', { style: { textAlign: 'center', fontSize: '13.5px', fontWeight: 700, marginBottom: '16px' } },
          'Odontogram'),
        odontogram({
          selected: tooth,
          onPick: (n) => setState({ tooth: n })
        }),
        h('div.odonto__legend',
          h('span', h('span.swatch', { style: { background: 'var(--info)' } }), 'Treated'),
          h('span', h('span.swatch', { style: { background: 'var(--warn-accent)' } }), 'Pending'),
          h('span', h('span.swatch', { style: { background: 'var(--bg)' } }), 'Healthy')
        )
      ),

      card(
        h('div.row', { style: { gap: '9px', marginBottom: '16px' } },
          h('span.tooth-chip', icon('dentistry', { size: 13 }), tooth),
          h('span', { style: { fontSize: '15px', fontWeight: 800, letterSpacing: '-.02em' } }, toothLabel(tooth))
        ),

        TOOTH_LOG.map((l) => h('div.toothlog',
          h('div.toothlog__date',
            h('div.toothlog__mon', l.mon),
            h('div.toothlog__day', l.day)
          ),
          h('div.toothlog__body',
            h('div.toothlog__facts',
              h('div',
                h('div.eyebrow', 'CONDITION'),
                h('div', { style: { fontSize: '12.5px', fontWeight: 600, marginTop: '2px' } }, l.condition)
              ),
              h('div',
                h('div.eyebrow', 'TREATMENT'),
                h('div', { style: { fontSize: '12.5px', fontWeight: 600, marginTop: '2px' } }, l.treatment)
              ),
              h('div',
                h('div.eyebrow', 'DENTIST'),
                h('div', { style: { fontSize: '12.5px', fontWeight: 600, marginTop: '2px' } }, l.dentist)
              ),
              spacer(),
              l.state === 'done'
                ? h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--ok)' } }, 'Done')
                : h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--warn)' } }, 'Pending')
            ),
            h('div.toothlog__note', l.note)
          )
        ))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Page
     -------------------------------------------------------------------------- */
  const TAB_VIEWS = {
    info: infoTab,
    history: historyTab,
    next: nextTab,
    record: recordTab
  };

  function patientDetailPage() {
    const p = state.patient;
    const view = TAB_VIEWS[state.pdTab] || infoTab;

    return h('div',
      // Breadcrumb
      h('div.row', { style: { gap: '7px', fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' } },
        h('button.btn-link', {
          type: 'button', onclick: () => go('patients'),
          style: { fontSize: '12px', fontWeight: 600 }
        }, 'Patient list'),
        icon('chevron_right', { size: 15 }),
        h('span', { style: { fontWeight: 600, color: 'var(--ink-2)' } }, 'Patient detail')
      ),

      patientHeader(p),

      h('div', { style: { marginTop: '16px' } },
        tabs(TABS, state.pdTab, (id) => setState({ pdTab: id }))
      ),

      view(p)
    );
  }

  Ivora.define('pages/patient-detail', { patientDetailPage: patientDetailPage });
})();
