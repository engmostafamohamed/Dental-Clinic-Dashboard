/**
 * sidebar.js — Primary navigation.
 *
 * Below 1024px the aside becomes an overlay drawer; `state.navOpen` drives
 * the `.is-open` class and the scrim.
 *
 * @module components/sidebar
 */
(function () {
  'use strict';

  var { h, icon } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { go, navPageOf } = Ivora.require('core/router');
  var { NAV, CLINIC } = Ivora.require('data/index');

  /** Viewport width below which the sidebar overlays the content. */
  const OVERLAY_BREAKPOINT = 1024;

  const isOverlay = () => state.vw <= OVERLAY_BREAKPOINT;

  const closeNav = () => setState({ navOpen: false });
  const openNav = () => setState({ navOpen: true });

  /**
   * The scrim shown behind the drawer. Returns null when not needed.
   *
   * `.is-entering` is applied only on the render that opens it — a re-render
   * while the drawer is already open would otherwise restart the fade.
   */
  let scrimShown = false;

  function navScrim() {
    if (!isOverlay() || !state.navOpen) {
      scrimShown = false;
      return null;
    }
    const el = h('div.app-scrim', { onclick: closeNav });
    if (!scrimShown) el.classList.add('is-entering');
    scrimShown = true;
    return el;
  }

  function sidebar() {
    const active = navPageOf(state.page);
    const overlay = isOverlay();

    return h(`aside.app-aside${overlay && state.navOpen ? '.is-open' : ''}`,
      // Brand
      h('div.aside-brand',
        h('div.aside-brand__mark', icon('dentistry', { fill: true, size: 19 })),
        h('span.aside-brand__name', 'Ivora'),
        overlay && h('button.aside-brand__close', { onclick: closeNav, type: 'button', title: 'Close menu' },
          icon('close', { size: 17 })
        )
      ),

      // Clinic switcher
      h('button.aside-clinic', { type: 'button' },
        h('div.aside-clinic__mark', icon('domain', { size: 17 })),
        h('div', { style: { minWidth: 0, flex: '1' } },
          h('div.aside-clinic__name.truncate', CLINIC.name),
          h('div.aside-clinic__addr.truncate', CLINIC.address)
        ),
        icon('unfold_more', { size: 16, color: 'var(--muted-2)' })
      ),

      // Nav list
      h('nav.aside-nav', NAV.map((item, i) => {
        if (item.group) return h('div.nav-group', { key: `g${i}` }, item.group);
        if (item.rule) return h('div.nav-rule', { key: `r${i}` });

        const on = active === item.id;
        return h(`button.nav-item${on ? '.is-active' : ''}`, {
          onclick: () => go(item.id),
          type: 'button',
          'aria-current': on ? 'page' : undefined
        },
          icon(item.icon, { size: 19, fill: on }),
          item.label
        );
      }))
    );
  }

  Ivora.define('components/sidebar', {
    isOverlay: isOverlay,
    closeNav: closeNav,
    openNav: openNav,
    navScrim: navScrim,
    sidebar: sidebar
  });
})();
