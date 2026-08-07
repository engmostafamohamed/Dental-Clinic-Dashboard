/**
 * dashboard.js — Clinic overview.
 *
 * Two columns: financial charts on the left (cashflow, income/expense,
 * patients, popular treatments), operational cards on the right (expense
 * breakdown, stock health).
 *
 * @module pages/dashboard
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { go } = Ivora.require('core/router');
  var { num, longDayLabel } = Ivora.require('core/format');
  var { card, cardHead, select, swatch, pill } = Ivora.require('components/ui');
  var { lineChart, barChart, donutRings } = Ivora.require('components/charts');
  var { CASHFLOW, CASHFLOW_RANGES, INCOME_EXPENSE, EXPENSE_CATEGORIES, EXPENSES, PATIENT_STATS, DENTISTS_TODAY, CLINIC } = Ivora.require('data/index');

  /** Each unit of the cashflow series represents this many dollars. */
  const CASHFLOW_UNIT = 7300;

  /** Title-case a MONTH constant: 'AUG' → 'Aug'. */
  const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

  /* --------------------------------------------------------------------------
     Cashflow
     -------------------------------------------------------------------------- */
  function cashflowCard() {
    const months = CASHFLOW_RANGES[state.cfRange] ?? 12;
    const series = CASHFLOW.slice(-months);

    const total = series.reduce((sum, x) => sum + x.v, 0) * CASHFLOW_UNIT;
    const first = series[0].v;
    const last = series[series.length - 1].v;
    const delta = (((last - first) / first) * 100).toFixed(2);
    const period = `${titleCase(series[0].m)} – ${titleCase(series[series.length - 1].m)} 2026`;

    const points = series.map((x) => ({
      label: x.m,
      value: x.v,
      tip: `${x.m} · $${num(x.v * CASHFLOW_UNIT)}`
    }));

    return card(
      cardHead('Cashflow',
        select({
          value: state.cfRange,
          options: Object.keys(CASHFLOW_RANGES),
          onChange: (v) => setState({ cfRange: v })
        })
      ),

      h('div.row.row--wrap', { style: { alignItems: 'flex-start', gap: '20px' } },
        h('div',
          h('div.stat__label', 'TOTAL CASH'),
          h('div.row.row--wrap', { style: { gap: '9px', marginTop: '5px' } },
            h('span.t-2xl.fw-8', `$${num(Math.round(total))}`),
            pill(`${delta}%`, 'ok')
          )
        ),
        spacer(),
        h('div.t-md.c-muted', { style: { paddingTop: '6px', whiteSpace: 'nowrap' } }, period)
      ),

      lineChart(points)
    );
  }

  /* --------------------------------------------------------------------------
     Income & expense
     -------------------------------------------------------------------------- */
  function incomeExpenseCard() {
    const n = state.ieRange === '3 mo' ? 3 : state.ieRange === '12 mo' ? 12 : 6;
    // The dataset holds six months; a 12-month view repeats it to fill the axis.
    const series = n <= 6 ? INCOME_EXPENSE.slice(-n) : INCOME_EXPENSE.concat(INCOME_EXPENSE).slice(-n);

    const income = Math.round(series.reduce((a, b) => a + b.i, 0) * 1000);
    const expense = Math.round(series.reduce((a, b) => a + b.e, 0) * 1000);

    const groups = series.map((x) => ({
      label: x.m, a: x.i, b: x.e,
      tip: `${x.m} · income $${num(x.i * 1000)} / expense $${num(x.e * 1000)}`
    }));

    const legendItem = (label, color, value) => h('div',
      h('div.row', { style: { gap: '6px' } },
        swatch(color),
        h('span', { style: { fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--muted)' } }, label)
      ),
      h('div', { style: { fontSize: '16px', fontWeight: 800, marginTop: '3px' } }, value)
    );

    return card(
      cardHead('Income & Expense',
        select({
          value: state.ieRange,
          options: ['6 mo', '3 mo', '12 mo'],
          size: 'sm',
          onChange: (v) => setState({ ieRange: v })
        })
      ),
      h('div.row.row--wrap', { style: { gap: '20px', marginBottom: '14px' } },
        legendItem('INCOME', 'var(--brand)', `$${num(income)}`),
        legendItem('EXPENSE', 'var(--warn-accent)', `$${num(expense)}`)
      ),
      barChart(groups)
    );
  }

  /* --------------------------------------------------------------------------
     Patients
     -------------------------------------------------------------------------- */
  function patientsCard() {
    const stats = PATIENT_STATS[state.ptRange] || PATIENT_STATS['This month'];
    const total = stats.n + stats.r;
    const newPct = ((stats.n / total) * 100).toFixed(1) + '%';
    const retPct = ((stats.r / total) * 100).toFixed(1) + '%';

    const metric = (value, share, label, color) => h('div',
      h('div', { style: { fontSize: '24px', fontWeight: 800, letterSpacing: '-.03em' } }, value),
      h('div', { style: { fontSize: '11.5px', fontWeight: 700, color, marginTop: '4px' } }, share),
      h('div', { style: { fontSize: '11px', color: 'var(--muted)' } }, label),
      h('div', {
        style: { height: '5px', borderRadius: '3px', background: 'var(--bg)', marginTop: '7px', overflow: 'hidden' }
      }, h('div', { style: { height: '100%', background: color, width: share } }))
    );

    return card(
      cardHead('Patients',
        select({
          value: state.ptRange,
          options: Object.keys(PATIENT_STATS),
          size: 'sm',
          onChange: (v) => setState({ ptRange: v })
        })
      ),
      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,140px),1fr))', gap: '16px' }
      },
        metric(stats.n, newPct, 'New patients', 'var(--brand)'),
        metric(stats.r, retPct, 'Returning', 'var(--info)')
      )
    );
  }

  /* --------------------------------------------------------------------------
     Popular treatments
     -------------------------------------------------------------------------- */
  const POPULAR = [
    { name: 'Tooth Scaling',    rating: 4.7, color: 'var(--brand)' },
    { name: 'Tooth Extraction', rating: 4.4, color: 'var(--info)' },
    { name: 'General Checkup',  rating: 4.6, color: 'var(--warn-accent)' },
    { name: 'Teeth Whitening',  rating: 4.2, color: 'var(--purple)' }
  ];

  function popularCard() {
    return h('div.card.card--pad', { style: { flex: '1' } },
      h('div.card-title', { style: { marginBottom: '12px' } }, 'Popular Treatment'),
      h('div.stack', { style: { gap: '11px' } },
        POPULAR.map((t) => h('div.row', {
          style: { paddingInlineStart: '9px', boxShadow: `inset 2px 0 0 ${t.color}` }
        },
          h('span.t-md.fw-6', t.name),
          spacer(),
          h('span.row', { style: { gap: '3px', fontSize: '12px', fontWeight: 700 } },
            icon('star', { size: 15, color: 'var(--warn-accent)', fill: true }),
            t.rating
          )
        ))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Expenses (donut)
     -------------------------------------------------------------------------- */
  function expensesCard() {
    const values = EXPENSES[state.exRange] || EXPENSES['6 mo'];
    const sum = values.reduce((a, b) => a + b, 0);

    const slices = EXPENSE_CATEGORIES.map((c, i) => ({
      name: c.name, color: c.color, value: values[i]
    }));

    const dot = (color, size = 8) => h('span', {
      style: { width: `${size}px`, height: `${size}px`, borderRadius: '50%', flex: 'none', background: color }
    });

    return card(
      h('div.card-head', { style: { marginBottom: '8px' } },
        h('span.card-title', 'Expenses'),
        spacer(),
        select({
          value: state.exRange,
          options: ['6 mo', '3 mo', '12 mo'],
          size: 'sm',
          onChange: (v) => setState({ exRange: v })
        })
      ),

      h('div.row.row--wrap', { style: { gap: '16px' } },
        h('div', { style: { position: 'relative', width: '150px', height: '150px', flex: 'none' } },
          donutRings(slices, { size: 150, thickness: 6 }),
          h('div.chart-donut__center',
            h('div',
              h('div', { style: { fontSize: '10px', color: 'var(--muted)', fontWeight: 600 } }, 'Total Expense'),
              h('div', { style: { fontSize: '17px', fontWeight: 800, letterSpacing: '-.02em' } }, `$${num(sum)}`)
            )
          )
        ),
        h('div', { style: { flex: '1', minWidth: '130px', display: 'flex', flexDirection: 'column', gap: '8px' } },
          slices.map((s) => h('div.row', { style: { gap: '8px', fontSize: '11.5px' } },
            dot(s.color),
            s.name,
            spacer(),
            h('span.fw-7', `${((s.value / sum) * 100).toFixed(0)}%`)
          ))
        )
      ),

      h('div.eyebrow', { style: { margin: '16px 0 9px' } }, 'TOP EXPENSE'),
      h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,130px),1fr))', gap: '9px' }
      },
        slices.slice(0, 4).map((s) => h('div', {
          style: { border: '1px solid var(--line)', borderRadius: '10px', padding: '9px 11px' }
        },
          h('div.row', { style: { gap: '6px', fontSize: '11px', color: 'var(--ink-3)' } }, dot(s.color, 7), s.name),
          h('div', { style: { fontSize: '13px', fontWeight: 700, marginTop: '3px' } }, `$${num(s.value)}`)
        ))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Stock availability
     -------------------------------------------------------------------------- */
  const LOW_STOCK = [
    { name: 'Prophy paste', qty: 3 },
    { name: 'Composite A2', qty: 2 }
  ];

  function stockCard() {
    const dot = (color) => h('span', {
      style: { width: '7px', height: '7px', borderRadius: '50%', background: color }
    });

    return card(
      h('div.card-title', { style: { marginBottom: '14px' } }, 'Stock availability'),

      h('div', { style: { display: 'flex', gap: '24px', marginBottom: '12px' } },
        h('div',
          h('div.stat__label', 'TOTAL ASSET'),
          h('div', { style: { fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em', marginTop: '3px' } }, '$530,000')
        ),
        h('div',
          h('div.stat__label', 'TOTAL PRODUCT'),
          h('div', { style: { fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em', marginTop: '3px' } }, '442')
        )
      ),

      // Stacked availability bar: available / low / out
      h('div', { style: { display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px' } },
        h('div', { style: { flex: '6', background: 'var(--brand)' } }),
        h('div', { style: { flex: '2.5', background: 'var(--warn-accent)' } }),
        h('div', { style: { flex: '1.5', background: 'var(--danger)' } })
      ),

      h('div.row.row--wrap', { style: { gap: '14px', marginTop: '9px', fontSize: '11px', color: 'var(--ink-3)' } },
        h('span.row', { style: { gap: '5px' } }, dot('var(--brand)'), 'Available'),
        h('span.row', { style: { gap: '5px' } }, dot('var(--warn-accent)'), 'Low stock'),
        h('span.row', { style: { gap: '5px' } }, dot('var(--danger)'), 'Out of stock')
      ),

      h('div.row', { style: { margin: '16px 0 9px' } },
        h('span.eyebrow', 'LOW STOCK'),
        spacer(),
        h('button.btn-link', { onclick: () => go('stocks'), type: 'button' }, 'View all')
      ),

      h('div.stack.stack--sm',
        LOW_STOCK.map((p) => h('div.row', {
          style: {
            background: 'var(--surface-2)', border: '1px solid var(--bg)',
            borderRadius: '10px', padding: '9px 11px'
          }
        },
          h('span', { style: { fontSize: '12px', fontWeight: 600 } }, p.name),
          spacer(),
          h('span', { style: { fontSize: '11px', color: 'var(--muted)' } }, `Qty: ${p.qty}`),
          h('button.btn.btn-sm', {
            type: 'button',
            onclick: () => go('stocks', { stockTab: 'orders' }),
            style: {
              height: '26px', padding: '0 11px', borderRadius: '7px',
              border: '1px solid var(--brand-line)', background: 'var(--surface)',
              color: 'var(--brand)', fontSize: '11px', fontWeight: 700
            }
          }, 'Order')
        ))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Page
     -------------------------------------------------------------------------- */
  function dashboardPage() {
    const onShift = DENTISTS_TODAY.length;
    const todayCount = DENTISTS_TODAY.reduce((n, d) => n + d.count, 0);

    return h('div',
      h('div.page-intro',
        h('div.page-intro__title', `Good morning, ${CLINIC.user.name.split(' ')[0]}`),
        h('div.page-intro__sub',
          `${longDayLabel(0)} · ${onShift} dentists on shift · ${todayCount} appointments today`)
      ),

      h('div.grid-auto.grid-auto--lg', { style: { alignItems: 'start' } },
        // Left column
        h('div.stack',
          cashflowCard(),
          h('div.grid-auto',
            incomeExpenseCard(),
            h('div.stack', patientsCard(), popularCard())
          )
        ),
        // Right column
        h('div.stack', expensesCard(), stockCard())
      )
    );
  }

  Ivora.define('pages/dashboard', { dashboardPage: dashboardPage });
})();
