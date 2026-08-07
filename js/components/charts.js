/**
 * charts.js — Hand-rolled SVG/flexbox charts.
 *
 * No charting library: each function takes plain data and returns DOM. The
 * shapes needed by this product are simple enough that the geometry is a few
 * lines each, and staying dependency-free keeps the bundle at zero bytes of
 * third-party JS.
 *
 * All charts render left-to-right regardless of document direction.
 *
 * @module components/charts
 */
(function () {
  'use strict';

  var { h } = Ivora.require('core/dom');
  var { pct } = Ivora.require('core/format');

  /**
   * Area + line chart with hover columns.
   *
   * @param {{label: string, value: number, tip?: string}[]} points
   * @param {object} [opts] `{ height, color, width }`
   * @returns {Element}
   */
  function lineChart(points, opts = {}) {
    const { height = 200, color = '#0e7a70', vbWidth = 720, vbHeight = 200 } = opts;
    if (!points.length) return h('div.empty', 'No data');

    const values = points.map((p) => p.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    // Pad the range so the line never touches the top or bottom edge.
    const span = max - min || 1;
    const top = 18;
    const bottom = vbHeight - 24;

    const x = (i) => (points.length === 1 ? vbWidth / 2 : (i / (points.length - 1)) * vbWidth);
    const y = (v) => bottom - ((v - min) / span) * (bottom - top);

    const coords = points.map((p, i) => [x(i), y(p.value)]);
    const line = coords.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
    const area = `M0,${vbHeight} L${coords.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' L')} L${vbWidth},${vbHeight} Z`;

    const gridYs = [12, 56, 100, 144];

    const svg = h('svg.chart-line__svg', {
      viewBox: `0 0 ${vbWidth} ${vbHeight}`,
      preserveAspectRatio: 'none',
      style: { height: `${height}px` }
    },
      gridYs.map((gy) => h('line', {
        x1: 0, y1: gy, x2: vbWidth, y2: gy,
        stroke: 'var(--grid-line)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke'
      })),
      h('line', {
        x1: 0, y1: vbHeight - 12, x2: vbWidth, y2: vbHeight - 12,
        stroke: 'var(--axis-line)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke'
      }),
      h('path', { d: area, fill: color, opacity: '.07' }),
      h('polyline', {
        points: line, fill: 'none', stroke: color, 'stroke-width': 2.5,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'
      })
    );

    // Hover columns carry the tooltip and paint the point marker. Positioned
    // as a percentage of the container so they track the responsive SVG.
    const hits = h('div.chart-line__hit',
      points.map((p, i) => h('div.chart-line__col', { title: p.tip || `${p.label}: ${p.value}` },
        h('span.chart-line__dot', { style: { top: `${(y(p.value) / vbHeight) * 100}%` } })
      ))
    );

    return h('div.chart.chart-line',
      h('div', { style: { position: 'relative', marginTop: '14px' } }, svg, hits),
      h('div.chart-axis', points.map((p) => h('span', p.label)))
    );
  }

  /**
   * Grouped bar chart — two series per category (income vs expense).
   *
   * @param {{label: string, a: number, b: number, tip?: string}[]} groups
   * @returns {Element}
   */
  function barChart(groups) {
    if (!groups.length) return h('div.empty', 'No data');
    const max = Math.max(...groups.flatMap((g) => [g.a, g.b])) || 1;

    return h('div',
      h('div.chart-bars',
        groups.map((g) => h('div.chart-bars__group', { title: g.tip || g.label },
          h('span.chart-bars__bar.chart-bars__bar--income', { style: { height: `${pct(g.a, max)}%` } }),
          h('span.chart-bars__bar.chart-bars__bar--expense', { style: { height: `${pct(g.b, max)}%` } })
        ))
      ),
      h('div.chart-axis', { style: { gap: '6px' } }, groups.map((g) => h('span', g.label)))
    );
  }

  /**
   * Donut ring SVG.
   *
   * Drawn in a 42-unit viewBox so the circumference is very close to 100 and
   * each arc's dash length is simply its percentage — the same trick the
   * original design uses, which keeps the arcs pixel-identical.
   *
   * @param {{name: string, value: number, color: string}[]} slices
   * @param {object} [opts] `{ size, thickness }` in viewBox units.
   * @returns {Element} An `<svg>` rotated so the first slice starts at 12 o'clock.
   */
  function donutRings(slices, opts = {}) {
    const { size = 150, thickness = 6 } = opts;
    const total = slices.reduce((n, s) => n + s.value, 0) || 1;

    let offset = 0;
    const rings = slices.map((s) => {
      const share = (s.value / total) * 100;
      const circle = h('circle', {
        cx: 21, cy: 21, r: 15.9,
        fill: 'none', stroke: s.color, 'stroke-width': thickness,
        'stroke-dasharray': `${share.toFixed(2)} ${(100 - share).toFixed(2)}`,
        'stroke-dashoffset': (-offset).toFixed(2)
      }, h('title', `${s.name}: ${Math.round(share)}%`));
      offset += share;
      return circle;
    });

    return h('svg.chart-donut__svg', {
      viewBox: '0 0 42 42',
      style: { width: `${size}px`, height: `${size}px` }
    }, rings);
  }

  /**
   * Donut with a centred total and a legend — the general-purpose composition.
   *
   * @param {{name: string, value: number, color: string}[]} slices
   * @param {object} [opts] `{ centerLabel, centerValue, size, thickness }`
   */
  function donutChart(slices, opts = {}) {
    const { centerLabel = 'TOTAL', centerValue = '', size = 150 } = opts;
    const total = slices.reduce((n, s) => n + s.value, 0) || 1;

    return h('div.chart-donut',
      h('div.chart-donut__wrap', { style: { width: `${size}px`, height: `${size}px` } },
        donutRings(slices, opts),
        h('div.chart-donut__center',
          h('div',
            h('div.eyebrow', centerLabel),
            h('div', { style: { fontSize: '17px', fontWeight: 800, marginTop: '2px' } }, centerValue)
          )
        )
      ),
      h('div.chart-donut__legend',
        slices.map((s) => h('div.chart-donut__item',
          h('span.swatch', { style: { background: s.color } }),
          h('span.truncate', { style: { flex: '1' } }, s.name),
          h('span.fw-7', `${Math.round((s.value / total) * 100)}%`)
        ))
      )
    );
  }

  /**
   * Horizontal ranked bar — a row whose background fill encodes its share.
   *
   * @param {number} value    This row's value.
   * @param {number} max      The largest value in the set.
   * @param {...Element} children  Row content rendered above the fill.
   */
  function rankRow(value, max, ...children) {
    return h('div.rankbar',
      h('span.rankbar__track', { style: { width: `${pct(value, max)}%` } }),
      ...children
    );
  }

  /**
   * Compact sparkline for stat tiles.
   * @param {number[]} values
   * @param {string} [color]
   */
  function sparkline(values, color = 'var(--brand)') {
    if (values.length < 2) return h('div');
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const w = 100;
    const hgt = 30;
    const pts = values
      .map((v, i) => `${(i / (values.length - 1)) * w},${hgt - ((v - min) / span) * hgt}`)
      .join(' ');

    return h('svg.spark', { viewBox: `0 0 ${w} ${hgt}`, preserveAspectRatio: 'none' },
      h('polyline', {
        points: pts, fill: 'none', stroke: color, 'stroke-width': 2,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'
      })
    );
  }

  Ivora.define('components/charts', {
    lineChart: lineChart,
    barChart: barChart,
    donutRings: donutRings,
    donutChart: donutChart,
    rankRow: rankRow,
    sparkline: sparkline
  });
})();
