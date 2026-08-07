/**
 * ui.js — Small element factories shared by every page.
 *
 * These wrap the classes defined in components.css so pages express intent
 * ("a brand button", "an ok badge") instead of repeating class strings.
 *
 * @module components/ui
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { initials: toInitials, tintFor } = Ivora.require('core/format');

  /* --------------------------------------------------------------------------
     Buttons
     -------------------------------------------------------------------------- */

  /**
   * @param {string} label
   * @param {object} [opts] `{ icon, variant, size, onClick, title, disabled, cls }`
   */
  function button(label, opts = {}) {
    const {
      icon: ic, variant = 'outline', size = '', onClick, title, disabled, cls = '', fill
    } = opts;

    return h(`button.btn.btn-${variant}${size ? `.btn-${size}` : ''}${cls ? '.' + cls.split(' ').join('.') : ''}`, {
      onclick: onClick,
      title,
      disabled: disabled || undefined,
      type: 'button'
    },
      ic && icon(ic, { size: 17, fill }),
      label
    );
  }

  /**
   * Icon-only button.
   * @param {string} name  Material Symbols ligature.
   * @param {object} [opts] `{ onClick, title, small, iconSize, cls }`
   */
  function iconButton(name, opts = {}) {
    const { onClick, title, small = false, cls = '', iconSize = 18 } = opts;
    return h(`button.btn.btn-icon${small ? '.btn-icon-sm' : ''}${cls ? '.' + cls.split(' ').join('.') : ''}`, {
      onclick: onClick, title, type: 'button'
    }, icon(name, { size: iconSize }));
  }

  /** Text-only inline action. */
  function linkButton(label, onClick) {
    return h('button.btn-link', { onclick: onClick, type: 'button' }, label);
  }

  /* --------------------------------------------------------------------------
     Badges
     -------------------------------------------------------------------------- */

  /**
   * @param {string} label
   * @param {'ok'|'info'|'warn'|'danger'|'brand'|'purple'|'muted'|'neutral'} tone
   */
  const badge = (label, tone = 'muted', opts = {}) =>
    h(`span.badge.badge-${tone}`, opts.icon && icon(opts.icon, { size: 13 }), label);

  /** Delta pill, e.g. "▲ 6.2%". */
  const pill = (label, tone = 'ok', iconName = 'arrow_upward') =>
    h(`span.pill.pill-${tone}`, icon(iconName, { size: 14 }), label);

  /** Coloured square used in legends. */
  const swatch = (color) => h('span.swatch', { style: { background: color } });

  /* --------------------------------------------------------------------------
     Avatars
     -------------------------------------------------------------------------- */

  /**
   * Initials avatar with a deterministic tint.
   * @param {string} name
   * @param {object} [opts] `{ index, size: 'sm'|'md'|'lg', color }`
   */
  function avatar(name, opts = {}) {
    const { index = 0, size, color } = opts;
    return h(`div.avatar${size ? `.avatar--${size}` : ''}`, {
      style: { background: color || tintFor(index) }
    }, toInitials(name));
  }

  /** Tinted square icon tile. */
  function iconTile(name, opts = {}) {
    const { tint = 'var(--ink-3)', bg = 'var(--surface-2)', size, iconSize = 18, fill } = opts;
    return h(`div.itile${size ? `.itile--${size}` : ''}`, {
      style: { background: bg, color: tint }
    }, icon(name, { size: iconSize, fill }));
  }

  /* --------------------------------------------------------------------------
     Form controls
     -------------------------------------------------------------------------- */

  /**
   * Native select wrapped with a chevron.
   * @param {object} opts `{ value, options, onChange, size, width }`
   *   `options` may be strings or `{ value, label }`.
   */
  function select({ value, options, onChange, size = '', width, cls = '' }) {
    const sel = h(`select.select${size ? `.select--${size}` : ''}${cls ? '.' + cls.split(' ').join('.') : ''}`, {
      onchange: (e) => onChange?.(e.target.value)
    },
      options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return h('option', { value: val, selected: val === value }, label);
      })
    );
    // Assign after mount so the browser honours it even for duplicate labels.
    sel.value = value;
    return h('div.select-wrap', { style: width ? { width } : null }, sel);
  }

  /** Labelled field wrapper. */
  const field = (label, control) => h('div.field', h('label.field-label', label), control);

  /** Text input. */
  function input({ value = '', placeholder = '', onInput, type = 'text', cls = '' }) {
    return h(`input.input${cls ? '.' + cls.split(' ').join('.') : ''}`, {
      type, value, placeholder,
      oninput: (e) => onInput?.(e.target.value)
    });
  }

  /** Multi-line input. */
  function textarea({ value = '', placeholder = '', onInput, rows = 3 }) {
    return h('textarea.textarea', {
      placeholder, rows,
      oninput: (e) => onInput?.(e.target.value)
    }, value);
  }

  /** Rounded search box with a leading magnifier. */
  function searchBox({ value = '', placeholder = 'Search...', onInput, width = '260px' }) {
    return h('div.search', { style: { width } },
      icon('search', { cls: 'search__icon' }),
      h('input.search__input', {
        value, placeholder,
        oninput: (e) => onInput?.(e.target.value)
      })
    );
  }

  /** On/off switch. */
  const toggle = (on, onClick) =>
    h(`button.toggle${on ? '.is-on' : ''}`, { onclick: onClick, type: 'button' }, h('span.toggle__dot'));

  /** Checkbox drawn as a bordered square (or circle with `round`). */
  const check = (on, onClick, opts = {}) =>
    h(`button.check${opts.round ? '.check--round' : ''}${on ? '.is-on' : ''}`, {
      onclick: onClick, type: 'button'
    }, icon(opts.round ? 'circle' : 'check', { size: opts.round ? 8 : 14, fill: true }));

  /** Selectable chip. */
  const chip = (label, on, onClick, opts = {}) =>
    h(`button.chip${on ? '.is-on' : ''}`, { onclick: onClick, type: 'button', title: opts.title },
      opts.icon && icon(opts.icon, { size: 15 }),
      label
    );

  /** Segmented control. `options` = `[{ value, label, icon }]`. */
  function segmented(options, value, onChange) {
    return h('div.segmented',
      options.map((o) => h(`button.segmented__btn${o.value === value ? '.is-active' : ''}`, {
        onclick: () => onChange(o.value), type: 'button', title: o.title
      },
        o.icon && icon(o.icon, { size: 17 }),
        o.label
      ))
    );
  }

  /* --------------------------------------------------------------------------
     Structure
     -------------------------------------------------------------------------- */

  /** Card with optional padding. */
  const card = (...children) => h('div.card.card--pad', ...children);

  /** Card that clips its children (for tables and lists). */
  const flushCard = (...children) => h('div.card.card--flush', ...children);

  /**
   * Card header with a title and trailing controls.
   * @param {string} title
   * @param {...Element} controls  Rendered after a flexible spacer.
   */
  const cardHead = (title, ...controls) =>
    h('div.card-head', h('span.card-title', title), spacer(), ...controls);

  /** Tab strip. `tabs` = `[{ id, label }]`. */
  function tabs(items, active, onPick, opts = {}) {
    return h(`div.tabs${opts.inset ? '.tabs--inset' : ''}`,
      items.map((t) => h(`button.tab${t.id === active ? '.is-active' : ''}`, {
        onclick: () => onPick(t.id), type: 'button'
      }, t.label))
    );
  }

  /** Key/value pair. */
  const kv = (label, value) =>
    h('div', h('div.kv__k', label), h('div.kv__v', value));

  /** Stat tile. */
  const stat = (label, value, sub) =>
    h('div.stat',
      h('div.stat__label', label),
      h('div.stat__value', value),
      sub && h('div.stat__sub', sub)
    );

  /** Empty-state block. */
  const empty = (message, iconName = 'inbox') =>
    h('div.empty', icon(iconName), message);

  /** Progress bar. */
  const progress = (value, max, color = 'var(--brand)') =>
    h('div.bar', h('div.bar__fill', {
      style: { width: `${max ? (value / max) * 100 : 0}%`, background: color }
    }));

  /** Callout note. */
  const note = (text, tone = '', iconName) =>
    h(`div.note${tone ? `.note--${tone}` : ''}`,
      iconName && icon(iconName, { size: 17 }),
      h('span', text)
    );

  /**
   * Data table.
   *
   * @param {object} opts
   *   `cols`  grid-template-columns value
   *   `min`   min-width forcing horizontal scroll
   *   `head`  array of header labels
   *   `rows`  array of DOM rows (build with `tableRow`)
   */
  function table({ cols, min = '900px', head, rows }) {
    // Stamp each cell with its column heading. On a phone the header row is
    // hidden and every row becomes a stacked card, with these labels drawn by
    // CSS (`content: attr(data-label)`) so each value stays identifiable.
    // Doing it here means all seven tables get the treatment for free.
    if (head) {
      for (const row of rows) {
        if (!row || !row.children) continue;
        Array.prototype.forEach.call(row.children, (cell, i) => {
          if (head[i]) cell.setAttribute('data-label', head[i]);
        });
      }
    }

    return h('div.dtable-scroll',
      // min-width comes from the --min custom property rather than an inline
      // style, so the phone breakpoint below can drop it.
      h('div.dtable', { style: { '--cols': cols, '--min': min } },
        head && h('div.dtable__head', head.map((label) => h('div', label))),
        ...rows
      )
    );
  }

  /** One table row. Pass `onClick` to make it interactive. */
  const tableRow = (cells, opts = {}) =>
    h(`div.dtable__row${opts.onClick ? '.dtable__row--click' : ''}`, {
      onclick: opts.onClick,
      style: opts.style
    }, cells);

  Ivora.define('components/ui', {
    spacer: spacer,
    button: button,
    iconButton: iconButton,
    linkButton: linkButton,
    badge: badge,
    pill: pill,
    swatch: swatch,
    avatar: avatar,
    iconTile: iconTile,
    select: select,
    field: field,
    input: input,
    textarea: textarea,
    searchBox: searchBox,
    toggle: toggle,
    check: check,
    chip: chip,
    segmented: segmented,
    card: card,
    flushCard: flushCard,
    cardHead: cardHead,
    tabs: tabs,
    kv: kv,
    stat: stat,
    empty: empty,
    progress: progress,
    note: note,
    table: table,
    tableRow: tableRow
  });
})();
