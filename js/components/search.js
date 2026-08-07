/**
 * search.js — Global search across every entity type.
 *
 * Rendered above the page body whenever `state.gq` is non-empty. Each result
 * knows how to navigate to itself, so the panel stays a pure projection of
 * the query.
 *
 * @module components/search
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { go } = Ivora.require('core/router');
  var { has, hourLabel, hourRange, initials } = Ivora.require('core/format');
  var { PATIENTS, TREATMENTS, PRODUCTS, PERIPHERALS } = Ivora.require('data/index');

  const MAX_RESULTS = 8;

  /**
   * Collect matches across patients, staff, treatments, appointments, stock
   * and equipment.
   * @returns {{kind: string, icon: string, title: string, sub: string, go: Function}[]}
   */
  function searchResults() {
    const q = state.gq.trim();
    if (!q) return [];

    const hit = (...fields) => fields.some((f) => has(f, q));
    const out = [];

    for (const p of PATIENTS) {
      if (hit(p.name, p.phone, p.email)) {
        out.push({
          kind: 'PATIENT', icon: 'person', title: p.name,
          sub: `${p.phone} · last visit ${p.lastVisit}`,
          go: () => go('patientDetail', { patient: p, pdTab: 'info' })
        });
      }
    }

    state.doctors.forEach((d, i) => {
      if (hit(d.name, d.specialty, d.email)) {
        out.push({
          kind: 'DOCTOR', icon: 'badge', title: d.name,
          sub: `${d.specialty} · ${hourLabel(d.start)} – ${hourLabel(d.end)}`,
          go: () => go('staff', { docEdit: i })
        });
      }
    });

    for (const t of TREATMENTS) {
      if (hit(t.name)) {
        out.push({
          kind: 'TREATMENT', icon: 'medical_services', title: t.name,
          sub: `From ${t.price} · ${t.duration}`,
          go: () => go('treatments')
        });
      }
    }

    for (const a of state.appts) {
      if (hit(a.patient, a.treatment)) {
        out.push({
          kind: 'RESERVATION', icon: 'calendar_month', title: a.patient,
          sub: `${a.treatment} · ${hourRange(a.hr, a.dur)} · ${a.doctor}`,
          go: () => go('reservations', {
            resv: {
              ...a, time: hourRange(a.hr, a.dur), rid: `#RSVA00${10 + a.id}`,
              initials: initials(a.patient), dentist: a.doctor, status: a.status
            },
            resvStatus: a.status, panel: null
          })
        });
      }
    }

    for (const p of PRODUCTS) {
      if (hit(p.name, p.sku, p.category)) {
        out.push({
          kind: 'STOCK', icon: 'inventory_2', title: p.name,
          sub: `${p.sku} · ${p.stock} in stock · ${p.vendor}`,
          go: () => go('stocks', { stockTab: 'inventory' })
        });
      }
    }

    for (const p of PERIPHERALS) {
      if (hit(p.name, p.sku)) {
        out.push({
          kind: 'EQUIPMENT', icon: 'handyman', title: p.name,
          sub: `${p.category} · ${p.room}`,
          go: () => go('peripherals')
        });
      }
    }

    return out;
  }

  /** The results panel. Returns null when there is no active query. */
  function searchPanel() {
    const q = state.gq.trim();
    if (!q) return null;

    const all = searchResults();
    const shown = all.slice(0, MAX_RESULTS);
    const clear = () => setState({ gq: '' });

    return h('div.card', { style: { padding: '14px 18px', marginBottom: '16px' } },
      h('div.row.row--wrap',
        icon('search', { size: 19, color: 'var(--brand)' }),
        h('span', { style: { fontSize: '13.5px', fontWeight: 800 } },
          `${all.length} results for “${q}”`),
        spacer(),
        h('button.btn.btn-outline.btn-sm', { onclick: clear, type: 'button' }, 'Clear')
      ),

      all.length === 0 && h('div', {
        style: { padding: '22px 0 6px', textAlign: 'center', fontSize: '12.5px', color: 'var(--muted)' }
      }, 'Nothing matched. Try a patient, doctor, treatment or product name.'),

      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px' } },
        shown.map((r) => h('button', {
          type: 'button',
          onclick: () => { r.go(); },
          style: {
            display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 10px',
            border: 'none', background: 'none', borderRadius: '9px', cursor: 'pointer', textAlign: 'start'
          },
          onmouseenter: (e) => { e.currentTarget.style.background = 'var(--surface-2)'; },
          onmouseleave: (e) => { e.currentTarget.style.background = 'none'; }
        },
          h('div.itile.itile--sm', { style: { background: 'var(--info-soft)', color: 'var(--info)' } },
            icon(r.icon, { size: 16 })
          ),
          h('div', { style: { minWidth: 0, flex: '1' } },
            h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 700 } }, r.title),
            h('div.truncate', { style: { fontSize: '11px', color: 'var(--muted)' } }, r.sub)
          ),
          h('span', {
            style: {
              fontSize: '9.5px', fontWeight: 800, letterSpacing: '.05em', color: 'var(--muted)',
              background: 'var(--line-soft)', padding: '4px 8px', borderRadius: '6px', flex: 'none'
            }
          }, r.kind)
        ))
      )
    );
  }

  Ivora.define('components/search', { searchResults: searchResults, searchPanel: searchPanel });
})();
