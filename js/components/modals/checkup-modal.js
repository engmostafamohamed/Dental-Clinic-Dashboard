/**
 * checkup-modal.js — Chairside examination wizard.
 *
 * Six screens across four numbered steps (see CHECKUP_PAGES): medical data,
 * a medical and a cosmetic tooth pass, the oral check, then agreement passes
 * for each treatment kind.
 *
 * Findings are stored per patient in `state.clinical`, keyed by patient name,
 * so reopening a reservation resumes where the dentist left off.
 *
 * @module components/modals/checkup-modal
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { money } = Ivora.require('core/format');
  var { modalShell } = Ivora.require('components/modals/shell');
  var { select, chip, note, badge } = Ivora.require('components/ui');
  var { odontogram } = Ivora.require('components/odontogram');
  var { dentalArch, archLegend } = Ivora.require('components/dental-arch');
  var { CHECKUP_PAGES, CONDITIONS, MEDICAL_TREATMENTS, COSMETIC_TREATMENTS, DECLINE_REASONS, EMPTY_CLINICAL, treatmentMeta, isCosmetic, MEDICAL_CONDITIONS, SOFT_TISSUE, ORAL_QUESTIONS, BLOOD_TYPES, toothLabel } = Ivora.require('data/index');

  /** Step indicator labels: [label, icon]. */
  const STEPS = [
    ['Medical data', 'assignment_ind'],
    ['Treatment Plan', 'dentistry'],
    ['Oral Check', 'health_and_safety'],
    ['Plan Agreement', 'fact_check']
  ];

  const openCheckupModal = () => setState({
    modal: 'checkup', cuCursor: 0, cuSel: null, cuDraft: null
  });

  /* --------------------------------------------------------------------------
     Clinical record access
     -------------------------------------------------------------------------- */

  /** Which patient's chart this wizard is editing. */
  const clinicalKey = () =>
    state.resv?.patient || state.patEdit || state.patient?.name || '—';

  /** The current patient's clinical record. */
  const clinical = () => state.clinical[clinicalKey()] || EMPTY_CLINICAL;

  /** Merge a patch into the current patient's clinical record. */
  const setClinical = (patch) => setState((s) => {
    const key = s.resv?.patient || s.patEdit || s.patient?.name || '—';
    const current = s.clinical[key] || EMPTY_CLINICAL;
    const next = typeof patch === 'function' ? patch(current) : patch;
    return { clinical: { ...s.clinical, [key]: { ...current, ...next } } };
  });

  /** Recorded teeth for one workflow kind. */
  function teethFor(kind) {
    const teeth = clinical().teeth;
    return Object.keys(teeth)
      .map((n) => ({ n: Number(n), ...teeth[n] }))
      .filter((e) => (kind === 'cos') === isCosmetic(e.treatment))
      .sort((a, b) => a.n - b.n);
  }

  /** Teeth the patient agreed to treat, once the check-up is complete. */
  function approvedTeeth() {
    const c = clinical();
    if (!c.checkupDone) return [];
    return teethFor('med')
      .concat(teethFor('cos'))
      .filter((e) => (c.agree[e.n] || {}).ok !== false);
  }

  /** Approved teeth grouped by treatment. */
  function planGroups() {
    const groups = [];
    for (const entry of approvedTeeth()) {
      let group = groups.find((g) => g.treatment === entry.treatment);
      if (!group) {
        group = { treatment: entry.treatment, teeth: [] };
        groups.push(group);
      }
      group.teeth.push(entry);
    }
    return groups;
  }

  /* --------------------------------------------------------------------------
     Step indicator
     -------------------------------------------------------------------------- */
  function stepBar(activeStep) {
    return h('div', {
      style: {
        flex: 'none', display: 'flex', alignItems: 'flex-start',
        padding: '18px 18px 14px', borderBottom: '1px solid var(--bg)'
      }
    },
      STEPS.map(([label, ic], i) => {
        const n = i + 1;
        const done = activeStep > n;
        const current = activeStep === n;

        const dot = done
          ? { background: 'var(--ok)', color: 'var(--surface)' }
          : current
            ? { background: 'var(--brand)', color: 'var(--surface)', boxShadow: '0 0 0 4px var(--brand-soft)' }
            : { background: 'var(--line-soft)', color: 'var(--muted-2)' };

        return h('div', {
          style: { flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', minWidth: 0 }
        },
          h('div', { style: { width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', ...dot } },
            icon(done ? 'check' : ic, { size: done ? 18 : 17 })),
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
     Shared pieces
     -------------------------------------------------------------------------- */
  const panel = (title, ...children) => h('div', {
    style: {
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: '13px', padding: '15px 16px'
    }
  },
    title && h('div', { style: { fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' } }, title),
    ...children
  );

  const fact = (label, value) => h('div',
    h('div', { style: { fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 } }, label),
    h('div', { style: { fontSize: '12.5px', fontWeight: 600, marginTop: '2px' } }, value)
  );

  const fieldLabel = (text, margin = '14px 0 7px') => h('div', {
    style: { fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', margin }
  }, text);

  /** Chip that toggles a key inside a state map. */
  const toggleChip = (name, mapKey) => chip(
    name,
    !!state[mapKey][name],
    () => setState((s) => ({ [mapKey]: { ...s[mapKey], [name]: !s[mapKey][name] } }))
  );

  /* --------------------------------------------------------------------------
     Screen 1 — medical data
     -------------------------------------------------------------------------- */
  function medicalData() {
    const r = state.resv;

    return h('div',
      note(
        'Patient & medical data carry over from the previous check — update anything that has changed.',
        'info', 'info'
      ),

      h('div', { style: { marginTop: '14px' } },
        panel('Patient',
          h('div.kv-grid',
            fact('FULL NAME', r?.patient || state.patient?.name || '—'),
            fact('RESERVATION', r?.rid || '—'),
            fact('DENTIST', r?.dentist || '—'),
            fact('BOOKED FOR', r?.treatment || '—')
          )
        )
      ),

      h('div', { style: { marginTop: '12px' } },
        panel('Vitals & history',
          h('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '12px' }
          },
            h('div',
              fieldLabel('Blood pressure', '0 0 5px'),
              h('input.input', {
                value: state.cuBp, placeholder: '120/80',
                style: { height: '38px', fontSize: '12.5px', padding: '0 11px' },
                oninput: (e) => setState({ cuBp: e.target.value })
              })
            ),
            h('div',
              fieldLabel('Blood type', '0 0 5px'),
              select({
                value: state.cuBlood, options: BLOOD_TYPES,
                onChange: (v) => setState({ cuBlood: v })
              })
            )
          ),

          fieldLabel('Conditions & allergies'),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
            MEDICAL_CONDITIONS.map((c) => toggleChip(c, 'cuMed'))
          ),

          fieldLabel('Chief complaint'),
          h('textarea.textarea', {
            placeholder: 'What brought the patient in today?',
            style: { minHeight: '66px' },
            oninput: (e) => setState({ cuComplaint: e.target.value })
          }, state.cuComplaint)
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Screens 2 & 3 — record findings against teeth
     -------------------------------------------------------------------------- */
  function toothPass(kind) {
    const treatments = kind === 'cos' ? COSMETIC_TREATMENTS : MEDICAL_TREATMENTS;
    const recorded = teethFor(kind);
    const selected = state.cuSel;
    const draft = state.cuDraft || { condition: CONDITIONS[0], treatment: treatments[0], note: '' };

    /** Save the draft finding onto the selected tooth. */
    const commit = () => {
      if (selected == null) return;
      setClinical((c) => ({ teeth: { ...c.teeth, [selected]: { ...draft } } }));
      setState({ cuSel: null, cuDraft: null });
    };

    const removeTooth = (n) => setClinical((c) => {
      const teeth = { ...c.teeth };
      delete teeth[n];
      return { teeth };
    });

    /** Colour the chart by what has already been recorded in this session. */
    const stateOf = (n) => {
      const entry = clinical().teeth[n];
      if (!entry) return undefined;
      return isCosmetic(entry.treatment) === (kind === 'cos') ? 'pending' : 'treated';
    };

    return h('div',
      panel(null,
        dentalArch({
          // Matches the source design: a tooth is simply recorded or not, and
          // the current selection overrides both. The medical/cosmetic split
          // is carried by the step, not the chart, which keeps the legend to
          // the two states it actually shows.
          state: (n) => {
            const entry = clinical().teeth[n];
            const isSelected = selected === n;
            return {
              fill: entry ? 'var(--info-fill)' : 'var(--surface)',
              stroke: isSelected ? 'var(--brand)' : entry ? 'var(--info)' : 'var(--line-strong)',
              label: isSelected ? 'var(--brand)' : entry ? 'var(--info-strong)' : 'var(--muted-2)'
            };
          },
          title: (n) => {
            const entry = clinical().teeth[n];
            return entry
              ? `${toothLabel(n)} · ${entry.condition} → ${entry.treatment}`
              : `Tooth ${n} · ${toothLabel(n)}`;
          },
          onPick: (n) => setState({
            cuSel: n,
            cuDraft: clinical().teeth[n]
              ? { ...clinical().teeth[n] }
              : { condition: CONDITIONS[0], treatment: treatments[0], note: '' }
          })
        }),
        archLegend()
      ),

      selected != null && h('div', { style: { marginTop: '12px' } },
        panel(null,
          h('div.row', { style: { gap: '9px', marginBottom: '12px' } },
            h('span.tooth-chip', icon('dentistry', { size: 13 }), selected),
            h('span', { style: { fontSize: '13.5px', fontWeight: 800 } }, toothLabel(selected)),
            spacer(),
            h('button.btn-link', {
              type: 'button', style: { color: 'var(--muted)' },
              onclick: () => setState({ cuSel: null, cuDraft: null })
            }, 'Cancel')
          ),

          h('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '12px' }
          },
            h('div',
              fieldLabel('Condition', '0 0 5px'),
              select({
                value: draft.condition, options: CONDITIONS,
                onChange: (v) => setState({ cuDraft: { ...draft, condition: v } })
              })
            ),
            h('div',
              fieldLabel('Treatment', '0 0 5px'),
              select({
                value: draft.treatment, options: treatments,
                onChange: (v) => setState({ cuDraft: { ...draft, treatment: v } })
              })
            )
          ),

          fieldLabel('Note'),
          h('textarea.textarea', {
            placeholder: 'Clinical observations for this tooth...',
            style: { minHeight: '58px' },
            oninput: (e) => setState({ cuDraft: { ...draft, note: e.target.value } })
          }, draft.note),

          h('button.btn.btn-brand', {
            type: 'button', onclick: commit,
            style: { marginTop: '12px', width: '100%', height: '40px', borderRadius: '10px' }
          }, 'Record finding')
        )
      ),

      h('div.eyebrow', { style: { margin: '16px 0 9px' } },
        `RECORDED (${recorded.length})`),

      recorded.length === 0
        ? h('div', {
            style: {
              background: 'var(--surface)', border: '1.5px dashed var(--line)', borderRadius: '13px',
              padding: '28px 20px', textAlign: 'center'
            }
          },
            icon('dentistry', { size: 26, color: 'var(--line-strong)' }),
            h('div', { style: { fontSize: '12.5px', color: 'var(--muted)', marginTop: '8px' } },
              'Select a tooth above to record a finding.')
          )
        : h('div.stack', { style: { gap: '9px' } },
            recorded.map((e) => h('div.row.row--wrap', {
              style: {
                gap: '10px', background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: '12px', padding: '11px 13px'
              }
            },
              h('span.tooth-chip', icon('dentistry', { size: 13 }), e.n),
              h('div', { style: { minWidth: 0, flex: '1' } },
                h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, e.treatment),
                h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
                  `${e.condition}${e.note ? ` · ${e.note}` : ''}`)
              ),
              h('button.btn-link', {
                type: 'button', style: { color: 'var(--danger)' },
                onclick: () => removeTooth(e.n)
              }, 'Remove')
            ))
          )
    );
  }

  /* --------------------------------------------------------------------------
     Screen 4 — oral check
     -------------------------------------------------------------------------- */
  function oralCheck() {
    return h('div',
      panel('Habits',
        h('div.stack', { style: { gap: '14px' } },
          ORAL_QUESTIONS.map((q) => h('div',
            fieldLabel(q.label, '0 0 7px'),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
              q.options.map((opt) => chip(
                opt,
                state.cuOralAns[q.key] === opt,
                () => setState((s) => ({ cuOralAns: { ...s.cuOralAns, [q.key]: opt } }))
              ))
            )
          ))
        )
      ),

      h('div', { style: { marginTop: '12px' } },
        panel('Soft tissue',
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
            SOFT_TISSUE.map((t) => toggleChip(t, 'cuSoft'))
          ),
          fieldLabel('Note'),
          h('textarea.textarea', {
            placeholder: 'Soft-tissue observations...',
            style: { minHeight: '58px' },
            oninput: (e) => setState({ cuOralNote: e.target.value })
          }, state.cuOralNote)
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Screens 5 & 6 — plan agreement
     -------------------------------------------------------------------------- */
  function agreement(kind) {
    const entries = teethFor(kind);
    const agree = clinical().agree;

    /** Accept or decline a proposed treatment for one tooth. */
    const setAgreement = (n, ok, reason) => setClinical((c) => ({
      agree: { ...c.agree, [n]: { ok, reason: reason ?? c.agree[n]?.reason ?? DECLINE_REASONS[0] } }
    }));

    if (entries.length === 0) {
      return h('div', {
        style: {
          background: 'var(--surface)', border: '1.5px dashed var(--line)', borderRadius: '13px',
          padding: '34px 20px', textAlign: 'center'
        }
      },
        icon('fact_check', { size: 28, color: 'var(--line-strong)' }),
        h('div', { style: { fontSize: '13px', fontWeight: 700, marginTop: '8px' } },
          `No ${kind === 'cos' ? 'cosmetic' : 'medical'} findings recorded`),
        h('div', { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '4px' } },
          'Go back a step to add one, or continue.')
      );
    }

    const total = entries
      .filter((e) => (agree[e.n] || {}).ok !== false)
      .reduce((sum, e) => sum + treatmentMeta(e.treatment).price, 0);

    return h('div',
      h('div.stack', { style: { gap: '10px' } },
        entries.map((e) => {
          const decision = agree[e.n] || {};
          const declined = decision.ok === false;
          const meta = treatmentMeta(e.treatment);

          const decisionBtn = (label, ic, active, activeInk, activeBg, onClick) => h('button', {
            type: 'button', onclick: onClick,
            style: {
              display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px',
              borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              background: active ? activeBg : 'var(--surface)',
              color: active ? activeInk : 'var(--ink-3)',
              border: `1.5px solid ${active ? activeInk : 'var(--line)'}`
            }
          }, icon(ic, { size: 15 }), label);

          return panel(null,
            h('div.row.row--wrap', { style: { gap: '10px' } },
              h('span.tooth-chip', icon('dentistry', { size: 13 }), e.n),
              h('div', { style: { minWidth: 0, flex: '1' } },
                h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, e.treatment),
                h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
                  `${e.condition} · ${meta.visits} visit${meta.visits > 1 ? 's' : ''} · ${money(meta.price)}`)
              ),
              h('div', { style: { display: 'flex', gap: '8px', flex: 'none' } },
                decisionBtn('Agree', 'check', decision.ok === true, 'var(--ok)', 'var(--ok-soft)',
                  () => setAgreement(e.n, true)),
                decisionBtn('Decline', 'cancel', declined, 'var(--danger)', 'var(--danger-soft)',
                  () => setAgreement(e.n, false))
              )
            ),

            declined && h('div', { style: { paddingTop: '11px' } },
              fieldLabel('Reason', '0 0 5px'),
              select({
                value: decision.reason || DECLINE_REASONS[0],
                options: DECLINE_REASONS,
                onChange: (v) => setAgreement(e.n, false, v)
              })
            )
          );
        })
      ),

      h('div.row', {
        style: {
          marginTop: '14px', padding: '13px 15px', borderRadius: '12px',
          background: 'var(--brand-soft)', border: '1px solid var(--brand-line)'
        }
      },
        h('span', { style: { fontSize: '12.5px', fontWeight: 700, color: 'var(--brand)' } }, 'Agreed total'),
        spacer(),
        h('span', { style: { fontSize: '16px', fontWeight: 800, color: 'var(--brand)' } }, money(total))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Modal
     -------------------------------------------------------------------------- */

  /** Pick the screen for the current cursor. */
  function screenFor(page) {
    if (page.step === 1) return medicalData();
    if (page.step === 2) return toothPass(page.sub === 2 ? 'cos' : 'med');
    if (page.step === 3) return oralCheck();
    return agreement(page.sub === 2 ? 'cos' : 'med');
  }

  function checkupModal() {
    const cursor = state.cuCursor;
    const page = CHECKUP_PAGES[cursor] || CHECKUP_PAGES[0];
    const isLast = cursor === CHECKUP_PAGES.length - 1;

    const back = () => setState((s) => ({
      cuCursor: Math.max(0, s.cuCursor - 1), cuSel: null, cuDraft: null
    }));

    const next = () => {
      if (isLast) {
        setClinical({ checkupDone: true });
        setState({ modal: null, cuCursor: 0, cuSel: null, cuDraft: null });
        return;
      }
      setState((s) => ({ cuCursor: s.cuCursor + 1, cuSel: null, cuDraft: null }));
    };

    const body = h('div',
      // Sub-step dots, shown on the screens that come in medical/cosmetic pairs.
      page.sub > 0 && h('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }
      },
        [1, 2].map((n) => {
          const active = page.sub === n;
          return h('span', {
            style: {
              width: '22px', height: '22px', borderRadius: '50%', display: 'grid', placeItems: 'center',
              fontSize: '10.5px', fontWeight: 700,
              background: active ? 'var(--brand)' : 'var(--surface)',
              color: active ? 'var(--surface)' : 'var(--muted-2)',
              border: `1.5px solid ${active ? 'var(--brand)' : 'var(--line)'}`
            }
          }, n);
        })
      ),

      h('div', { style: { textAlign: 'center', marginBottom: '16px' } },
        h('div', { style: { fontSize: '17px', fontWeight: 800, letterSpacing: '-.02em' } }, page.title),
        h('div', { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '3px' } }, page.subtitle)
      ),

      screenFor(page)
    );

    const footer = [
      h('button.btn.btn-outline', {
        type: 'button', onclick: cursor === 0 ? () => setState({ modal: null }) : back,
        style: { flex: '1', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, cursor === 0 ? 'Cancel' : 'Previous'),
      h('button.btn.btn-brand', {
        type: 'button', onclick: next,
        style: { flex: '1.6', height: '44px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700 }
      }, isLast ? 'Save checkup' : 'Next')
    ];

    const [scrim, panelEl] = modalShell({
      title: 'Medical Checkup',
      body,
      stack: true,
      bodyStyle: { background: 'var(--surface-2)' },
      footer
    });

    panelEl.insertBefore(stepBar(page.step), panelEl.children[1]);
    return [scrim, panelEl];
  }

  Ivora.define('components/modals/checkup-modal', {
    openCheckupModal: openCheckupModal,
    clinical: clinical,
    setClinical: setClinical,
    teethFor: teethFor,
    approvedTeeth: approvedTeeth,
    planGroups: planGroups,
    checkupModal: checkupModal
  });
})();
