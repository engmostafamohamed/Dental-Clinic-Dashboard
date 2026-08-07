/**
 * reservations.js — Day-view appointment board and activity log.
 *
 * The board is a grid of hour rows × on-duty dentists. Cards are moved with
 * native HTML5 drag and drop; a drop is accepted only when the target slot
 * passes the same availability rules the booking form uses.
 *
 * @module pages/reservations
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { has, hourLabel, hourRange, initials, tintFor, dayLabel } = Ivora.require('core/format');
  var { bookable, doctorsOnDuty } = Ivora.require('core/scheduling');
  var { flushCard, badge, button, searchBox, select, tabs, table, tableRow } = Ivora.require('components/ui');
  var { openApptModal } = Ivora.require('components/modals/appt-modal');
  var { openDoctorModal } = Ivora.require('components/modals/doctor-modal');
  var { openReservation } = Ivora.require('components/reservation-panel');
  var { BOARD_HOURS, STATUS_TONES, STATUSES, TREATMENT_NAMES, ACTIVITY_LOG } = Ivora.require('data/index');

  const TABS = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'log', label: 'Log History' }
  ];

  /* --------------------------------------------------------------------------
     Filtering
     -------------------------------------------------------------------------- */

  /** Appointments matching the current day and all four filters. */
  function visibleAppointments() {
    const q = state.rq.trim();
    return state.appts.filter((a) =>
      (a.day || 0) === state.dayOffset &&
      (!q || has(a.patient, q)) &&
      (state.fDentist === 'All dentists' || a.doctor === state.fDentist) &&
      (state.fStatus === 'All statuses' || a.status === state.fStatus) &&
      (state.fTreatment === 'All treatments' || a.treatment === state.fTreatment)
    );
  }

  const hasFilters = () =>
    !!state.rq ||
    state.fDentist !== 'All dentists' ||
    state.fStatus !== 'All statuses' ||
    state.fTreatment !== 'All treatments';

  const clearFilters = () => setState({
    rq: '', fDentist: 'All dentists', fStatus: 'All statuses', fTreatment: 'All treatments'
  });

  /* --------------------------------------------------------------------------
     Drag and drop
     -------------------------------------------------------------------------- */

  /** Move an appointment to a new hour and dentist on the current day. */
  function moveAppointment(id, hour, doctorName) {
    setState((s) => ({
      appts: s.appts.map((a) =>
        a.id === id ? { ...a, hr: hour, doctor: doctorName, day: s.dayOffset } : a
      ),
      drag: null,
      over: null
    }));
  }

  /* --------------------------------------------------------------------------
     Board cells
     -------------------------------------------------------------------------- */

  function appointmentCard(appt) {
    const tone = STATUS_TONES[appt.status] || STATUS_TONES.Registered;
    const dragging = state.drag === appt.id;

    return h(`div.appt${dragging ? '.is-dragging' : ''}`, {
      draggable: 'true',
      style: { '--appt-tone': tone.tone, '--appt-bg': tone.bg },
      ondragstart: (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          // Always give the drag an explicit payload. Without one, Chrome
          // invents a default derived from the document URL, and a release
          // over anything that is not an accepting drop target makes the
          // browser try to navigate to it — which on file:// fails with
          // "Unsafe attempt to load URL … unique security origins".
          // Firefox additionally refuses to start a drag at all without this.
          e.dataTransfer.setData('text/plain', String(appt.id));
        }
        setState({ drag: appt.id });
      },
      ondragend: () => setState({ drag: null, over: null }),
      onclick: () => openReservation(appt)
    },
      h('div.appt__top',
        icon('drag_indicator', { cls: 'appt__grip' }),
        h('span.appt__patient.truncate', appt.patient),
        spacer(),
        h('span.appt__status', appt.status.toUpperCase())
      ),
      h('div.appt__time', hourRange(appt.hr, appt.dur)),
      h('span.appt__tx', appt.treatment)
    );
  }

  /** One dentist-hour cell: an appointment, a free slot, a break or off-shift. */
  function boardCell(doctor, hour, shown) {
    const key = `${hour}:${doctor.name}`;
    const appt = shown.find((a) => a.hr === hour && a.doctor === doctor.name);
    const canDrop = bookable(doctor, hour);
    const isOver = state.over === key && canDrop;

    const cell = h(`div.board__cell${isOver ? '.is-over' : ''}`, {
      ondragover: (e) => {
        if (!canDrop) return;
        e.preventDefault();
        if (state.over !== key) setState({ over: key });
      },
      ondrop: (e) => {
        e.preventDefault();
        if (canDrop && state.drag != null && state.drag !== appt?.id) {
          moveAppointment(state.drag, hour, doctor.name);
        }
      }
    });

    if (appt) {
      cell.appendChild(appointmentCard(appt));
      return cell;
    }

    const offShift = hour < doctor.start || hour >= doctor.end;

    if (offShift) {
      cell.appendChild(h('div.slot-off', { title: 'Outside working hours' },
        h('span.slot-off__label', 'UNAVAILABLE')
      ));
    } else if (hour === doctor.brk) {
      cell.appendChild(h('div.slot-break',
        icon('local_cafe'),
        h('span.slot-break__label', 'BREAK'),
        h('span.slot-break__range', `${hourLabel(doctor.brk)} – ${hourLabel(doctor.brk + 1)}`)
      ));
    } else {
      cell.appendChild(h('button.slot-free', {
        type: 'button',
        title: 'Book this slot',
        onclick: () => openApptModal({ hr: hour, dentist: doctor.name, day: state.dayOffset })
      }, icon('add', { size: 20 })));
    }

    return cell;
  }

  function boardHeader(doctors) {
    return h('div.board__head',
      h('div.board__gutter', 'GMT', h('br'), '-07:00'),

      doctors.map((d, i) => {
        const count = state.appts.filter(
          (a) => (a.day || 0) === state.dayOffset && a.doctor === d.name
        ).length;

        return h('div.board__doc',
          h('div.avatar', { style: { background: tintFor(i) } }, initials(d.name)),
          h('div', { style: { minWidth: 0, flex: '1' } },
            h('div.board__doc-name.truncate', d.name),
            h('div.board__doc-meta',
              h('span', `${count} today`),
              h('span.board__doc-sep', '·'),
              icon('schedule', { size: 13 }),
              h('span', `${hourLabel(d.start)} – ${hourLabel(d.end)}`)
            )
          ),
          h('button.btn.btn-icon.btn-edit', {
            type: 'button',
            title: 'Edit working hours',
            style: { width: '26px', height: '26px', borderRadius: '7px' },
            onclick: () => openDoctorModal(state.doctors.indexOf(d))
          }, icon('edit', { size: 15 }))
        );
      }),

      h('div.board__addcol',
        h('button.board__adddoc', { type: 'button', onclick: () => openDoctorModal(null) },
          icon('person_add', { size: 16 }),
          'Add doctor'
        )
      )
    );
  }

  function calendarBoard() {
    const doctors = doctorsOnDuty(state.dayOffset);
    const shown = visibleAppointments();

    if (!doctors.length) {
      return h('div.empty',
        icon('event_busy'),
        `No dentists are rostered on ${dayLabel(state.dayOffset)}.`
      );
    }

    return h('div.board-scroll',
      h('div.board',
        boardHeader(doctors),
        BOARD_HOURS.map((hour) => h('div.board__row',
          h('div.board__time', hourLabel(hour)),
          doctors.map((d) => boardCell(d, hour, shown)),
          h('div.board__tailcol')
        ))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Log view
     -------------------------------------------------------------------------- */

  const LOG_COLS = '150px 140px minmax(170px,1.2fr) minmax(150px,1fr) 160px minmax(160px,1fr)';
  const LOG_HEAD = ['RESERVATION ID', 'TIME', 'PATIENT', 'TREATMENT', 'DENTIST', 'ACTIVITY'];

  function logTable() {
    return table({
      cols: LOG_COLS,
      min: '1000px',
      head: LOG_HEAD,
      rows: ACTIVITY_LOG.map((l, i) => tableRow([
        h('div.mono', { style: { fontSize: '12px', color: 'var(--ink-2)' } }, l.rid),
        h('div.c-ink-3', l.when),
        h('div.row', { style: { gap: '9px', minWidth: 0 } },
          h('div.avatar.avatar--sm', { style: { background: tintFor(i) } }, initials(l.patient)),
          h('span.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, l.patient)
        ),
        h('div', l.treatment),
        h('div.truncate.c-ink-3', l.dentist),
        h('div.row', { style: { gap: '8px', minWidth: 0 } },
          icon(l.icon, { size: 16, color: l.tone }),
          h('span.truncate', l.action)
        )
      ]))
    });
  }

  /* --------------------------------------------------------------------------
     Page
     -------------------------------------------------------------------------- */

  function dayNav(count) {
    return h('div.daynav',
      icon('event_available', { size: 19, color: 'var(--brand)' }),
      h('span', { style: { fontSize: '14px', fontWeight: 800 } }, count),
      h('span.t-md.c-muted', 'appointments shown'),
      spacer(),
      h('button.daynav__today', { type: 'button', onclick: () => setState({ dayOffset: 0 }) }, 'Today'),
      h('button.daynav__arrow', {
        type: 'button', title: 'Previous day',
        onclick: () => setState((s) => ({ dayOffset: Math.max(0, s.dayOffset - 1) }))
      }, icon('chevron_left', { size: 18 })),
      h('span.daynav__label', dayLabel(state.dayOffset)),
      h('button.daynav__arrow', {
        type: 'button', title: 'Next day',
        onclick: () => setState((s) => ({ dayOffset: s.dayOffset + 1 }))
      }, icon('chevron_right', { size: 18 })),
      button('New Appointment', {
        icon: 'add', variant: 'brand',
        onClick: () => openApptModal({ day: state.dayOffset })
      })
    );
  }

  function filterBar() {
    return h('div.filterbar',
      searchBox({
        value: state.rq,
        placeholder: 'Search patient...',
        width: '230px',
        onInput: (v) => setState({ rq: v })
      }),
      select({
        value: state.fDentist,
        options: ['All dentists', ...state.doctors.map((d) => d.name)],
        onChange: (v) => setState({ fDentist: v })
      }),
      select({
        value: state.fStatus,
        options: ['All statuses', ...STATUSES],
        onChange: (v) => setState({ fStatus: v })
      }),
      select({
        value: state.fTreatment,
        options: ['All treatments', ...TREATMENT_NAMES],
        onChange: (v) => setState({ fTreatment: v })
      }),
      hasFilters() && h('button.btn.btn-danger-soft.btn-sm', {
        type: 'button', onclick: clearFilters,
        style: { height: '34px', borderRadius: '9px' }
      }, icon('close', { size: 16 }), 'Clear filters'),
      spacer(),
      h('span', { style: { fontSize: '11.5px', color: 'var(--muted)', whiteSpace: 'nowrap' } },
        'Drag a card to move it to another time or dentist')
    );
  }

  function reservationsPage() {
    const onCalendar = state.resvTab === 'calendar';

    return flushCard(
      tabs(TABS, state.resvTab, (id) => setState({ resvTab: id }), { inset: true }),
      dayNav(visibleAppointments().length),
      filterBar(),
      onCalendar ? calendarBoard() : logTable()
    );
  }

  Ivora.define('pages/reservations', { reservationsPage: reservationsPage });
})();
