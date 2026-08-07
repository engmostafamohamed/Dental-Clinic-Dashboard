/**
 * dom.js — A ~90-line hyperscript helper.
 *
 * Pages describe their UI as nested `h()` calls returning real DOM nodes.
 * There is no virtual DOM and no diffing: a state change re-renders the
 * affected region wholesale (see core/store.js). At this data volume that is
 * both simpler to reason about and fast enough.
 *
 * Usage:
 *   h('div.card.card--pad', { onclick: fn }, 'text', h('span', 'child'))
 *
 * The tag string supports CSS-ish shorthand: `div.a.b#id`. Attributes are
 * plain DOM properties where possible, falling back to setAttribute, with
 * three special keys: `class`, `style` (object or string) and `dataset`.
 *
 * @module core/dom
 */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  /** Tags that must be created in the SVG namespace. */
  // Tags that must be created in the SVG namespace. Anything missing here is
  // built as an HTML element instead and silently renders nothing inside an
  // <svg> — which is exactly how `use` went unnoticed until the dental arch
  // came up blank. `title` is shared with HTML, but the app only ever uses it
  // as an SVG tooltip.
  const SVG_TAGS = new Set([
    'svg', 'g', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon',
    'text', 'defs', 'linearGradient', 'radialGradient', 'stop', 'ellipse',
    'tspan', 'clipPath', 'use', 'symbol', 'marker', 'mask', 'pattern',
    'image', 'foreignObject', 'title', 'desc'
  ]);

  /**
   * Create a DOM element.
   *
   * @param {string} spec  Tag with optional `.class` and `#id` shorthand.
   * @param {...*}   rest  Optional props object, then any number of children.
   *                       Children may be nodes, strings, numbers, arrays, or
   *                       null/false/undefined (skipped — handy for `cond && …`).
   * @returns {Element}
   */
  function h(spec, ...rest) {
    const { tag, classes, id } = parseSpec(spec);
    const isSvg = SVG_TAGS.has(tag);
    const el = isSvg
      ? document.createElementNS(SVG_NS, tag)
      : document.createElement(tag);

    if (classes.length) el.setAttribute('class', classes.join(' '));
    if (id) el.id = id;

    let children = rest;
    if (isProps(rest[0])) {
      applyProps(el, rest[0], isSvg);
      children = rest.slice(1);
    }

    append(el, children);
    return el;
  }

  /** A plain object in the first slot is treated as props, not a child. */
  function isProps(v) {
    return v != null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Node);
  }

  function parseSpec(spec) {
    const hashAt = spec.indexOf('#');
    let id = '';
    let head = spec;
    if (hashAt !== -1) {
      id = spec.slice(hashAt + 1).split('.')[0];
      head = spec.slice(0, hashAt) + spec.slice(hashAt + 1 + id.length);
    }
    const parts = head.split('.');
    return { tag: parts[0] || 'div', classes: parts.slice(1).filter(Boolean), id };
  }

  function applyProps(el, props, isSvg) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;

      if (key === 'class' || key === 'className') {
        // Merge rather than replace — the tag shorthand may already have set some.
        const existing = el.getAttribute('class');
        el.setAttribute('class', existing ? `${existing} ${value}` : String(value));
      } else if (key === 'style') {
        applyStyle(el, value);
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (!isSvg && key in el && key !== 'list' && key !== 'type') {
        // Properties round-trip values (e.g. input.value) better than attributes.
        el[key] = value;
      } else {
        el.setAttribute(key, value === true ? '' : String(value));
      }
    }
  }

  function applyStyle(el, value) {
    if (typeof value === 'string') {
      el.style.cssText = value;
      return;
    }
    for (const [prop, v] of Object.entries(value)) {
      if (v == null) continue;
      // Custom properties (--x) must go through setProperty.
      if (prop.startsWith('--')) el.style.setProperty(prop, String(v));
      else el.style[prop] = v;
    }
  }

  function append(el, children) {
    for (const child of children) {
      if (child == null || child === false || child === true || child === '') continue;
      if (Array.isArray(child)) {
        append(el, child);
      } else if (child instanceof Node) {
        el.appendChild(child);
      } else {
        el.appendChild(document.createTextNode(String(child)));
      }
    }
  }

  /**
   * Material Symbols icon.
   * @param {string} name  Ligature name, e.g. 'calendar_month'.
   * @param {object} [opts] `{ fill: boolean, size: number|string, color: string, cls: string }`
   */
  function icon(name, opts = {}) {
    const el = h('i' + (opts.cls ? '.' + opts.cls.split(' ').join('.') : ''), name);
    if (opts.fill) el.style.fontVariationSettings = "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24";
    if (opts.size) el.style.fontSize = typeof opts.size === 'number' ? `${opts.size}px` : opts.size;
    if (opts.color) el.style.color = opts.color;
    return el;
  }

  /** Replace every child of `host` with `content`. */
  function mount(host, content) {
    host.replaceChildren();
    append(host, [content]);
    return host;
  }

  /** Shorthand for a flexible spacer inside a flex row. */
  const spacer = () => h('div.spacer');

  /** `document.querySelector`, scoped. */
  const $ = (sel, root = document) => root.querySelector(sel);

  /** `document.querySelectorAll` as a real array, scoped. */
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Escape text for the rare case we build an HTML string (SVG sprites). */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  Ivora.define('core/dom', { h: h, icon: icon, mount: mount, spacer: spacer, $: $, $$: $$, esc: esc });
})();
