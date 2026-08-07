/**
 * dental-arch.js — Anatomical dental chart.
 *
 * The chairside check-up needs a chart a dentist can read at a glance, so
 * this draws the real arch rather than a grid of boxes: 32 teeth laid out on
 * an oval, each rotated to sit perpendicular to the curve, and each drawn
 * with the silhouette of its own type — molar, premolar, canine or incisor.
 *
 * The geometry is fixed (it is anatomy, not layout), so the coordinates are a
 * table rather than a computation. They are lifted from the Ivora Clinic
 * Suite design so the chart matches it exactly.
 *
 * Coordinates are absolute within a 310 x 380 box. The container is pinned to
 * `direction: ltr` — the arch is a picture of a mouth, and mirroring it under
 * RTL would swap the patient's left and right, which is a clinical error.
 *
 * @module components/dental-arch
 */
(function () {
  'use strict';

  var { h } = Ivora.require('core/dom');

  /** Natural size of the chart, in px. */
  const WIDTH = 310;
  const HEIGHT = 380;

  /**
   * Tooth silhouettes, referenced by <use href="#tx-…">.
   * Injected once per chart as a zero-size <svg><defs>.
   */
  const SPRITE = [
      '<g id="tx-molar"><path d="M12 2.3c2.2 0 3.7.8 4.8 1.7 1.3-.4 3 .5 3.9 1.9.9 1.4 1 3.3.5 4.6.6 1.3.5 3.3-.3 4.7-.8 1.4-2.2 2.2-3.6 2.2-1 1.3-2.8 2.3-5.3 2.3s-4.3-1-5.3-2.3c-1.4 0-2.8-.8-3.6-2.2-.8-1.4-.9-3.4-.3-4.7-.5-1.3-.4-3.2.5-4.6.9-1.4 2.6-2.3 3.9-1.9C8.3 3.1 9.8 2.3 12 2.3Z"></path><path d="M12 7.4v8.2M7.6 11.6h8.8" fill="none" stroke-width=".9" stroke-linecap="round"></path></g>',
      '<g id="tx-premolar"><path d="M12 2.5c2 0 3.6.9 4.7 2.1 1.1 1.2 1.6 2.9 1.6 4.7 0 2.3-.3 4.6-1.2 6.3-.9 1.8-2.4 3-5.1 3s-4.2-1.2-5.1-3c-.9-1.7-1.2-4-1.2-6.3 0-1.8.5-3.5 1.6-4.7C8.4 3.4 10 2.5 12 2.5Z"></path><path d="M7.9 10.6c1.6 1 2.7 1.4 4.1 1.4s2.5-.4 4.1-1.4M12 12v4" fill="none" stroke-width=".9" stroke-linecap="round"></path></g>',
      '<g id="tx-canine"><path d="M12 2.3c1.9.6 3.3 1.8 4.3 3.3 1 1.5 1.4 3.4 1.4 5.5 0 2.5-.4 4.8-1.3 6.5-.9 1.7-2.3 2.8-4.4 2.8s-3.5-1.1-4.4-2.8c-.9-1.7-1.3-4-1.3-6.5 0-2.1.4-4 1.4-5.5 1-1.5 2.4-2.7 4.3-3.3Z"></path><path d="M12 6.2v9" fill="none" stroke-width=".9" stroke-linecap="round"></path></g>',
      '<g id="tx-incisor"><path d="M12 2.5c2.3 0 3.9.4 4.9 1.3.9.8 1.3 2 1.3 3.7v8.4c0 1.7-.4 2.9-1.3 3.7-1 .9-2.6 1.3-4.9 1.3s-3.9-.4-4.9-1.3c-.9-.8-1.3-2-1.3-3.7V7.5c0-1.7.4-2.9 1.3-3.7 1-.9 2.6-1.3 4.9-1.3Z"></path><path d="M12 6.8v8.4" fill="none" stroke-width=".9" stroke-linecap="round"></path></g>',
  ].join('');

  /**
   * Per-tooth geometry, in FDI order (upper right → upper left, then lower
   * right → lower left). `rot` orients the crown outward from the arch;
   * `labelLeft`/`labelTop` place the number ring outside it.
   */
  const TEETH = [
    { n: 18, shape: 'molar', left: 28.2, top: 136.7, w: 26, h: 26, rot: -81.5, labelLeft: 11, labelTop: 145 },
    { n: 17, shape: 'molar', left: 34.8, top: 109.6, w: 26, h: 26, rot: -68.5, labelLeft: 19, labelTop: 111 },
    { n: 16, shape: 'molar', left: 46.7, top: 84.8, w: 26, h: 26, rot: -55.5, labelLeft: 34, labelTop: 80 },
    { n: 15, shape: 'premolar', left: 63.9, top: 66.1, w: 22, h: 24, rot: -43.5, labelLeft: 54, labelTop: 56 },
    { n: 14, shape: 'premolar', left: 80.8, top: 51.4, w: 22, h: 24, rot: -32.5, labelLeft: 75, labelTop: 37 },
    { n: 13, shape: 'canine', left: 100.0, top: 41.0, w: 20, h: 24, rot: -22.0, labelLeft: 98, labelTop: 24 },
    { n: 12, shape: 'incisor', left: 118.8, top: 35.6, w: 17, h: 23, rot: -12.8, labelLeft: 120, labelTop: 17 },
    { n: 11, shape: 'incisor', left: 135.2, top: 32.8, w: 17, h: 23, rot: -4.3, labelLeft: 141, labelTop: 13 },
    { n: 21, shape: 'incisor', left: 151.8, top: 32.8, w: 17, h: 23, rot: 4.3, labelLeft: 163, labelTop: 13 },
    { n: 22, shape: 'incisor', left: 168.2, top: 35.6, w: 17, h: 23, rot: 12.7, labelLeft: 184, labelTop: 17 },
    { n: 23, shape: 'canine', left: 184.0, top: 41.0, w: 20, h: 24, rot: 22.0, labelLeft: 206, labelTop: 24 },
    { n: 24, shape: 'premolar', left: 201.2, top: 51.4, w: 22, h: 24, rot: 32.5, labelLeft: 229, labelTop: 37 },
    { n: 25, shape: 'premolar', left: 218.1, top: 66.1, w: 22, h: 24, rot: 43.5, labelLeft: 250, labelTop: 56 },
    { n: 26, shape: 'molar', left: 231.3, top: 84.8, w: 26, h: 26, rot: 55.5, labelLeft: 270, labelTop: 80 },
    { n: 27, shape: 'molar', left: 243.2, top: 109.6, w: 26, h: 26, rot: 68.5, labelLeft: 285, labelTop: 111 },
    { n: 28, shape: 'molar', left: 249.8, top: 136.7, w: 26, h: 26, rot: 81.5, labelLeft: 293, labelTop: 145 },
    { n: 48, shape: 'molar', left: 28.2, top: 205.3, w: 26, h: 26, rot: 81.5, labelLeft: 11, labelTop: 223 },
    { n: 47, shape: 'molar', left: 34.8, top: 232.4, w: 26, h: 26, rot: 68.5, labelLeft: 19, labelTop: 257 },
    { n: 46, shape: 'molar', left: 46.7, top: 257.2, w: 26, h: 26, rot: 55.5, labelLeft: 34, labelTop: 288 },
    { n: 45, shape: 'premolar', left: 63.9, top: 277.9, w: 22, h: 24, rot: 43.5, labelLeft: 54, labelTop: 312 },
    { n: 44, shape: 'premolar', left: 80.8, top: 292.6, w: 22, h: 24, rot: 32.5, labelLeft: 75, labelTop: 331 },
    { n: 43, shape: 'canine', left: 100.0, top: 303.0, w: 20, h: 24, rot: 22.0, labelLeft: 98, labelTop: 344 },
    { n: 42, shape: 'incisor', left: 118.8, top: 309.4, w: 17, h: 23, rot: 12.8, labelLeft: 120, labelTop: 351 },
    { n: 41, shape: 'incisor', left: 135.2, top: 312.2, w: 17, h: 23, rot: 4.3, labelLeft: 141, labelTop: 355 },
    { n: 31, shape: 'incisor', left: 151.8, top: 312.2, w: 17, h: 23, rot: -4.3, labelLeft: 163, labelTop: 355 },
    { n: 32, shape: 'incisor', left: 168.2, top: 309.4, w: 17, h: 23, rot: -12.7, labelLeft: 184, labelTop: 351 },
    { n: 33, shape: 'canine', left: 184.0, top: 303.0, w: 20, h: 24, rot: -22.0, labelLeft: 206, labelTop: 344 },
    { n: 34, shape: 'premolar', left: 201.2, top: 292.6, w: 22, h: 24, rot: -32.5, labelLeft: 229, labelTop: 331 },
    { n: 35, shape: 'premolar', left: 218.1, top: 277.9, w: 22, h: 24, rot: -43.5, labelLeft: 250, labelTop: 312 },
    { n: 36, shape: 'molar', left: 231.3, top: 257.2, w: 26, h: 26, rot: -55.5, labelLeft: 270, labelTop: 288 },
    { n: 37, shape: 'molar', left: 243.2, top: 232.4, w: 26, h: 26, rot: -68.5, labelLeft: 285, labelTop: 257 },
    { n: 38, shape: 'molar', left: 249.8, top: 205.3, w: 26, h: 26, rot: -81.5, labelLeft: 293, labelTop: 223 }
  ];

  /**
   * Render the arch.
   *
   * @param {object} opts
   *   `state(n)`    → `{ fill, stroke, label }` colours for tooth `n`
   *   `onPick(n)`   → click handler
   *   `title(n)`    → tooltip text
   *   `scale`       → optional multiplier (1 = 310x380)
   * @returns {Element}
   */
  function dentalArch(opts) {
    const { state, onPick, title, scale = 1 } = opts;

    const sprite = h('svg', {
      width: 0, height: 0, 'aria-hidden': 'true',
      style: { position: 'absolute' }
    });
    // The sprite is static markup; innerHTML avoids rebuilding four path
    // definitions as DOM on every render.
    sprite.innerHTML = '<defs>' + SPRITE + '</defs>';

    const nodes = [sprite];

    for (const t of TEETH) {
      const look = state(t.n);

      const use = h('use', {
        href: '#tx-' + t.shape,
        fill: look.fill,
        stroke: look.stroke,
        'stroke-width': 1.3,
        'vector-effect': 'non-scaling-stroke'
      });

      const svg = h('svg', {
        viewBox: '0 0 24 24',
        preserveAspectRatio: 'none',
        style: { width: '100%', height: '100%', display: 'block' }
      }, use);

      nodes.push(h('button.arch__tooth', {
        type: 'button',
        title: title ? title(t.n) : 'Tooth ' + t.n,
        'aria-label': title ? title(t.n) : 'Tooth ' + t.n,
        onclick: () => onPick(t.n),
        style: {
          left: (t.left * scale) + 'px',
          top: (t.top * scale) + 'px',
          width: (t.w * scale) + 'px',
          height: (t.h * scale) + 'px',
          transform: 'rotate(' + t.rot + 'deg)'
        }
      }, svg));

      nodes.push(h('span.arch__label', {
        style: {
          left: (t.labelLeft * scale) + 'px',
          top: (t.labelTop * scale) + 'px',
          color: look.label
        }
      }, String(t.n)));
    }

    return h('div.arch', {
      style: {
        width: (WIDTH * scale) + 'px',
        height: (HEIGHT * scale) + 'px'
      }
    }, nodes);
  }

  /** Legend matching the design's two-state key. */
  function archLegend() {
    return h('div.arch__legend',
      h('span', h('span.arch__key.arch__key--on'), 'Has treatment'),
      h('span', h('span.arch__key'), 'No treatment')
    );
  }

  Ivora.define('components/dental-arch', {
    dentalArch: dentalArch,
    archLegend: archLegend,
    TEETH: TEETH,
    WIDTH: WIDTH,
    HEIGHT: HEIGHT
  });
})();
