/**
 * appt-modal.js — Book a new appointment.
 *
 * Layout follows the source design: a booking summary banner, the patient
 * mode toggle, dentist/treatment, the date, then start time and duration as
 * chip rows. Unavailable slots stay visible but read as unavailable, so the
 * dentist can see the whole shift at a glance rather than discovering
 * conflicts one dropdown at a time.
 *
 * Availability comes from core/scheduling.js — the same rules the board
 * enforces on drag and drop.
 *
 * @module components/modals/appt-modal
 */
(function () {
  'use strict';

  var { h, icon } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { DAY_OPTIONS, DAY_BY_LABEL, hourRange, hourLabel, dayLabel } = Ivora.require('core/format');
  var { slotBlocked, blockedMessage, doctorByName, worksOn } = Ivora.require('core/scheduling');
  var { modalShell } = Ivora.require('components/modals/shell');
  var { select } = Ivora.require('components/ui');
  var { PATIENTS, TREATMENT_NAMES, BOARD_HOURS } = Ivora.require('data/index');

  /**
   * Open the booking modal.
   * @param {object} [seed] `{ hr, dentist, day, patient }` pre-fill values.
   */
  function openApptModal(seed = {}) {
    setState({
      modal: 'appt',
      naMode: seed.patient ? 'existing' : state.naMode,
      naPatient: seed.patient || PATIENTS[0].name,
      naNewName: '',
      naNewPhone: '',
      naDentist: seed.dentist || state.doctors[0].name,
      naTreatment: 'General Checkup',
      naHr: seed.hr ?? 9,
      naDur: 1,
      naDay: seed.day ?? state.dayOffset
    });
  }

  /** Commit the booking, jump the board to that day, and close. */
  function save(blocked) {
    if (blocked) return;
    setState((s) => ({
      appts: s.appts.concat([{
        id: s.nextId,
        day: s.naDay,
        hr: s.naHr,
        dur: s.naDur,
        doctor: s.naDentist,
        patient: s.naMode === 'new' ? (s.naNewName.trim() || 'New patient') : s.naPatient,
        treatment: s.naTreatment,
        status: 'Registered'
      }]),
      nextId: s.nextId + 1,
      modal: null,
      naNewName: '',
      naNewPhone: '',
      dayOffset: s.naDay
    }));
  }

  /** Field caption. */
  const label = (text, margin = '16px 0 6px') => h('div', {
    style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', margin }
  }, text);

  /** Full-height select matching the modal's 42px form controls. */
  const tallSelect = (value, options, onChange) =>
    select({ value, options, onChange, cls: 'select--tall' });

  function apptModal() {
    const doctor = doctorByName(state.naDentist);
    const reason = slotBlocked(doctor, state.naDay, state.naHr, state.naDur, null);
    const blocked = !!reason;
    const message = blockedMessage(reason, doctor, state.naDay, state.naHr);

    // Only dentists rostered on the chosen day can take the booking.
    const availableDoctors = state.doctors.filter((d) => worksOn(d, state.naDay));

    // Show the selected dentist's whole shift; blocked hours stay visible.
    const slots = BOARD_HOURS.filter(
      (hr) => !doctor || (hr >= doctor.start && hr < doctor.end)
    );

    const body = h('div',
      // Booking summary
      h('div.row.row--wrap', {
        style: {
          gap: '9px', background: 'var(--brand-soft)', border: '1px solid var(--brand-line)',
          borderRadius: '11px', padding: '11px 13px', fontSize: '12px', color: 'var(--brand-strong)'
        }
      },
        icon('event_available', { size: 17 }),
        h('span',
          'Booking ',
          h('strong', hourRange(state.naHr, state.naDur)),
          ' with ',
          h('strong', state.naDentist)
        )
      ),

      // Patient
      label('Patient'),
      h('div', { style: { display: 'flex', gap: '9px', marginBottom: '9px' } },
        h(`button.mode-btn${state.naMode === 'existing' ? '.is-selected' : ''}`, {
          type: 'button', onclick: () => setState({ naMode: 'existing' })
        }, 'Existing patient'),
        h(`button.mode-btn${state.naMode === 'new' ? '.is-selected' : ''}`, {
          type: 'button', onclick: () => setState({ naMode: 'new' })
        }, 'New patient')
      ),

      state.naMode === 'existing'
        ? tallSelect(state.naPatient, PATIENTS.map((p) => p.name), (v) => setState({ naPatient: v }))
        : h('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '11px' }
          },
            h('input.input', {
              value: state.naNewName, placeholder: 'Full name',
              style: { height: '42px', borderRadius: '11px', fontSize: '13px', padding: '0 13px' },
              oninput: (e) => setState({ naNewName: e.target.value })
            }),
            h('input.input', {
              value: state.naNewPhone, placeholder: 'Phone number',
              style: { height: '42px', borderRadius: '11px', fontSize: '13px', padding: '0 13px' },
              oninput: (e) => setState({ naNewPhone: e.target.value })
            })
          ),

      // Dentist + treatment
      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))',
          gap: '12px', marginTop: '16px'
        }
      },
        h('div',
          label('Dentist', '0 0 6px'),
          tallSelect(
            state.naDentist,
            (availableDoctors.length ? availableDoctors : state.doctors).map((d) => d.name),
            (v) => setState({ naDentist: v })
          )
        ),
        h('div',
          label('Treatment', '0 0 6px'),
          tallSelect(state.naTreatment, TREATMENT_NAMES, (v) => setState({ naTreatment: v }))
        )
      ),

      // Date
      label('Date'),
      tallSelect(
        dayLabel(state.naDay),
        DAY_OPTIONS.map((d) => d.label),
        (v) => setState({ naDay: DAY_BY_LABEL[v] ?? 0 })
      ),

      // Start time
      label('Start time'),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        slots.map((hr) => {
          const unavailable = !!slotBlocked(doctor, state.naDay, hr, state.naDur, null);
          const selected = state.naHr === hr;
          return h(`button.choice${unavailable ? '.is-blocked' : ''}${selected ? '.is-selected' : ''}`, {
            type: 'button',
            onclick: () => setState({ naHr: hr }),
            title: unavailable ? 'Not available at this time' : undefined
          }, hourLabel(hr));
        })
      ),

      // Duration
      label('Duration'),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        [1, 2, 3].map((d) => h(`button.choice${state.naDur === d ? '.is-selected' : ''}`, {
          type: 'button', onclick: () => setState({ naDur: d })
        }, `${d} ${d === 1 ? 'hour' : 'hours'}`))
      ),

      // Conflict explanation
      blocked && h('div', {
        style: {
          display: 'flex', alignItems: 'flex-start', gap: '9px', marginTop: '16px',
          background: 'var(--danger-soft)', border: '1px solid var(--danger-line)',
          borderRadius: '11px', padding: '11px 13px', fontSize: '12px', color: 'var(--danger-strong)'
        }
      }, icon('warning', { size: 17 }), h('span', message))
    );

    const footer = [
      h('button.btn.btn-outline', {
        type: 'button', onclick: () => setState({ modal: null }),
        style: { flex: '1', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, 'Cancel'),
      h('button.btn', {
        type: 'button',
        onclick: () => save(blocked),
        // Greyed like the source design, and genuinely inert for keyboard users.
        disabled: blocked || undefined,
        style: {
          flex: '1.6', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700,
          border: 'none', color: 'var(--surface)',
          background: blocked ? 'var(--muted-2)' : 'var(--brand)',
          opacity: 1, cursor: blocked ? 'not-allowed' : 'pointer'
        }
      }, 'Book appointment')
    ];

    return modalShell({
      title: 'New Appointment',
      size: 'md',
      body,
      bodyStyle: { background: 'var(--surface-2)' },
      footer
    });
  }

  Ivora.define('components/modals/appt-modal', { openApptModal: openApptModal, apptModal: apptModal });
})();
