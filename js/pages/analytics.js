/**
 * analytics.js — Marketing-site traffic, geography and conversions.
 *
 * The dataset is a 7-day baseline; longer ranges scale it by
 * RANGE_MULTIPLIER so every figure on the page moves together when the range
 * picker changes.
 *
 * @module pages/analytics
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { num, pct, tintFor } = Ivora.require('core/format');
  var { flushCard, card, select, button, segmented } = Ivora.require('components/ui');
  var { RANGES, RANGE_MULTIPLIER, TREND, PAGES, COUNTRIES, CITIES, BUTTONS, VISITORS, ACTIONS, TONE_VARS, CLINIC } = Ivora.require('data/index');

  /** Baseline conversions for a 7-day window. */
  const BASE_CONVERSIONS = { forms: 103, whatsapp: 202, calls: 58 };

  /** Share of visitors who view a service or team page. */
  const ENGAGED_SHARE = 0.42;

  /** Sessions per unique visitor. */
  const SESSIONS_PER_VISITOR = 1.28;

  /**
   * Derive every figure on the page from the selected range.
   * Keeping this in one function makes the whole screen consistent by
   * construction — no card can drift out of sync with another.
   */
  function metrics() {
    const multiplier = RANGE_MULTIPLIER[state.anRange] || 1;
    const scale = (n) => Math.round(n * multiplier);

    const trend = TREND[state.anRange] || TREND['Last 7 days'];
    const trendMax = Math.max(...trend.map(([, v]) => v));
    const visitors = trend.reduce((sum, [, v]) => sum + v, 0);

    const pages = PAGES.map((p) => ({ ...p, views: scale(p.views), uniq: scale(p.uniq) }));
    const pageviews = pages.reduce((sum, p) => sum + p.views, 0);
    const pageMax = Math.max(...pages.map((p) => p.views));

    const forms = scale(BASE_CONVERSIONS.forms);
    const whatsapp = scale(BASE_CONVERSIONS.whatsapp);
    const calls = scale(BASE_CONVERSIONS.calls);
    const acted = forms + whatsapp + calls;
    const engaged = Math.round(visitors * ENGAGED_SHARE);

    const geoSource = state.anGeo === 'cities' ? CITIES : COUNTRIES;
    const geo = geoSource.map((g) => ({
      ...g, visitors: scale(g.visitors), forms: scale(g.forms), wa: scale(g.wa)
    }));
    const geoMax = Math.max(...geo.map((g) => g.visitors));
    const geoTotal = geo.reduce((sum, g) => sum + g.visitors, 0);

    const buttons = BUTTONS.map((b) => ({ ...b, clicks: scale(b.clicks) }));
    const buttonMax = Math.max(...buttons.map((b) => b.clicks));

    return {
      visitors, trend, trendMax, pages, pageviews, pageMax,
      forms, whatsapp, calls, acted, engaged,
      geo, geoMax, geoTotal, buttons, buttonMax
    };
  }

  /* --------------------------------------------------------------------------
     KPI strip
     -------------------------------------------------------------------------- */
  function kpiCards(m) {
    const perVisitor = Math.round((m.pageviews / m.visitors) * 10) / 10;

    const kpis = [
      { label: 'Visitors',          value: num(m.visitors),                                   delta: '+12.4%', icon: 'group',                 sub: 'unique people' },
      { label: 'Sessions',          value: num(Math.round(m.visitors * SESSIONS_PER_VISITOR)), delta: '+9.1%',  icon: 'ads_click',             sub: 'visits in total' },
      { label: 'Pageviews',         value: num(m.pageviews),                                  delta: '+6.8%',  icon: 'description',           sub: `${num(perVisitor)} per visitor` },
      { label: 'Avg. time on site', value: '2m 14s',                                          delta: '+18s',   icon: 'timer',                 sub: 'per session' },
      { label: 'Bounce rate',       value: '38.2%',                                           delta: '−4.1%',  icon: 'call_missed_outgoing',  sub: 'left after one page' }
    ];

    return h('div', {
      style: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
        gap: '14px', marginBottom: '16px'
      }
    },
      kpis.map((k) => h('div.card', { style: { borderRadius: '14px', padding: '15px 16px' } },
        h('div.row', { style: { gap: '9px' } },
          h('span', {
            style: {
              width: '30px', height: '30px', borderRadius: '9px', background: 'var(--surface-2)',
              color: 'var(--muted)', display: 'grid', placeItems: 'center', flex: 'none'
            }
          }, icon(k.icon, { size: 17 })),
          h('span', {
            style: { fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-3)', minWidth: 0, flex: '1' }
          }, k.label)
        ),
        h('div.row.row--wrap', { style: { alignItems: 'baseline', gap: '8px', marginTop: '11px' } },
          h('span', { style: { fontSize: '22px', fontWeight: 800, letterSpacing: '-.03em' } }, k.value),
          h('span', {
            style: {
              fontSize: '10.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px',
              whiteSpace: 'nowrap', color: 'var(--ok)', background: 'var(--ok-soft)'
            }
          }, k.delta)
        ),
        h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '3px' } }, k.sub)
      ))
    );
  }

  /* --------------------------------------------------------------------------
     Visitors over time
     -------------------------------------------------------------------------- */
  function trendCard(m) {
    return card(
      h('div.row.row--wrap', { style: { gap: '10px' } },
        h('span.card-title', 'Visitors over time'),
        spacer(),
        h('span', { style: { fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' } },
          `Peak ${num(m.trendMax)}`)
      ),

      h('div.ltr', {
        style: { display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', marginTop: '18px' }
      },
        m.trend.map(([label, value]) => h('div', {
          title: `${label} · ${num(value)} visitors`,
          style: {
            flex: '1 1 0', height: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end', alignItems: 'center', gap: '6px',
            borderRadius: '7px', cursor: 'default'
          }
        },
          h('span', { style: { fontSize: '10px', fontWeight: 700, color: 'var(--ink-3)' } }, num(value)),
          h('span', {
            style: {
              width: '100%', maxWidth: '34px', borderRadius: '6px 6px 0 0',
              background: 'var(--brand)', height: `${Math.max(4, Math.round((value / m.trendMax) * 100))}%`
            }
          })
        ))
      ),

      h('div.ltr', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
        m.trend.map(([label]) => h('span', {
          style: { flex: '1 1 0', textAlign: 'center', fontSize: '10.5px', fontWeight: 600, color: 'var(--muted-2)' }
        }, label))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Conversions
     -------------------------------------------------------------------------- */
  function conversionsCard(m) {
    const tile = (value, label, iconName, ink, bg) => h('div', {
      style: { background: bg, borderRadius: '12px', padding: '13px 14px' }
    },
      icon(iconName, { size: 19, color: ink }),
      h('div', { style: { fontSize: '21px', fontWeight: 800, letterSpacing: '-.03em', marginTop: '7px' } }, num(value)),
      h('div', { style: { fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px' } }, label)
    );

    const funnel = [
      { label: 'Visited the site',                value: m.visitors, share: 100,                              ink: 'var(--brand)' },
      { label: 'Viewed a service or team page',   value: m.engaged,  share: pct(m.engaged, m.visitors),       ink: 'var(--info)' },
      { label: 'Took an action',                  value: m.acted,    share: pct(m.acted, m.visitors),         ink: 'var(--ok)' }
    ];

    return card(
      h('div.row.row--wrap', { style: { gap: '10px', marginBottom: '4px' } },
        h('span.card-title', 'Conversions'),
        spacer(),
        h('span', {
          style: {
            fontSize: '11px', fontWeight: 700, color: 'var(--ok)', background: 'var(--ok-soft)',
            padding: '4px 9px', borderRadius: '20px', whiteSpace: 'nowrap'
          }
        }, `${pct(m.acted, m.visitors).toFixed(1)}% of visitors`)
      ),

      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,110px),1fr))',
          gap: '11px', marginTop: '14px'
        }
      },
        tile(m.forms, 'Form submits', 'assignment_turned_in', 'var(--brand)', 'var(--brand-soft)'),
        tile(m.whatsapp, 'WhatsApp clicks', 'chat', 'var(--ok)', 'var(--ok-soft)'),
        tile(m.calls, 'Call taps', 'call', 'var(--info)', 'var(--info-soft)')
      ),

      h('div.eyebrow', { style: { margin: '18px 0 10px' } }, 'JOURNEY'),
      h('div.stack', { style: { gap: '10px' } },
        funnel.map((f) => h('div',
          h('div.row', { style: { gap: '8px', marginBottom: '5px' } },
            h('span', { style: { fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', minWidth: 0, flex: '1' } },
              f.label),
            h('span', { style: { fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' } }, num(f.value)),
            h('span', { style: { fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' } },
              `${f.share.toFixed(f.share === 100 ? 0 : 1)}%`)
          ),
          h('div.ltr', {
            style: { height: '8px', borderRadius: '4px', background: 'var(--line-soft)', overflow: 'hidden' }
          }, h('div', {
            style: { height: '100%', borderRadius: '4px', background: f.ink, width: `${Math.max(6, f.share)}%` }
          }))
        ))
      )
    );
  }

  /* --------------------------------------------------------------------------
     Top pages
     -------------------------------------------------------------------------- */
  const PAGE_COLS = 'minmax(150px,1.6fr) 90px 80px 90px 74px';

  function pagesCard(m) {
    return flushCard(
      h('div', { style: { padding: '16px 20px', borderBottom: '1px solid var(--line)', fontSize: '14.5px', fontWeight: 700 } },
        'Top pages'),

      h('div.dtable-scroll',
        h('div.dtable', { style: { '--cols': PAGE_COLS, minWidth: '520px' } },
          h('div.dtable__head', { style: { padding: '9px 20px', borderTop: 'none', fontSize: '10px' } },
            ['PAGE', 'VIEWS', 'UNIQUE', 'AVG TIME', 'EXIT'].map((l) => h('div', l))),

          m.pages.map((p) => h('div.dtable__row', { style: { padding: '11px 20px' } },
            h('div', { style: { minWidth: 0 } },
              h('div.truncate', { style: { fontSize: '12.5px', fontWeight: 600 } }, p.name),
              h('div.mono.truncate', { style: { fontSize: '10.5px', color: 'var(--muted)', marginTop: '1px' } }, p.path),
              h('div.ltr', {
                style: {
                  height: '4px', borderRadius: '2px', background: 'var(--line-soft)',
                  overflow: 'hidden', marginTop: '6px'
                }
              }, h('div', {
                style: { height: '100%', borderRadius: '2px', background: 'var(--brand)', width: `${pct(p.views, m.pageMax)}%` }
              }))
            ),
            h('div',
              h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, num(p.views)),
              h('div', { style: { fontSize: '10.5px', color: 'var(--muted)' } },
                `${pct(p.views, m.pageviews).toFixed(1)}%`)
            ),
            h('div', num(p.uniq)),
            h('div', p.time),
            h('div.c-ink-3', `${p.exit}%`)
          ))
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Geography
     -------------------------------------------------------------------------- */
  const GEO_COLS = 'minmax(140px,1.5fr) 100px 90px 90px';

  function geoCard(m) {
    const isCities = state.anGeo === 'cities';

    return flushCard(
      h('div.row.row--wrap', {
        style: { gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--line)' }
      },
        h('span.card-title', 'Where visitors are'),
        spacer(),
        segmented(
          [{ value: 'countries', label: 'Countries' }, { value: 'cities', label: 'Cities' }],
          state.anGeo,
          (v) => setState({ anGeo: v })
        )
      ),

      h('div.dtable-scroll',
        h('div.dtable', { style: { '--cols': GEO_COLS, minWidth: '460px' } },
          h('div.dtable__head', { style: { padding: '9px 20px', borderTop: 'none', fontSize: '10px' } },
            [isCities ? 'CITY' : 'COUNTRY', 'VISITORS', 'FORMS', 'WHATSAPP'].map((l) => h('div', l))),

          m.geo.map((g) => h('div.dtable__row', { style: { padding: '11px 20px' } },
            h('div.row', { style: { gap: '10px', minWidth: 0 } },
              h('span', {
                style: { width: '20px', height: '14px', borderRadius: '3px', flex: 'none', background: g.flag || 'var(--line-strong)' }
              }),
              h('span', { style: { minWidth: 0, flex: '1' } },
                h('span.truncate', { style: { display: 'block', fontSize: '12.5px', fontWeight: 600 } }, g.name),
                g.country && h('span.truncate', {
                  style: { display: 'block', fontSize: '10.5px', color: 'var(--muted)' }
                }, g.country),
                h('span.ltr', {
                  style: {
                    display: 'block', height: '4px', borderRadius: '2px',
                    background: 'var(--line-soft)', overflow: 'hidden', marginTop: '6px'
                  }
                }, h('span', {
                  style: {
                    display: 'block', height: '100%', borderRadius: '2px',
                    background: 'var(--info)', width: `${pct(g.visitors, m.geoMax)}%`
                  }
                }))
              )
            ),
            h('div',
              h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, num(g.visitors)),
              h('div', { style: { fontSize: '10.5px', color: 'var(--muted)' } },
                `${pct(g.visitors, m.geoTotal).toFixed(1)}%`)
            ),
            h('div', num(g.forms)),
            h('div', { style: { fontSize: '12px', fontWeight: 700, color: 'var(--ok)' } }, num(g.wa))
          ))
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Button clicks
     -------------------------------------------------------------------------- */
  function buttonsCard(m) {
    return flushCard({ style: { marginTop: '16px' } },
      h('div', { style: { padding: '16px 20px', borderBottom: '1px solid var(--line)' } },
        h('span.card-title', 'Button & form clicks'),
        h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
          'Every tracked call-to-action, by the page it sits on')
      ),

      m.buttons.map((b) => {
        const ink = TONE_VARS[b.tone] || 'var(--brand)';
        const bg = { ok: 'var(--ok-soft)', brand: 'var(--brand-soft)', info: 'var(--info-soft)' }[b.tone];

        return h('div.row.row--wrap', {
          style: { gap: '12px', padding: '12px 20px', borderBottom: '1px solid var(--line-soft)' }
        },
          h('span', {
            style: {
              width: '32px', height: '32px', borderRadius: '9px', display: 'grid',
              placeItems: 'center', flex: 'none', color: ink, background: bg
            }
          }, icon(b.icon, { size: 18 })),
          h('div', { style: { minWidth: '140px', flex: '1' } },
            h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, b.label),
            h('div.mono', { style: { fontSize: '10.5px', color: 'var(--muted)', marginTop: '1px' } }, b.page)
          ),
          h('div.ltr', {
            style: {
              flex: '1 1 140px', minWidth: '100px', height: '6px', borderRadius: '3px',
              background: 'var(--line-soft)', overflow: 'hidden'
            }
          }, h('div', {
            style: { height: '100%', borderRadius: '3px', background: ink, width: `${pct(b.clicks, m.buttonMax)}%` }
          })),
          h('span', {
            style: { fontSize: '13.5px', fontWeight: 800, letterSpacing: '-.02em', width: '56px', textAlign: 'end', flex: 'none' }
          }, num(b.clicks))
        );
      })
    );
  }

  /* --------------------------------------------------------------------------
     Recent visitors
     -------------------------------------------------------------------------- */
  const VISITOR_COLS = '70px minmax(150px,1fr) 70px minmax(200px,1.4fr) 80px 150px';

  function visitorsCard() {
    return flushCard({ style: { marginTop: '16px' } },
      h('div.row.row--wrap', {
        style: { gap: '10px', padding: '16px 20px', borderBottom: '1px solid var(--line)' }
      },
        h('span.card-title', 'Recent visitors'),
        h('span.row', {
          style: {
            gap: '5px', fontSize: '11px', fontWeight: 700, color: 'var(--ok)',
            background: 'var(--ok-soft)', padding: '4px 9px', borderRadius: '20px'
          }
        },
          h('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ok)' } }),
          'Live'
        )
      ),

      h('div.dtable-scroll',
        h('div.dtable', { style: { '--cols': VISITOR_COLS, minWidth: '760px' } },
          h('div.dtable__head', { style: { padding: '9px 20px', borderTop: 'none', fontSize: '10px' } },
            ['TIME', 'LOCATION', 'DEVICE', 'PAGES VIEWED', 'DURATION', 'ACTION'].map((l) => h('div', l))),

          VISITORS.map((v, i) => {
            const action = ACTIONS[v.action];
            return h('div.dtable__row', { style: { padding: '11px 20px' } },
              h('div.mono', { style: { fontSize: '11.5px', color: 'var(--muted)' } }, v.when),
              h('div.row', { style: { gap: '9px', minWidth: 0 } },
                h('span.avatar.avatar--sm', {
                  style: { background: tintFor(i), fontSize: '9.5px' }
                }, v.city.slice(0, 2).toUpperCase()),
                h('span', { style: { minWidth: 0 } },
                  h('span.truncate', { style: { display: 'block', fontSize: '12.5px', fontWeight: 600 } }, v.city),
                  h('span.truncate', { style: { display: 'block', fontSize: '10.5px', color: 'var(--muted)' } }, v.country)
                )
              ),
              h('div', icon(v.device, { size: 18, color: 'var(--muted)' })),
              h('div', { style: { minWidth: 0 } },
                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } },
                  v.pages.map((p) => h('span.mono', {
                    style: {
                      fontSize: '10px', fontWeight: 600, color: 'var(--ink-3)',
                      background: 'var(--surface-2)', padding: '3px 7px',
                      borderRadius: '5px', whiteSpace: 'nowrap'
                    }
                  }, p))
                ),
                h('div', { style: { fontSize: '10.5px', color: 'var(--muted)', marginTop: '4px' } },
                  `${v.pages.length} ${v.pages.length === 1 ? 'page' : 'pages'}`)
              ),
              h('div', v.dur),
              h('div',
                h('span', {
                  style: {
                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px',
                    fontWeight: 700, padding: '5px 10px', borderRadius: '7px', whiteSpace: 'nowrap',
                    color: action.ink, background: action.bg
                  }
                }, icon(action.icon, { size: 15 }), action.label)
              )
            );
          })
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Page
     -------------------------------------------------------------------------- */
  function analyticsPage() {
    const m = metrics();

    return h('div',
      h('div.row.row--wrap', { style: { gap: '12px', marginBottom: '16px' } },
        h('div', { style: { minWidth: 0 } },
          h('div', { style: { fontSize: '16px', fontWeight: 800, letterSpacing: '-.02em' } }, CLINIC.domain),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            'Traffic, geography and conversions')
        ),
        spacer(),
        select({
          value: state.anRange,
          options: RANGES,
          size: 'lg',
          onChange: (v) => setState({ anRange: v })
        }),
        button('Export', { icon: 'ios_share' })
      ),

      kpiCards(m),

      h('div.grid-auto.grid-auto--lg', { style: { alignItems: 'start' } },
        trendCard(m),
        conversionsCard(m)
      ),

      h('div.grid-auto.grid-auto--lg', { style: { marginTop: '16px', alignItems: 'start' } },
        pagesCard(m),
        geoCard(m)
      ),

      buttonsCard(m),
      visitorsCard()
    );
  }

  Ivora.define('pages/analytics', { analyticsPage: analyticsPage });
})();
