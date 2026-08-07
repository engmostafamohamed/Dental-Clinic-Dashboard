/**
 * site-preview.js — Full-screen preview of the marketing site.
 *
 * Renders the live `state.site` tree at one of three viewport widths.
 * Hidden sections and hidden items are omitted, so the preview shows exactly
 * what a visitor would get.
 *
 * @module components/site-preview
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { DEVICES, CLINIC } = Ivora.require('data/index');

  const openPreview = () => setState({ previewOpen: true });
  const closePreview = () => setState({ previewOpen: false });

  /** Read a field value out of a section by key. */
  const fieldOf = (section, key) => section.fields?.find((f) => f.k === key)?.v;

  /** Visible items of a section. */
  const visibleItems = (section) => (section.items || []).filter((it) => it.visible);

  /* --------------------------------------------------------------------------
     Section renderers, keyed by section id
     -------------------------------------------------------------------------- */
  const RENDERERS = {
    hero: (s, accent) => h('div.site-preview__hero', { style: { background: `${accent}14` } },
      h('div.site-preview__eyebrow', { style: { color: accent } }, fieldOf(s, 'eyebrow')),
      h('h1.site-preview__title', fieldOf(s, 'title')),
      h('p.site-preview__body', fieldOf(s, 'body')),
      h('div.row', { style: { justifyContent: 'center', gap: '10px', flexWrap: 'wrap' } },
        h('span.btn.btn-lg', { style: { background: accent, color: '#fff' } }, fieldOf(s, 'cta')),
        h('span.btn.btn-outline.btn-lg', fieldOf(s, 'cta2'))
      )
    ),

    stats: (s) => h('div.site-preview__section',
      h('div.site-preview__grid',
        visibleItems(s).map((it) => h('div', { style: { textAlign: 'center' } },
          h('div', { style: { fontSize: '24px', fontWeight: 800, letterSpacing: '-.03em' } }, it.title),
          h('div', { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '4px' } }, it.text)
        ))
      )
    ),

    services: (s, accent) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('p.site-preview__body', { style: { textAlign: 'center' } }, fieldOf(s, 'body')),
      h('div.site-preview__grid', { style: { marginTop: '18px' } },
        visibleItems(s).map((it) => h('div.site-preview__card',
          h('div', {
            style: {
              width: '38px', height: '38px', borderRadius: '11px', background: `${accent}1a`,
              color: accent, display: 'grid', placeItems: 'center', marginBottom: '10px'
            }
          }, icon(it.icon || 'dentistry', { size: 20 })),
          h('div', { style: { fontSize: '14px', fontWeight: 700 } }, it.title),
          h('div', { style: { fontSize: '12px', color: 'var(--ink-3)', marginTop: '5px', lineHeight: 1.55 } }, it.text),
          it.meta && h('div', { style: { fontSize: '12.5px', fontWeight: 700, color: accent, marginTop: '9px' } },
            `From ${it.meta}`)
        ))
      )
    ),

    about: (s) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('p.site-preview__body', { style: { textAlign: 'center' } }, fieldOf(s, 'body')),
      h('div.site-preview__grid', { style: { marginTop: '18px' } },
        visibleItems(s).map((it) => h('div.site-preview__card',
          h('div', { style: { fontSize: '13.5px', fontWeight: 700 } }, it.title),
          h('div', { style: { fontSize: '12px', color: 'var(--ink-3)', marginTop: '5px', lineHeight: 1.55 } }, it.text)
        ))
      )
    ),

    doctors: (s, accent) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('div.site-preview__grid',
        visibleItems(s).map((it) => h('div.site-preview__card', { style: { textAlign: 'center' } },
          h('div', {
            style: {
              width: '54px', height: '54px', borderRadius: '50%', background: accent, color: '#fff',
              display: 'grid', placeItems: 'center', fontSize: '18px', fontWeight: 700, margin: '0 auto 10px'
            }
          }, it.title.replace(/^Dr\.?\s+/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('')),
          h('div', { style: { fontSize: '13.5px', fontWeight: 700 } }, it.title),
          h('div', { style: { fontSize: '11.5px', color: accent, fontWeight: 600, marginTop: '2px' } }, it.meta),
          h('div', { style: { fontSize: '12px', color: 'var(--ink-3)', marginTop: '7px', lineHeight: 1.55 } }, it.text)
        ))
      )
    ),

    testimonials: (s) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('div.site-preview__grid',
        visibleItems(s).map((it) => h('div.site-preview__card',
          icon('format_quote', { size: 24, color: 'var(--muted-2)' }),
          h('div', { style: { fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.6, marginTop: '6px' } }, it.text),
          h('div', { style: { fontSize: '12.5px', fontWeight: 700, marginTop: '10px' } }, it.title),
          h('div', { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '1px' } }, it.meta)
        ))
      )
    ),

    faq: (s) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('div.stack', { style: { gap: '10px', maxWidth: '640px', margin: '0 auto' } },
        visibleItems(s).map((it) => h('div.site-preview__card',
          h('div', { style: { fontSize: '13px', fontWeight: 700 } }, it.title),
          h('div', { style: { fontSize: '12px', color: 'var(--ink-3)', marginTop: '5px', lineHeight: 1.55 } }, it.text)
        ))
      )
    ),

    gallery: (s) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('div.site-preview__grid',
        visibleItems(s).map((it) => h('div',
          h('div', {
            style: {
              height: '120px', borderRadius: '12px', background: 'var(--surface-2)',
              border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--muted-2)'
            }
          }, icon('image', { size: 26 })),
          h('div', { style: { fontSize: '11.5px', color: 'var(--muted)', marginTop: '6px', textAlign: 'center' } },
            it.title)
        ))
      )
    ),

    contact: (s, accent) => h('div.site-preview__section',
      h('h2.site-preview__h2', fieldOf(s, 'title')),
      h('p.site-preview__body', { style: { textAlign: 'center' } }, fieldOf(s, 'body')),
      h('div.site-preview__grid', { style: { marginTop: '18px' } },
        h('div.site-preview__card',
          h('div.row', { style: { gap: '9px', marginBottom: '10px' } },
            icon('location_on', { size: 18, color: accent }),
            h('span', { style: { fontSize: '12.5px' } }, fieldOf(s, 'address'))
          ),
          h('div.row', { style: { gap: '9px', marginBottom: '10px' } },
            icon('call', { size: 18, color: accent }),
            h('span', { style: { fontSize: '12.5px' } }, fieldOf(s, 'phone'))
          ),
          h('div.row', { style: { gap: '9px' } },
            icon('mail', { size: 18, color: accent }),
            h('span', { style: { fontSize: '12.5px' } }, fieldOf(s, 'email'))
          )
        ),
        h('div.site-preview__card',
          h('div', { style: { fontSize: '12px', whiteSpace: 'pre-line', color: 'var(--ink-2)', lineHeight: 1.7 } },
            fieldOf(s, 'hours'))
        ),
        fieldOf(s, 'form') === true && h('div.site-preview__card',
          h('div', { style: { fontSize: '12.5px', fontWeight: 700, marginBottom: '9px' } }, 'Request a visit'),
          h('div.stack', { style: { gap: '8px' } },
            h('div', { style: { height: '34px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--line)' } }),
            h('div', { style: { height: '34px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--line)' } }),
            h('div', { style: { height: '34px', borderRadius: '8px', background: accent } })
          )
        )
      )
    ),

    footer: (s) => h('div.site-preview__footer',
      h('span', fieldOf(s, 'note')),
      spacer(),
      visibleItems(s).map((it) => h('span', { style: { fontWeight: 600 } }, it.title))
    )
  };

  /* --------------------------------------------------------------------------
     Preview
     -------------------------------------------------------------------------- */
  function sitePreview() {
    if (!state.previewOpen) return null;

    const brand = state.site.find((s) => s.id === 'brand');
    const accent = fieldOf(brand, 'accent') || '#0e7a70';
    const siteName = fieldOf(brand, 'name') || CLINIC.name;

    const device = DEVICES.find(([id]) => id === state.siteDevice) || DEVICES[0];
    const width = device[2];

    return h('div.fullscreen',
      h('div.fullscreen__bar',
        h('div.row', { style: { gap: '9px', minWidth: 0 } },
          h('div', {
            style: {
              width: '26px', height: '26px', borderRadius: '8px', background: accent,
              color: '#fff', display: 'grid', placeItems: 'center', flex: 'none'
            }
          }, icon('dentistry', { size: 16, fill: true })),
          h('span.truncate', { style: { fontSize: '13px', fontWeight: 800 } }, siteName)
        ),

        spacer(),

        h('div.devices',
          DEVICES.map(([id, ic]) => h(`button.devices__btn${state.siteDevice === id ? '.is-active' : ''}`, {
            type: 'button',
            title: id,
            onclick: () => setState({ siteDevice: id })
          }, icon(ic, { size: 17 })))
        ),

        h('button.btn.btn-outline', { type: 'button', onclick: closePreview },
          icon('close', { size: 17 }), 'Close preview')
      ),

      h('div.fullscreen__stage',
        h('div.fullscreen__frame', { style: { width, maxWidth: '100%' } },
          h('div.site-preview',
            state.site
              .filter((s) => s.visible && RENDERERS[s.id])
              .map((s) => RENDERERS[s.id](s, accent))
          )
        )
      )
    );
  }

  Ivora.define('components/site-preview', { openPreview: openPreview, closePreview: closePreview, sitePreview: sitePreview });
})();
