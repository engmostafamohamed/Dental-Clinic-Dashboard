/**
 * patient-modal.js — Add or edit a patient record.
 * @module components/modals/patient-modal
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { modalShell, modalActions } = Ivora.require('components/modals/shell');
  var { GENDERS } = Ivora.require('data/index');

  /**
   * @param {object|null} patient  Existing record to edit, or null to add.
   */
  const openPatientModal = (patient) => setState({
    modal: 'patient',
    patEdit: patient ? patient.name : null,
    patName: patient?.name || '',
    patPhone: patient?.phone || '',
    patEmail: patient?.email || '',
    patAge: patient?.age || '',
    patGender: patient?.gender || 'Female',
    patAddress: patient?.address || '',
    patNote: patient?.note || ''
  });

  /**
   * Persist the edit onto the active patient record.
   * The roster is static demo data, so only the currently open patient updates.
   */
  function save() {
    setState((s) => ({
      patient: s.patEdit && s.patient?.name === s.patEdit
        ? {
            ...s.patient,
            name: s.patName.trim() || s.patient.name,
            phone: s.patPhone,
            email: s.patEmail,
            age: s.patAge,
            gender: s.patGender,
            address: s.patAddress,
            note: s.patNote
          }
        : s.patient,
      modal: null
    }));
  }

  /** Small card used to group fields inside the modal body. */
  const panel = (...children) => h('div', {
    style: {
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: '13px', padding: '15px 16px'
    }
  }, ...children);

  const fieldLabel = (text) => h('div', {
    style: { fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '5px' }
  }, text);

  const textField = (label, key, placeholder) => h('div',
    fieldLabel(label),
    h('input.input', {
      value: state[key],
      placeholder,
      style: { height: '40px', fontSize: '12.5px', padding: '0 11px' },
      oninput: (e) => setState({ [key]: e.target.value })
    })
  );

  function patientModal() {
    const editing = !!state.patEdit;

    const body = h('div',
      panel(
        h('div', { style: { fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' } }, 'General info'),

        h('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '12px' }
        },
          textField('Full name', 'patName', 'Full name'),
          textField('Phone number', 'patPhone', '(555) 555-0100'),
          textField('Email', 'patEmail', 'name@mail.com'),
          textField('Age', 'patAge', '24')
        ),

        h('div', { style: { fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', margin: '14px 0 6px' } },
          'Gender'),
        h('div', { style: { display: 'flex', gap: '9px' } },
          GENDERS.map((g) => {
            const on = state.patGender === g;
            return h('button', {
              type: 'button',
              onclick: () => setState({ patGender: g }),
              style: {
                flex: '1', height: '38px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer',
                background: on ? 'var(--brand-soft)' : 'var(--surface)',
                color: on ? 'var(--brand)' : 'var(--ink-3)',
                border: `1.5px solid ${on ? 'var(--brand)' : 'var(--line)'}`
              }
            }, g);
          })
        ),

        h('div', { style: { fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', margin: '14px 0 6px' } },
          'Address'),
        h('input.input', {
          value: state.patAddress,
          placeholder: 'Street, city, state',
          style: { height: '40px', fontSize: '12.5px', padding: '0 11px' },
          oninput: (e) => setState({ patAddress: e.target.value })
        })
      ),

      h('div', { style: { marginTop: '12px' } },
        panel(
          h('div.row', { style: { marginBottom: '6px' } },
            h('span', { style: { fontSize: '12.5px', fontWeight: 800 } }, 'Clinical flag'),
            spacer(),
            h('span.mono', { style: { fontSize: '11px', color: 'var(--muted-2)' } },
              `${state.patNote.length} chars`)
          ),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginBottom: '8px' } },
            'Shown on every reservation for this patient.'),
          h('textarea.textarea', {
            placeholder: 'e.g. has high blood pressure and diabetes',
            style: { minHeight: '66px', borderRadius: '11px' },
            oninput: (e) => setState({ patNote: e.target.value })
          }, state.patNote)
        )
      )
    );

    return modalShell({
      title: editing ? 'Edit Patient' : 'Add Patient',
      body,
      bodyStyle: { background: 'var(--surface-2)' },
      footer: modalActions(editing ? 'Save changes' : 'Add patient', save)
    });
  }

  Ivora.define('components/modals/patient-modal', { openPatientModal: openPatientModal, patientModal: patientModal });
})();
