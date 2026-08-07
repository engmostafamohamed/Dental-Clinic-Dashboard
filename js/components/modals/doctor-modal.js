/**
 * doctor-modal.js — Four-step dentist wizard.
 *
 * 1. Staff info      — employment type, name, speciality, email
 * 2. Assigned services
 * 3. Working hours   — shift, break, working days
 * 4. Days off        — clinic-wide holidays this dentist observes
 *
 * @module components/modals/doctor-modal
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { hourLabel } = Ivora.require('core/format');
  var { modalShell, radioCard, closeModal } = Ivora.require('components/modals/shell');
  var { select, toggle } = Ivora.require('components/ui');
  var { SPECIALTIES, WEEK, DAYS_OFF, COSMETIC_SERVICES, MEDICAL_SERVICES } = Ivora.require('data/index');

  /** Step metadata: [label, icon]. */
  const STEPS = [
    ['Staff Info', 'person'],
    ['Assigned Services', 'medical_services'],
    ['Working Hours', 'schedule'],
    ['Days Off', 'event_busy']
  ];

  /** Selectable shift hours. */
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7am – 6pm

  /**
   * Open the wizard.
   * @param {number|null} index  Position in `state.doctors`, or null to add.
   */
  function openDoctorModal(index) {
    const d = index == null ? null : state.doctors[index];

    // WEEK is Monday-first; JS weekdays are Sunday-first, hence the (i+1)%7.
    const wd = {};
    WEEK.forEach((name, i) => {
      wd[name] = d ? d.on.includes((i + 1) % 7) : i < 5;
    });

    const svc = {};
    if (d) {
      (d.services || '').split(',').forEach((part) => {
        const t = part.trim();
        if (t && t[0] !== '+') svc[t] = true;
      });
    }

    setState({
      modal: 'doctor',
      docStep: 1,
      docEdit: index,
      docName: d?.name || '',
      docEmail: d?.email || '',
      docSpec: d?.specialty || 'Pediatric Dentistry',
      docType: d?.type || 'full',
      wd,
      svc: d ? svc : state.svc,
      docStart: d?.start ?? 9,
      docEnd: d?.end ?? 17,
      docBrk: d?.brk ?? 12
    });
  }

  /** Build the record and commit it to the roster. */
  function saveDoctor() {
    const s = state;

    const on = WEEK.map((name, i) => (s.wd[name] ? (i + 1) % 7 : -1)).filter((x) => x >= 0);
    const picked = COSMETIC_SERVICES.concat(MEDICAL_SERVICES).filter((n) => s.svc[n]);
    const services =
      picked.length === 0 ? 'No service assigned'
        : picked.length === 1 ? picked[0]
          : `${picked[0]} +${picked.length - 1}`;

    const record = {
      name: s.docName.trim() || 'Dr. New Doctor',
      specialty: s.docSpec,
      email: s.docEmail.trim() || 'new@northgate.com',
      phone: s.docEdit == null ? '503 555-0188' : s.doctors[s.docEdit].phone,
      type: s.docType,
      services,
      on,
      start: s.docStart,
      end: s.docEnd,
      brk: s.docBrk
    };

    setState((v) => ({
      doctors: v.docEdit == null
        ? v.doctors.concat([record])
        : v.doctors.map((d, i) => (i === v.docEdit ? { ...d, ...record } : d)),
      // Keep existing appointments pointing at the renamed dentist.
      appts: v.docEdit == null
        ? v.appts
        : v.appts.map((a) => (a.doctor === v.doctors[v.docEdit].name ? { ...a, doctor: record.name } : a)),
      modal: null,
      docEdit: null
    }));
  }

  /* --------------------------------------------------------------------------
     Step indicator
     -------------------------------------------------------------------------- */
  function stepBar() {
    return h('div', {
      style: {
        flex: 'none', display: 'flex', alignItems: 'flex-start',
        padding: '18px 18px 14px', borderBottom: '1px solid var(--bg)'
      }
    },
      STEPS.map(([label, ic], i) => {
        const n = i + 1;
        const done = state.docStep > n;
        const current = state.docStep === n;

        const dotStyle = done
          ? { background: 'var(--ok)', color: 'var(--surface)' }
          : current
            ? { background: 'var(--brand)', color: 'var(--surface)', boxShadow: '0 0 0 4px var(--brand-soft)' }
            : { background: 'var(--line-soft)', color: 'var(--muted-2)' };

        return h('div', {
          style: {
            flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '7px', position: 'relative', minWidth: 0
          }
        },
          h('div', {
            style: { width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', ...dotStyle }
          }, icon(done ? 'check' : ic, { size: done ? 18 : 17 })),
          h('div', { style: { textAlign: 'center' } },
            h('div', { style: { fontSize: '9px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--muted-2)' } },
              `STEP ${n}`),
            h('div', { style: { fontSize: '11px', fontWeight: 700, marginTop: '1px' } }, label)
          )
        );
      })
    );
  }

  /* --------------------------------------------------------------------------
     Steps
     -------------------------------------------------------------------------- */
  const label = (text, margin = '14px 0 6px') => h('div', {
    style: { fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)', margin }
  }, text);

  function stepInfo() {
    return h('div',
      label('Type', '0 0 6px'),
      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '11px' }
      },
        radioCard('Full time', state.docType === 'full', () => setState({ docType: 'full' })),
        radioCard('Part-Time', state.docType === 'part', () => setState({ docType: 'part' }))
      ),

      label('Name'),
      h('input.input', {
        value: state.docName, placeholder: 'Full name',
        style: { height: '42px', borderRadius: '11px', fontSize: '13px' },
        oninput: (e) => setState({ docName: e.target.value })
      }),

      label('Specialist'),
      select({
        value: state.docSpec, options: SPECIALTIES,
        onChange: (v) => setState({ docSpec: v }),
        cls: 'select--tall'
      }),

      label('Email Address'),
      h('input.input', {
        value: state.docEmail, placeholder: 'name@northgate.com',
        style: { height: '42px', borderRadius: '11px', fontSize: '13px' },
        oninput: (e) => setState({ docEmail: e.target.value })
      })
    );
  }

  /** A checkbox list of services. */
  function serviceList(names) {
    return h('div', {
      style: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }
    },
      names.map((name) => {
        const on = !!state.svc[name];
        return h('button', {
          type: 'button',
          onclick: () => setState((s) => ({ svc: { ...s.svc, [name]: !s.svc[name] } })),
          style: {
            width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 14px',
            border: 'none', borderBottom: '1px solid var(--hover)', background: 'var(--surface)',
            cursor: 'pointer', textAlign: 'start'
          }
        },
          on
            ? h('span', {
                style: {
                  width: '18px', height: '18px', borderRadius: '5px', background: 'var(--brand)',
                  display: 'grid', placeItems: 'center', flex: 'none'
                }
              }, icon('check', { size: 14, color: 'var(--surface)' }))
            : h('span', {
                style: {
                  width: '18px', height: '18px', borderRadius: '5px',
                  border: '1.5px solid var(--line-strong)', background: 'var(--surface)', flex: 'none'
                }
              }),
          h('span', { style: { fontSize: '12.5px', fontWeight: 600 } }, name)
        );
      })
    );
  }

  function stepServices() {
    const countOf = (names) => names.filter((n) => state.svc[n]).length;

    const heading = (text, count, margin) => h('div.row', { style: { gap: '9px', margin } },
      h('span', { style: { fontSize: '13px', fontWeight: 700 } }, text),
      h('span', {
        style: {
          fontSize: '10px', fontWeight: 700, color: 'var(--brand)',
          background: 'var(--brand-soft)', padding: '3px 8px', borderRadius: '6px'
        }
      }, `${count} selected`)
    );

    return h('div',
      heading('Cosmetic services', countOf(COSMETIC_SERVICES), '0 0 9px'),
      serviceList(COSMETIC_SERVICES),
      heading('Treatment services', countOf(MEDICAL_SERVICES), '16px 0 9px'),
      serviceList(MEDICAL_SERVICES)
    );
  }

  function stepHours() {
    const hourSelect = (value, onChange, options = HOURS) => select({
      value: hourLabel(value),
      options: options.map(hourLabel),
      onChange: (v) => {
        const hour = options.find((x) => hourLabel(x) === v);
        if (hour != null) onChange(hour);
      }
    });

    const field = (text, control) => h('div',
      h('div', { style: { fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '5px' } }, text),
      control
    );

    return h('div',
      h('div', {
        style: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', padding: '14px 15px' }
      },
        h('div', { style: { fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' } }, 'Shift & break'),
        h('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px' }
        },
          field('Starts at', hourSelect(state.docStart, (v) => setState({ docStart: v }))),
          field('Ends at', hourSelect(state.docEnd, (v) => setState({ docEnd: v }))),
          field('Break at', hourSelect(state.docBrk, (v) => setState({ docBrk: v })))
        ),
        state.docEnd <= state.docStart && h('div', {
          style: { marginTop: '10px', fontSize: '11.5px', color: 'var(--danger)', fontWeight: 600 }
        }, 'The end of the shift must come after its start.')
      ),

      h('div', {
        style: {
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px',
          padding: '14px 15px', marginTop: '12px'
        }
      },
        h('div', { style: { fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' } }, 'Working days'),
        h('div.stack', { style: { gap: '2px' } },
          WEEK.map((day) => h('div.row', { style: { padding: '7px 0' } },
            h('span', { style: { fontSize: '12.5px', fontWeight: 600 } }, day),
            spacer(),
            toggle(!!state.wd[day], () => setState((s) => ({ wd: { ...s.wd, [day]: !s.wd[day] } })))
          ))
        )
      )
    );
  }

  function stepDaysOff() {
    return h('div',
      h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginBottom: '12px' } },
        'Clinic closures this dentist observes. Appointments cannot be booked on these dates.'),

      h('div.stack', { style: { gap: '10px' } },
        DAYS_OFF.map((d) => {
          const on = !!state.off[d.name];
          return h('div.row', {
            style: {
              gap: '12px', padding: '13px 15px', borderRadius: '12px',
              background: 'var(--surface)',
              border: `1px solid ${on ? 'var(--brand-line)' : 'var(--line)'}`
            }
          },
            h('div', {
              style: {
                width: '34px', height: '34px', borderRadius: '10px',
                background: on ? 'var(--brand-soft)' : 'var(--surface-2)',
                color: on ? 'var(--brand)' : 'var(--muted)',
                display: 'grid', placeItems: 'center', flex: 'none'
              }
            }, icon('event_busy', { size: 18 })),
            h('div', { style: { minWidth: 0, flex: '1' } },
              h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, d.name),
              h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } }, d.range)
            ),
            toggle(on, () => setState((s) => ({ off: { ...s.off, [d.name]: !s.off[d.name] } })))
          );
        })
      ),

      h('button', {
        type: 'button',
        style: {
          marginTop: '12px', width: '100%', height: '42px', borderRadius: '11px',
          border: '1.5px dashed var(--brand-line)', background: 'var(--brand-soft)',
          color: 'var(--brand)', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
        }
      }, icon('add', { size: 17 }), 'Add Day Off')
    );
  }

  const STEP_VIEWS = { 1: stepInfo, 2: stepServices, 3: stepHours, 4: stepDaysOff };

  /* --------------------------------------------------------------------------
     Modal
     -------------------------------------------------------------------------- */
  function doctorModal() {
    const step = state.docStep;
    const editing = state.docEdit != null;
    const view = STEP_VIEWS[step] || stepInfo;

    const back = () => (step === 1
      ? setState({ modal: null, docEdit: null })
      : setState((s) => ({ docStep: s.docStep - 1 })));

    const next = () => (step === 4
      ? saveDoctor()
      : setState((s) => ({ docStep: s.docStep + 1 })));

    const footer = [
      h('button.btn.btn-outline', {
        type: 'button', onclick: back,
        style: { flex: '1', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, step === 1 ? 'Cancel' : 'Previous'),
      h('button.btn.btn-brand', {
        type: 'button', onclick: next,
        style: { flex: '1.6', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, step === 4 ? 'Save' : 'Next')
    ];

    const [scrim, panel] = modalShell({
      title: editing ? 'Edit Doctor' : 'Add Doctor',
      body: view(),
      bodyStyle: { background: 'var(--surface-2)' },
      footer
    });

    // Slot the step indicator between the header and the body.
    panel.insertBefore(stepBar(), panel.children[1]);

    return [scrim, panel];
  }

  Ivora.define('components/modals/doctor-modal', { openDoctorModal: openDoctorModal, doctorModal: doctorModal });
})();
