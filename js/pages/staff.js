/**
 * staff.js — Doctor roster with filters and working-day summary.
 * @module pages/staff
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { has, hourLabel, initials, tintFor } = Ivora.require('core/format');
  var { flushCard, table, tableRow, badge, button, iconButton, searchBox, select, tabs } = Ivora.require('components/ui');
  var { openDoctorModal } = Ivora.require('components/modals/doctor-modal');
  var { WEEKDAYS } = Ivora.require('core/format');

  /** Column letters for the working-day dots, Sunday-first. */
  const DAY_LETTERS = 'SMTWTFS';

  const COLS = 'minmax(190px,1.2fr) minmax(170px,1fr) 200px minmax(150px,1fr) 108px 132px 60px';
  const HEAD = ['NAME', 'CONTACT', 'WORKING DAYS', 'ASSIGNED TREATMENT', 'TYPE', 'HOURS', ''];

  const TABS = [
    { id: 'doctors', label: 'Doctor Staff' },
    { id: 'general', label: 'General Staff' }
  ];

  /** Apply the four staff filters. Returns `{ doctor, index }` pairs so the
   *  edit action can address the doctor by its position in state. */
  function filteredStaff() {
    const q = state.sq.trim();

    return state.doctors
      .map((d, i) => ({ d, i }))
      .filter(({ d }) =>
        (!q || has(d.name, q) || has(d.email, q)) &&
        (state.fSpec === 'All specialties' || d.specialty === state.fSpec) &&
        (state.fType === 'All types' || (state.fType === 'Full-time' ? d.type === 'full' : d.type === 'part')) &&
        (state.fDay === 'Any working day' || d.on.includes(WEEKDAYS.indexOf(state.fDay)))
      );
  }

  const hasFilters = () =>
    !!state.sq ||
    state.fSpec !== 'All specialties' ||
    state.fType !== 'All types' ||
    state.fDay !== 'Any working day';

  const clearFilters = () => setState({
    sq: '', fSpec: 'All specialties', fType: 'All types', fDay: 'Any working day'
  });

  /** Seven day dots, filled for days the doctor works. */
  function dayDots(doctor) {
    return h('div', { style: { display: 'flex', gap: '4px' } },
      DAY_LETTERS.split('').map((letter, day) => {
        const on = doctor.on.includes(day);
        return h('span', {
          style: {
            width: '22px', height: '22px', borderRadius: '50%',
            background: on ? 'var(--brand)' : 'var(--line-soft)',
            color: on ? 'var(--surface)' : 'var(--muted-2)',
            display: 'grid', placeItems: 'center', fontSize: '9.5px', fontWeight: 700
          }
        }, letter);
      })
    );
  }

  function filterBar() {
    if (!state.staffFiltersOpen) return null;

    const specialties = [...new Set(state.doctors.map((d) => d.specialty))];

    return h('div.row.row--wrap', { style: { gap: '10px', padding: '0 20px 14px' } },
      searchBox({
        value: state.sq,
        placeholder: 'Search doctor or email...',
        width: '230px',
        onInput: (v) => setState({ sq: v })
      }),
      select({
        value: state.fSpec,
        options: ['All specialties', ...specialties],
        onChange: (v) => setState({ fSpec: v }),
        cls: 'filter-select'
      }),
      select({
        value: state.fType,
        options: ['All types', 'Full-time', 'Part-time'],
        onChange: (v) => setState({ fType: v }),
        cls: 'filter-select'
      }),
      select({
        value: state.fDay,
        options: ['Any working day', ...WEEKDAYS],
        onChange: (v) => setState({ fDay: v }),
        cls: 'filter-select'
      }),
      hasFilters() && h('button.btn.btn-danger-soft.btn-sm', {
        onclick: clearFilters, type: 'button',
        style: { height: '34px', borderRadius: '9px' }
      }, icon('close', { size: 16 }), 'Clear')
    );
  }

  function staffPage() {
    const rows = filteredStaff();
    const open = state.staffFiltersOpen;

    return flushCard(
      tabs(TABS, 'doctors', () => {}, { inset: true }),

      h('div.card-toolbar',
        icon('badge', { size: 20, color: 'var(--brand)' }),
        h('span', { style: { fontSize: '15px', fontWeight: 800 } }, rows.length),
        h('span.t-md.c-muted', 'doctors'),
        spacer(),
        h('button.btn', {
          type: 'button',
          onclick: () => setState({ staffFiltersOpen: !open }),
          style: {
            background: open ? 'var(--brand-soft)' : 'var(--surface)',
            border: `1px solid ${open ? 'var(--brand)' : 'var(--line)'}`,
            color: 'var(--ink-2)', fontWeight: 600
          }
        },
          icon('tune', { size: 17, color: 'var(--muted)' }),
          'Filters',
          icon(open ? 'expand_less' : 'expand_more', { size: 16, color: 'var(--muted-2)' })
        ),
        button('Add Doctor', { icon: 'add', variant: 'brand', onClick: () => openDoctorModal(null) })
      ),

      filterBar(),

      table({
        cols: COLS,
        min: '1040px',
        head: HEAD,
        rows: rows.length
          ? rows.map(({ d, i }) => tableRow([
              h('div.row', { style: { gap: '10px', minWidth: 0 } },
                h('div.avatar', {
                  style: { background: tintFor(i), width: '32px', height: '32px' }
                }, initials(d.name)),
                h('div', { style: { minWidth: 0 } },
                  h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 700 } }, d.name),
                  h('div', { style: { fontSize: '10.5px', color: 'var(--muted)' } }, d.specialty)
                )
              ),
              h('div', { style: { minWidth: 0 } },
                h('div', d.phone),
                h('div.truncate', { style: { fontSize: '11.5px', color: 'var(--brand)' } }, d.email)
              ),
              dayDots(d),
              h('div.truncate', d.services),
              h('div', d.type === 'full' ? badge('FULL-TIME', 'ok') : badge('PART-TIME', 'warn')),
              h('div',
                h('div', { style: { fontSize: '12px', fontWeight: 600 } },
                  `${hourLabel(d.start)} – ${hourLabel(d.end)}`),
                h('div.row', { style: { gap: '4px', fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' } },
                  icon('local_cafe', { size: 13 }),
                  `${hourLabel(d.brk)} – ${hourLabel(d.brk + 1)}`
                )
              ),
              h('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
                iconButton('edit', {
                  title: 'Edit doctor',
                  iconSize: 17,
                  cls: 'btn-edit',
                  onClick: () => openDoctorModal(i)
                })
              )
            ]))
          : [h('div', { style: { padding: '44px 20px', textAlign: 'center' } },
              h('div', { style: { fontSize: '13.5px', fontWeight: 700 } }, 'No doctors match these filters'),
              h('div.t-md.c-muted', { style: { marginTop: '4px' } },
                'Try clearing the specialty or working-day filter.')
            )]
      })
    );
  }

  Ivora.define('pages/staff', { staffPage: staffPage });
})();
