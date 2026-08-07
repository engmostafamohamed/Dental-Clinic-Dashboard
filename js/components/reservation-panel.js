/**
 * reservation-panel.js — The reservation rail.
 *
 * A right-aligned rail holding the reservation card, plus an optional
 * secondary panel (treatment summary, medical record, next visits or
 * attachments) that slides in beside it.
 *
 * @module components/reservation-panel
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { initials, hourRange, hourLabel, dayLabel, money, DAY_OPTIONS, DAY_BY_LABEL } =
    Ivora.require('core/format');
  var { slotBlocked, blockedMessage, doctorByName } = Ivora.require('core/scheduling');
  var { badge, select, note } = Ivora.require('components/ui');
  var { odontogram } = Ivora.require('components/odontogram');
  var { openCheckupModal, clinical, teethFor, planGroups } = Ivora.require('components/modals/checkup-modal');
  var { STATUS_TONES, STATUSES, treatmentMeta, toothLabel, isCosmetic } = Ivora.require('data/index');

  /** Fixed booking fee added to every treatment plan. */
  const BOOKING_FEE = 100;

  /** Open the reservation rail for an appointment. */
  const openReservation = (appt) => setState({
    resv: {
      ...appt,
      time: hourRange(appt.hr, appt.dur),
      rid: `#RSVA00${10 + appt.id}`,
      initials: initials(appt.patient),
      dentist: appt.doctor,
      status: appt.status
    },
    resvStatus: appt.status,
    panel: null,
    modal: null,
    cuCursor: 0,
    cuSel: null,
    cuDraft: null
  });

  /* ------------------------------------------------------------------------
     Rescheduling
     ------------------------------------------------------------------------
     Editing happens inline on the rail rather than in a separate dialog: the
     dentist is already looking at the booking, and a modal on top of a rail
     would stack two overlays for a three-field change.
     ------------------------------------------------------------------------ */

  /** Open the editor, seeded from the appointment being viewed. */
  const startReschedule = () => setState((s) => ({
    resvEdit: true,
    resvDay: s.resv.day || 0,
    resvHr: s.resv.hr,
    resvDur: s.resv.dur
  }));

  const cancelReschedule = () => setState({ resvEdit: false });

  /** Commit the new slot to the board and to the open rail. */
  const saveReschedule = () => setState((s) => {
    const time = hourRange(s.resvHr, s.resvDur);
    return {
      appts: s.appts.map((a) => (a.id === s.resv.id
        ? { ...a, day: s.resvDay, hr: s.resvHr, dur: s.resvDur }
        : a)),
      resv: { ...s.resv, day: s.resvDay, hr: s.resvHr, dur: s.resvDur, time },
      // Follow the booking so the board still shows what was just edited.
      dayOffset: s.resvDay,
      resvEdit: false
    };
  });

  const closeReservation = () => setState({ resv: null, panel: null, resvEdit: false });
  const closePanel = () => setState({ panel: null });

  /**
   * Cancel the reservation: drop it from the appointment book and close the
   * rail.
   *
   * Everything the board shows — the slot itself, the "appointments shown"
   * count, each dentist's "N today" — is derived from `appts`, so removing
   * the record is all that is needed; nothing has to be updated by hand.
   *
   * `drag`/`over` are cleared defensively: cancelling while a card is
   * mid-drag would otherwise leave a dangling id in the drag state.
   */
  const cancelReservation = () => setState((s) => {
    if (!s.resv) return null;
    return {
      appts: s.appts.filter((a) => a.id !== s.resv.id),
      resv: null,
      panel: null,
      drag: null,
      over: null
    };
  });

  /** Change the appointment's status, keeping the board in sync. */
  const setStatus = (status) => setState((s) => ({
    resvStatus: status,
    resv: { ...s.resv, status },
    appts: s.appts.map((a) => (a.id === s.resv.id ? { ...a, status } : a))
  }));

  /* --------------------------------------------------------------------------
     Panel chrome
     -------------------------------------------------------------------------- */
  function panelShell(title, body, footer) {
    return h('div.rail__panel',
      h('div.rail__head',
        h('h3', { style: { flex: '1', margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '-.02em' } }, title),
        h('button', {
          type: 'button', onclick: closePanel, title: 'Close',
          style: {
            width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--line)',
            background: 'var(--surface)', color: 'var(--muted)', display: 'grid',
            placeItems: 'center', cursor: 'pointer'
          }
        }, icon('chevron_right', { size: 16 }))
      ),
      h('div.rail__body', { style: { background: 'var(--surface-2)' } }, body),
      footer && h('div.rail__foot', footer)
    );
  }

  const card = (...children) => h('div', {
    style: {
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: '13px', padding: '14px 16px'
    }
  }, ...children);

  const emptyState = (iconName, title, body) => h('div', { style: { padding: '40px 12px', textAlign: 'center' } },
    icon(iconName, { size: 30, color: 'var(--line-strong)' }),
    h('div', { style: { fontSize: '13px', fontWeight: 700, marginTop: '8px' } }, title),
    h('div', { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '3px', textWrap: 'pretty' } }, body)
  );

  /* --------------------------------------------------------------------------
     Secondary panel: treatment summary
     -------------------------------------------------------------------------- */
  function summaryPanel() {
    const groups = planGroups();

    if (groups.length === 0) {
      return panelShell('Treatment summary',
        emptyState('summarize', 'No treatment recorded yet',
          'Run the medical checkup first — approved teeth appear here as billable treatment.')
      );
    }

    const subtotal = groups.reduce(
      (sum, g) => sum + treatmentMeta(g.treatment).price * g.teeth.length, 0
    );

    return panelShell('Treatment summary',
      h('div',
        groups.map((g) => {
          const meta = treatmentMeta(g.treatment);
          return h('div', { style: { marginBottom: '12px' } },
            card(
              h('div.row.row--wrap', { style: { gap: '9px' } },
                h('span', { style: { fontSize: '14.5px', fontWeight: 700 } }, g.treatment),
                meta.visits > 1 ? badge('MULTIPLE', 'purple') : badge('SINGLE', 'ok'),
                spacer(),
                h('span', { style: { fontSize: '15px', fontWeight: 800, letterSpacing: '-.02em' } },
                  money(meta.price * g.teeth.length))
              ),
              h('div.eyebrow', {
                style: { margin: '12px 0 8px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }
              }, 'TREATED TEETH'),
              g.teeth.map((t) => h('div.row', { style: { gap: '9px', padding: '4px 0', fontSize: '12.5px', fontWeight: 600 } },
                h('span', { style: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ok)', flex: 'none' } }),
                `${toothLabel(t.n)} (${t.n})`,
                h('span', { style: { fontSize: '11.5px', color: 'var(--muted)', fontWeight: 500 } }, `· ${t.condition}`)
              ))
            )
          );
        }),

        card(
          h('div.row',
            h('span', { style: { fontSize: '12.5px', color: 'var(--ink-3)' } }, 'Subtotal'),
            spacer(),
            h('span', { style: { fontSize: '13px', fontWeight: 700 } }, money(subtotal, 2))
          ),
          h('div.row', { style: { marginTop: '8px' } },
            h('span', { style: { fontSize: '12.5px', color: 'var(--ink-3)' } }, 'Booking fee'),
            spacer(),
            h('span', { style: { fontSize: '13px', fontWeight: 700 } }, money(BOOKING_FEE, 2))
          ),
          h('div', { style: { height: '1px', background: 'var(--bg)', margin: '10px 0' } }),
          h('div.row',
            h('span', { style: { fontSize: '14px', fontWeight: 800 } }, 'Total'),
            spacer(),
            h('span', { style: { fontSize: '16px', fontWeight: 800, letterSpacing: '-.02em' } },
              money(subtotal + BOOKING_FEE, 2))
          )
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Secondary panel: medical record chart
     -------------------------------------------------------------------------- */
  function recordPanel() {
    const kind = state.recChart === 'cosmetic' ? 'cos' : 'med';
    const entries = teethFor(kind);
    const recorded = new Set(entries.map((e) => e.n));

    const tab = (label, value) => {
      const on = state.recChart === value;
      return h('button', {
        type: 'button',
        onclick: () => setState({ recChart: value }),
        style: {
          flex: '1', height: '32px', borderRadius: '8px', border: 'none',
          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          background: on ? 'var(--surface)' : 'transparent',
          color: on ? 'var(--ink)' : 'var(--muted)'
        }
      }, label);
    };

    return panelShell('Medical record',
      h('div',
        h('div', {
          style: { display: 'flex', gap: '8px', background: 'var(--line-soft)', borderRadius: '10px', padding: '4px', marginBottom: '16px' }
        },
          tab('Medical', 'medical'),
          tab('Cosmetic', 'cosmetic')
        ),

        odontogram({
          stateOf: (n) => (recorded.has(n) ? 'treated' : undefined)
        }),

        h('div.odonto__legend',
          h('span', h('span.swatch', { style: { background: 'var(--info)' } }), 'Has treatment'),
          h('span',
            h('span.swatch', { style: { background: 'var(--surface)', border: '1.5px solid var(--line)' } }),
            'No treatment')
        ),

        h('div', {
          style: {
            marginTop: '18px', background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: '13px', overflow: 'hidden'
          }
        },
          entries.length === 0
            ? h('div', { style: { padding: '26px 14px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' } },
                'No findings on this chart yet.')
            : entries.map((r) => h('div.row', {
                style: { gap: '11px', padding: '12px 14px', borderBottom: '1px solid var(--hover)' }
              },
                h('span.mono', {
                  style: {
                    fontSize: '10.5px', fontWeight: 600, color: 'var(--info)',
                    background: 'var(--info-soft)', padding: '4px 7px', borderRadius: '6px', flex: 'none'
                  }
                }, r.n),
                h('div', { style: { minWidth: 0, flex: '1' } },
                  h('div', { style: { fontSize: '12.5px', fontWeight: 600 } }, r.treatment),
                  h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '1px' } },
                    `${r.condition} · ${toothLabel(r.n)}`)
                ),
                clinical().record[r.n] === false
                  ? h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--warn)', whiteSpace: 'nowrap' } }, 'Pending')
                  : h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--ok)', whiteSpace: 'nowrap' } }, '✓ Done')
              ))
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Secondary panel: attachments
     -------------------------------------------------------------------------- */
  function attachPanel() {
    const files = [
      { name: 'Panoramic X-ray.png', size: '2.4 MB', icon: 'image', when: 'Today 09:02' },
      { name: 'Consent form.pdf', size: '184 KB', icon: 'description', when: 'Today 08:58' }
    ];

    return panelShell('Attachments',
      h('div',
        h('div.stack', { style: { gap: '9px' } },
          files.map((f) => card(
            h('div.row', { style: { gap: '11px' } },
              h('div.itile', { style: { background: 'var(--info-soft)', color: 'var(--info)' } },
                icon(f.icon, { size: 18 })),
              h('div', { style: { minWidth: 0, flex: '1' } },
                h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, f.name),
                h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
                  `${f.size} · ${f.when}`)
              ),
              h('button.btn.btn-icon.btn-icon-sm', { type: 'button', title: 'Download' },
                icon('download', { size: 16 }))
            )
          ))
        ),

        h('button', {
          type: 'button',
          style: {
            marginTop: '12px', width: '100%', height: '42px', borderRadius: '11px',
            border: '1.5px dashed var(--brand-line)', background: 'var(--brand-soft)',
            color: 'var(--brand)', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
          }
        }, icon('upload_file', { size: 17 }), 'Upload file')
      )
    );
  }

  /* --------------------------------------------------------------------------
     The reservation card itself
     -------------------------------------------------------------------------- */
  function reservationCard() {
    const r = state.resv;
    const tone = STATUS_TONES[state.resvStatus] || STATUS_TONES.Registered;
    const c = clinical();

    const factCell = (label, value) => h('div', { style: { minWidth: 0 } },
      h('div', { style: { fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--muted)' } }, label),
      h('div', { style: { fontSize: '12.5px', fontWeight: 700, marginTop: '3px' } }, value)
    );

    /**
     * Inline date/time editor.
     *
     * Availability is checked with the same rules the board and the booking
     * form use, and the appointment's own id is excluded so a booking never
     * reports a clash with itself.
     */
    function rescheduleEditor(res) {
      const doctor = doctorByName(res.dentist);
      const reason = slotBlocked(doctor, state.resvDay, state.resvHr, state.resvDur, res.id);
      const blocked = !!reason;

      const hours = [];
      for (let hr = 8; hr <= 17; hr++) hours.push(hr);

      const labelled = (text, control) => h('div',
        h('div', {
          style: { fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '5px' }
        }, text),
        control
      );

      return h('div', {
        style: {
          marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--line-soft)'
        }
      },
        h('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,110px),1fr))', gap: '10px' }
        },
          labelled('Date', select({
            value: dayLabel(state.resvDay),
            options: DAY_OPTIONS.map((d) => d.label),
            onChange: (v) => setState({ resvDay: DAY_BY_LABEL[v] ?? 0 })
          })),
          labelled('Start time', select({
            value: hourLabel(state.resvHr),
            options: hours.map((hr) => hourLabel(hr)),
            onChange: (v) => {
              const hr = hours.find((x) => hourLabel(x) === v);
              if (hr != null) setState({ resvHr: hr });
            }
          })),
          labelled('Duration', select({
            value: `${state.resvDur} ${state.resvDur === 1 ? 'hour' : 'hours'}`,
            options: [1, 2, 3].map((d) => `${d} ${d === 1 ? 'hour' : 'hours'}`),
            onChange: (v) => setState({ resvDur: parseInt(v, 10) || 1 })
          }))
        ),

        blocked && h('div', { style: { marginTop: '10px' } },
          note(blockedMessage(reason, doctor, state.resvDay, state.resvHr), 'danger', 'warning')),

        h('div.row', { style: { gap: '9px', marginTop: '12px' } },
          h('button.btn.btn-brand.btn-sm', {
            type: 'button',
            onclick: saveReschedule,
            disabled: blocked || undefined
          }, 'Save new time'),
          h('button.btn.btn-outline.btn-sm', { type: 'button', onclick: cancelReschedule }, 'Cancel')
        )
      );
    }

    /**
     * Every appointment for this patient, in date order.
     *
     * This replaces the old "Next" side panel: upcoming visits are history
     * too, and splitting them across a separate panel meant the dentist had
     * to leave the booking to see where it sat in the course of care.
     */
    function visitHistory(res) {
      const visits = state.appts
        .filter((a) => a.patient === res.patient)
        .sort((a, b) => ((a.day || 0) - (b.day || 0)) || (a.hr - b.hr));

      const today = state.dayOffset;

      const row = (a) => {
        const isCurrent = a.id === res.id;
        const day = a.day || 0;
        const when = day < today ? 'past' : day > today ? 'upcoming' : 'today';
        const tone = STATUS_TONES[a.status] || STATUS_TONES.Registered;

        return h('div.row.row--wrap', {
          style: {
            gap: '10px',
            padding: '10px 0',
            borderTop: '1px solid var(--line-soft)',
            opacity: when === 'past' ? 0.72 : 1
          }
        },
          h('span', {
            style: {
              width: '8px', height: '8px', borderRadius: '50%',
              background: tone.tone, flex: 'none'
            }
          }),
          h('div', { style: { minWidth: 0, flex: '1' } },
            h('div', { style: { fontSize: '12px', fontWeight: isCurrent ? 800 : 600 } },
              dayLabel(day)),
            h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' } },
              `${hourRange(a.hr, a.dur)} · ${a.treatment}`)
          ),
          isCurrent
            ? badge('THIS VISIT', 'brand')
            : when === 'upcoming'
              ? badge('UPCOMING', 'info')
              : badge(a.status.toUpperCase(), 'muted')
        );
      };

      return card(
        h('div.row', { style: { marginBottom: '4px' } },
          h('span.card-title', { style: { fontSize: '13px' } }, 'Visits'),
          spacer(),
          h('span', { style: { fontSize: '11px', color: 'var(--muted)' } },
            `${visits.length} total`)
        ),
        visits.length
          ? visits.map(row)
          : h('div', {
              style: { padding: '14px 0 4px', fontSize: '12px', color: 'var(--muted)' }
            }, 'No other visits for this patient.')
      );
    }

    const panelBtn = (label, iconName, panelId) => h('button', {
      type: 'button',
      onclick: () => setState({ panel: state.panel === panelId ? null : panelId }),
      style: {
        flex: '1', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
        background: state.panel === panelId ? 'var(--brand-soft)' : 'var(--surface)',
        color: state.panel === panelId ? 'var(--brand)' : 'var(--ink-2)',
        border: `1px solid ${state.panel === panelId ? 'var(--brand-line)' : 'var(--line)'}`
      }
    }, icon(iconName, { size: 16 }), label);

    const workflowBtn = (label, iconName, done, onClick) => h('button', {
      type: 'button', onclick: onClick,
      style: {
        flex: '1', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
        background: done ? 'var(--ok-soft)' : 'var(--brand-soft)',
        color: done ? 'var(--ok)' : 'var(--brand)',
        border: `1.5px solid ${done ? 'var(--ok)' : 'var(--brand-line)'}`
      }
    }, icon(done ? 'check_circle' : iconName, { size: 17 }), label);

    return h('div.rail__panel',
      h('div.rail__head',
        h('span.mono', { style: { flex: '1', fontSize: '14px', fontWeight: 600 } }, r.rid),
        h('button', {
          type: 'button', onclick: closeReservation, title: 'Close',
          style: {
            width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--line)',
            background: 'var(--surface)', color: 'var(--muted)', display: 'grid',
            placeItems: 'center', cursor: 'pointer'
          }
        }, icon('chevron_right', { size: 16 }))
      ),

      h('div.rail__body', { style: { background: 'var(--surface-2)' } },
        // Patient identity + status
        card(
          h('div.row', { style: { gap: '12px' } },
            h('div.avatar', {
              style: { width: '44px', height: '44px', fontSize: '15px', background: 'var(--brand)' }
            }, r.initials),
            h('div', { style: { minWidth: 0, flex: '1' } },
              h('div', { style: { fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 } }, 'Patient name'),
              h('div', { style: { fontSize: '15px', fontWeight: 800, letterSpacing: '-.02em' } }, r.patient)
            )
          ),

          h('div', { style: { marginTop: '14px' } },
            h('div', { style: { fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--muted)', marginBottom: '6px' } },
              'STATUS'),
            h('div.row', { style: { gap: '10px' } },
              h('span', {
                style: {
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: tone.tone, flex: 'none'
                }
              }),
              select({
                value: state.resvStatus || r.status,
                options: STATUSES,
                size: 'lg',
                onChange: setStatus
              })
            )
          )
        ),

        // Booking facts (editable)
        h('div', { style: { marginTop: '12px' } },
          card(
            h('div', {
              style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,120px),1fr))', gap: '14px' }
            },
              factCell('TREATMENT', r.treatment),
              factCell('DATE & TIME', h('span', dayLabel(r.day || 0), h('br'), r.time)),
              factCell('DENTIST', r.dentist)
            ),

            state.resvEdit ? rescheduleEditor(r) : h('div.row.row--wrap', { style: { gap: '9px', marginTop: '14px' } },
              h('button.btn.btn-outline.btn-sm', {
                type: 'button', onclick: startReschedule
              }, icon('edit_calendar', { size: 16, color: 'var(--brand)' }), 'Edit date & time'),
              h('button.btn.btn-outline.btn-sm', { type: 'button' },
                icon('notifications_active', { size: 16, color: 'var(--warn-accent)' }), 'Send Reminder')
            )
          )
        ),

        // Visits for this patient — past, today and upcoming
        h('div', { style: { marginTop: '12px' } }, visitHistory(r)),

        // Clinical workflow
        h('div', { style: { marginTop: '12px' } },
          h('div.eyebrow', { style: { marginBottom: '9px' } }, 'CLINICAL WORKFLOW'),
          h('div', { style: { display: 'flex', gap: '10px' } },
            workflowBtn('Add Medical Checkup', 'clinical_notes', c.checkupDone, openCheckupModal),
            workflowBtn('Add Medical Record', 'note_add', c.recordDone,
              () => setState({ panel: 'record' }))
          )
        ),

        // Secondary panel launchers
        h('div', { style: { marginTop: '12px' } },
          h('div.eyebrow', { style: { marginBottom: '9px' } }, 'DETAILS'),
          h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            panelBtn('Summary', 'summarize', 'summary'),
            panelBtn('Record', 'dentistry', 'record'),
            panelBtn('Files', 'attach_file', 'attach')
          )
        ),

        !c.checkupDone && h('div', { style: { marginTop: '12px' } },
          note('Run the medical checkup to build a billable treatment plan.', 'info', 'info'))
      ),

      h('div.rail__foot',
        h('button.btn.btn-outline', {
          type: 'button', onclick: cancelReservation,
          title: 'Remove this appointment from the calendar',
          style: { flex: '1', height: '38px', color: 'var(--danger)' }
        }, 'Cancel reservation'),
        h('button.btn.btn-brand', {
          type: 'button', onclick: closeReservation,
          style: { flex: '1', height: '38px' }
        }, 'Save')
      )
    );
  }

  /* --------------------------------------------------------------------------
     Rail
     -------------------------------------------------------------------------- */
  const SECONDARY = {
    summary: summaryPanel,
    record: recordPanel,
    attach: attachPanel
  };

  /** Render the reservation rail, or null when no reservation is open. */
  function reservationRail() {
    if (!state.resv) return null;

    const secondary = SECONDARY[state.panel];

    return [
      h('div.scrim.scrim--drawer', { onclick: closeReservation }),
      h('div.rail',
        secondary && secondary(),
        reservationCard()
      )
    ];
  }

  Ivora.define('components/reservation-panel', {
    openReservation: openReservation,
    closeReservation: closeReservation,
    reservationRail: reservationRail
  });
})();
