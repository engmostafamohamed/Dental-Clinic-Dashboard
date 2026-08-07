/**
 * website.js — Marketing-site content editor.
 *
 * Left rail lists sections (reorder / show / hide). Right pane edits the
 * selected section's fields and, where present, its repeater items.
 *
 * @module pages/website
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { button, toggle } = Ivora.require('components/ui');
  var { openPreview } = Ivora.require('components/site-preview');
  var { CLINIC } = Ivora.require('data/index');

  /* --------------------------------------------------------------------------
     State helpers — all edits funnel through these so `siteDirty` stays honest.
     -------------------------------------------------------------------------- */

  /** Apply `fn` to the section with `id`, marking the site dirty. */
  const mapSection = (id, fn) => setState((s) => ({
    site: s.site.map((sec) => (sec.id === id ? fn(sec) : sec)),
    siteDirty: true
  }));

  const setField = (id, key, value) =>
    mapSection(id, (sec) => ({
      ...sec,
      fields: sec.fields.map((f) => (f.k === key ? { ...f, v: value } : f))
    }));

  const setItemField = (id, itemId, key, value) =>
    mapSection(id, (sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, [key]: value } : it))
    }));

  const toggleSection = (id) =>
    mapSection(id, (sec) => ({ ...sec, visible: !sec.visible }));

  const toggleItem = (id, itemId) =>
    mapSection(id, (sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, visible: !it.visible } : it))
    }));

  const removeItem = (id, itemId) =>
    mapSection(id, (sec) => ({ ...sec, items: sec.items.filter((it) => it.id !== itemId) }));

  /** Move an item within its section by `dir` (-1 up, +1 down). */
  const moveItem = (id, itemId, dir) =>
    mapSection(id, (sec) => {
      const i = sec.items.findIndex((x) => x.id === itemId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= sec.items.length) return sec;
      const items = sec.items.slice();
      items.splice(j, 0, items.splice(i, 1)[0]);
      return { ...sec, items };
    });

  /** Move a section. Index 0 (Brand & Theme) is pinned. */
  const moveSection = (id, dir) => setState((s) => {
    const i = s.site.findIndex((sec) => sec.id === id);
    const j = i + dir;
    if (i < 1 || j < 1 || j >= s.site.length) return null;
    const site = s.site.slice();
    site.splice(j, 0, site.splice(i, 1)[0]);
    return { site, siteDirty: true };
  });

  /** Append a blank item shaped by the section's `itemFields`. */
  const addItem = (id) => {
    const newId = `new${state.siteNewId}`;
    setState((s) => ({ siteNewId: s.siteNewId + 1 }));
    mapSection(id, (sec) => {
      const blank = { id: newId, visible: true };
      (sec.itemFields || []).forEach((f) => {
        blank[f.k] = f.type === 'image' ? `site-${newId}` : '';
      });
      return { ...sec, items: sec.items.concat([blank]) };
    });
  };

  const publish = () => setState({ siteDirty: false });

  /* --------------------------------------------------------------------------
     Field rendering
     -------------------------------------------------------------------------- */

  /**
   * Render one editable field.
   *
   * @param {object} def    Field descriptor from data/website.js.
   * @param {*} value       Current value.
   * @param {Function} set  `(next) => void`
   * @param {boolean} compact  Slightly smaller controls, used inside items.
   */
  function fieldControl(def, value, set, compact = false) {
    switch (def.type) {
      case 'area':
        return h('textarea.editor__textarea', {
          style: compact ? { minHeight: '64px', borderRadius: '10px', padding: '9px 11px' } : null,
          oninput: (e) => set(e.target.value)
        }, value || '');

      case 'image':
        return h('div.editor__image', {
          style: compact ? { height: '120px', borderRadius: '11px' } : null
        },
          h('div', icon('add_photo_alternate'), h('div', 'Drop image'))
        );

      case 'toggle':
        return toggle(value === true, () => set(!value));

      case 'color':
        return h('div.swatches',
          (def.opts || []).map((hex) => h(`button.swatches__btn${hex === value ? '.is-picked' : ''}`, {
            type: 'button',
            title: hex,
            style: { background: hex },
            onclick: () => set(hex)
          }))
        );

      case 'icon':
        return h('div.iconfield',
          h('span.iconfield__preview', icon(value || 'dentistry', { size: compact ? 18 : 20 })),
          h('input.editor__input', {
            value: value || '',
            placeholder: 'Material icon name',
            style: { height: compact ? '34px' : '38px', borderRadius: compact ? '9px' : '10px', fontSize: '12.5px' },
            oninput: (e) => set(e.target.value)
          })
        );

      case 'text':
      default:
        return h('input.editor__input', {
          value: value || '',
          style: compact ? { height: '36px', borderRadius: '9px', fontSize: '12.5px' } : null,
          oninput: (e) => set(e.target.value)
        });
    }
  }

  /** A labelled field row, with a character count for textareas. */
  function fieldRow(def, value, set, compact = false) {
    return h('div',
      h('div.editor__field-head',
        h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)' } }, def.label),
        spacer(),
        def.type === 'area' && h('span.editor__count', `${String(value || '').length} chars`)
      ),
      fieldControl(def, value, set, compact)
    );
  }

  /* --------------------------------------------------------------------------
     Section rail
     -------------------------------------------------------------------------- */
  function railRow(section, index) {
    const selected = state.siteSel === section.id;
    const canMove = index > 0;
    const canHide = !section.locked;
    const count = section.items?.length;

    return h(`div.rail-row${selected ? '.is-selected' : ''}${section.visible ? '' : '.is-hidden'}`,
      h('button.rail-row__btn', {
        type: 'button',
        onclick: () => setState({ siteSel: section.id })
      },
        icon(section.icon, { cls: 'rail-row__icon' }),
        h('span', { style: { minWidth: 0, flex: '1' } },
          h('span.rail-row__name.truncate', {
            style: selected ? { color: 'var(--brand)' } : null
          }, section.name),
          h('span.rail-row__blurb.truncate', section.blurb)
        )
      ),

      count != null && h('span.rail-row__count', count),

      canMove && h('span.rail-row__move',
        h('button', { type: 'button', title: 'Move up', onclick: () => moveSection(section.id, -1) },
          icon('expand_less')),
        h('button', { type: 'button', title: 'Move down', onclick: () => moveSection(section.id, 1) },
          icon('expand_more'))
      ),

      canHide && h(`button.rail-row__eye${section.visible ? '.is-on' : ''}`, {
        type: 'button',
        title: 'Show or hide this section',
        onclick: () => toggleSection(section.id)
      }, icon(section.visible ? 'visibility' : 'visibility_off', { size: 18 }))
    );
  }

  /* --------------------------------------------------------------------------
     Item (repeater) editor
     -------------------------------------------------------------------------- */
  function itemCard(section, item, n) {
    // Use whichever text field is present as the card's heading.
    const heading = item.title || item.text || item.meta || `${section.itemLabel} ${n}`;

    const iconBtn = (name, title, onClick, danger = false) =>
      h('button', {
        type: 'button', title, onclick: onClick,
        style: {
          width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'none',
          color: danger ? 'var(--danger)' : 'var(--muted-2)',
          display: 'grid', placeItems: 'center', cursor: 'pointer', flex: 'none'
        }
      }, icon(name, { size: danger ? 16 : 16 }));

    return h(`div.repeater__item${item.visible ? '' : '.is-hidden'}`,
      h('div.repeater__bar',
        h('span', {
          style: {
            width: '22px', height: '22px', borderRadius: '7px', background: 'var(--surface-2)',
            color: 'var(--muted)', display: 'grid', placeItems: 'center',
            fontSize: '10.5px', fontWeight: 700, flex: 'none'
          }
        }, n),
        h('span.repeater__title.truncate', heading),
        iconBtn('arrow_upward', 'Move up', () => moveItem(section.id, item.id, -1)),
        iconBtn('arrow_downward', 'Move down', () => moveItem(section.id, item.id, 1)),
        h(`button`, {
          type: 'button',
          title: 'Show or hide this card',
          onclick: () => toggleItem(section.id, item.id),
          style: {
            width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'none',
            color: item.visible ? 'var(--brand)' : 'var(--muted-2)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', flex: 'none'
          }
        }, icon(item.visible ? 'visibility' : 'visibility_off', { size: 17 })),
        iconBtn('delete', 'Delete card', () => removeItem(section.id, item.id), true)
      ),

      h('div.repeater__fields',
        (section.itemFields || []).map((def) =>
          fieldRow(def, item[def.k], (v) => setItemField(section.id, item.id, def.k, v), true)
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Page
     -------------------------------------------------------------------------- */
  function websitePage() {
    const sections = state.site;
    const selected = sections.find((s) => s.id === state.siteSel) || sections[0];
    const visibleCount = sections.filter((s) => s.visible).length;
    const hiddenCount = sections.length - visibleCount;

    return h('div',
      // Toolbar
      h('div.row.row--wrap', { style: { gap: '12px', marginBottom: '16px' } },
        h('div', { style: { minWidth: 0 } },
          h('div', { style: { fontSize: '16px', fontWeight: 800, letterSpacing: '-.02em' } }, CLINIC.domain),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' } },
            `${visibleCount} sections live · ${hiddenCount} hidden`)
        ),
        spacer(),
        state.siteDirty
          ? h('span.pill', {
              style: { color: 'var(--warn)', background: 'var(--warn-soft)', padding: '6px 11px', gap: '6px' }
            }, icon('edit_note', { size: 15 }), 'Unpublished changes')
          : h('span.pill', {
              style: { color: 'var(--ok)', background: 'var(--ok-soft)', padding: '6px 11px', gap: '6px' }
            }, icon('cloud_done', { size: 15 }), 'All changes published'),
        button('Preview site', { icon: 'visibility', onClick: openPreview }),
        button('Publish', { icon: 'rocket_launch', variant: 'brand', onClick: publish })
      ),

      h('div.builder',
        // Rail
        h('div.rail-list',
          h('div.rail-list__head', 'Page sections'),
          sections.map(railRow)
        ),

        // Editor
        h('div.editor',
          h('div.editor__head',
            h('div.editor__mark', icon(selected.icon, { size: 19 })),
            h('div', { style: { minWidth: 0, flex: '1' } },
              h('div', { style: { fontSize: '14.5px', fontWeight: 800, letterSpacing: '-.02em' } }, selected.name),
              h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' } }, selected.blurb)
            ),
            !selected.locked && h('span.row', { style: { gap: '9px', flex: 'none' } },
              h('span', { style: { fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' } },
                selected.visible ? 'Visible' : 'Hidden'),
              toggle(selected.visible, () => toggleSection(selected.id))
            )
          ),

          h('div.editor__body',
            selected.fields?.length && h('div.editor__fields',
              selected.fields.map((def) => fieldRow(def, def.v, (v) => setField(selected.id, def.k, v)))
            ),

            selected.items && h('div.repeater',
              h('div.repeater__head',
                h('span.eyebrow', `CARDS (${selected.items.length})`),
                spacer(),
                h('span', { style: { fontSize: '11px', color: 'var(--muted)' } },
                  'Toggle the eye to hide a single card')
              ),
              h('div.stack', { style: { gap: '11px' } },
                selected.items.map((it, i) => itemCard(selected, it, i + 1))
              ),
              h('button', {
                type: 'button',
                onclick: () => addItem(selected.id),
                style: {
                  marginTop: '12px', width: '100%', height: '40px', borderRadius: '11px',
                  border: '1.5px dashed var(--brand-line)', background: 'var(--brand-soft)',
                  color: 'var(--brand)', fontSize: '12.5px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', cursor: 'pointer'
                }
              }, icon('add', { size: 17 }), `Add ${selected.itemLabel}`)
            )
          )
        )
      )
    );
  }

  Ivora.define('pages/website', { websitePage: websitePage });
})();
