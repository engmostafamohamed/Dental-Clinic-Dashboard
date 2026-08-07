/**
 * patients.js — Patient roster.
 * @module pages/patients
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { go } = Ivora.require('core/router');
  var { has } = Ivora.require('core/format');
  var { flushCard, table, tableRow, avatar, button, searchBox } = Ivora.require('components/ui');
  var { openPatientModal } = Ivora.require('components/modals/patient-modal');
  var { PATIENTS, PATIENT_COUNT } = Ivora.require('data/index');

  const COLS = 'minmax(190px,1.3fr) 150px minmax(200px,1.2fr) 130px 130px minmax(160px,1fr)';
  const HEAD = ['PATIENT NAME', 'PHONE', 'EMAIL', 'REGISTERED', 'LAST VISIT', 'LAST TREATMENT'];

  function patientsPage() {
    const q = state.pq.trim();
    const rows = PATIENTS.filter((p) => !q || has(p.name, q));

    return flushCard(
      // Toolbar
      h('div.card-toolbar',
        icon('groups', { size: 20, color: 'var(--brand)' }),
        h('span', { style: { fontSize: '15px', fontWeight: 800 } }, PATIENT_COUNT),
        h('span.t-md.c-muted', 'total patients'),
        spacer(),
        searchBox({
          value: state.pq,
          placeholder: 'Search patients...',
          onInput: (v) => setState({ pq: v })
        }),
        button('Filters', { icon: 'tune' }),
        button('Add Patient', { icon: 'person_add', variant: 'brand', onClick: () => openPatientModal(null) })
      ),

      table({
        cols: COLS,
        min: '1080px',
        head: HEAD,
        rows: rows.length
          ? rows.map((p, i) => tableRow([
              h('div.row', { style: { gap: '10px', minWidth: 0 } },
                avatar(p.name, { index: i }),
                h('span.truncate', {
                  style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--brand)' }
                }, p.name)
              ),
              h('div', p.phone),
              h('div.truncate', p.email),
              h('div.c-ink-3', p.registered),
              h('div.c-ink-3', p.lastVisit),
              h('div.truncate', p.lastTreatment)
            ], {
              onClick: () => go('patientDetail', { patient: p, pdTab: 'info' })
            }))
          : [h('div', { style: { padding: '44px 20px', textAlign: 'center' } },
              h('div', { style: { fontSize: '13.5px', fontWeight: 700 } }, 'No patients match this search'),
              h('div.t-md.c-muted', { style: { marginTop: '4px' } }, 'Try a different name.')
            )]
      })
    );
  }

  Ivora.define('pages/patients', { patientsPage: patientsPage });
})();
