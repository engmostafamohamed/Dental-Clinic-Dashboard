/**
 * header.js — Top bar: title, global search, language, theme, user.
 * @module components/header
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { TITLES } = Ivora.require('core/router');
  var { toggleTheme, setLanguage } = Ivora.require('core/theme');
  var { openNav, isOverlay } = Ivora.require('components/sidebar');
  var { go } = Ivora.require('core/router');
  var { user, signOut } = Ivora.require('core/session');

  /** UK flag, drawn inline so the control needs no image assets. */
  const flagEn = () => h('svg.lang-switch__flag', { viewBox: '0 0 60 30' },
    h('rect', { width: 60, height: 30, fill: '#012169' }),
    h('path', { d: 'M0,0 L60,30 M60,0 L0,30', stroke: '#fff', 'stroke-width': 6 }),
    h('path', { d: 'M0,0 L60,30 M60,0 L0,30', stroke: '#C8102E', 'stroke-width': 4 }),
    h('path', { d: 'M30,0 V30 M0,15 H60', stroke: '#fff', 'stroke-width': 10 }),
    h('path', { d: 'M30,0 V30 M0,15 H60', stroke: '#C8102E', 'stroke-width': 6 })
  );

  /** Saudi flag, simplified to a green field with script-suggesting bars. */
  const flagAr = () => h('svg.lang-switch__flag', { viewBox: '0 0 60 40' },
    h('rect', { width: 60, height: 40, fill: '#165d31' }),
    h('rect', { x: 10, y: 26, width: 40, height: 2.6, rx: 1.3, fill: '#fff' }),
    h('rect', { x: 12, y: 13, width: 36, height: 2.2, rx: 1.1, fill: '#fff' }),
    h('rect', { x: 16, y: 18, width: 28, height: 2.2, rx: 1.1, fill: '#fff' })
  );

  function languageSwitch() {
    const en = state.lang === 'en';
    // The letters sit in their own span so narrow screens can drop them and
    // keep just the flags, which carry the same meaning in far less width.
    return h('div.lang-switch',
      h(`button.lang-switch__btn${en ? '.is-active' : ''}`, {
        onclick: () => setLanguage('en'), type: 'button', title: 'English — left to right'
      }, flagEn(), h('span.lang-switch__label', 'EN')),
      h(`button.lang-switch__btn${!en ? '.is-active' : ''}`, {
        onclick: () => setLanguage('ar'), type: 'button', title: 'العربية — من اليمين إلى اليسار'
      }, flagAr(), h('span.lang-switch__label', 'AR'))
    );
  }

  function header() {
    const dark = state.theme === 'dark';

    return h('header.app-header',
      isOverlay() && h('button.header-burger', { onclick: openNav, type: 'button', title: 'Open menu' },
        icon('menu', { size: 20 })
      ),

      h('h1.header-title', TITLES[state.page] || 'Dashboard'),

      // Global search
      h('div.header-search',
        h('div.header-search__box',
          icon('search', { cls: 'header-search__icon' }),
          h('input.header-search__input', {
            value: state.gq,
            placeholder: 'Search patients, doctors, treatments, stock...',
            'aria-label': 'Global search',
            oninput: (e) => setState({ gq: e.target.value })
          }),
          state.gq && h('button.header-search__clear', {
            onclick: () => setState({ gq: '' }), type: 'button', title: 'Clear search'
          }, icon('close', { size: 15 }))
        )
      ),

      h('button.header-add', { type: 'button', title: 'New' }, icon('add', { size: 20 })),

      languageSwitch(),

      h('button.header-icon-btn', {
        onclick: toggleTheme, type: 'button',
        title: dark ? 'Switch to light theme' : 'Switch to dark theme'
      }, icon(dark ? 'light_mode' : 'dark_mode', { size: 19 })),

      h('button.header-icon-btn.header-icon-btn--ghost', { type: 'button', title: 'Notifications' },
        icon('notifications')
      ),

      h('div.header-divider'),

      userMenu()
    );
  }

  /* ------------------------------------------------------------------------
     Account menu
     ------------------------------------------------------------------------ */

  /**
   * The user chip plus its dropdown.
   *
   * An invisible full-screen button sits behind the open menu to catch the
   * next click anywhere else — the same close-on-outside-click pattern the
   * navigation drawer uses, and more reliable here than a document listener
   * that a re-render would have to keep re-attaching.
   */
  function userMenu() {
    const open = state.userMenuOpen;

    const item = (label, iconName, onClick, opts = {}) =>
      h(`button.menu__item${opts.danger ? '.menu__item--danger' : ''}`, {
        type: 'button',
        onclick: () => { setState({ userMenuOpen: false }); onClick(); }
      }, icon(iconName, { size: 18 }), label);

    return h('div.header-user-wrap',
      open && h('button.menu__catcher', {
        type: 'button',
        'aria-label': 'Close menu',
        onclick: () => setState({ userMenuOpen: false })
      }),

      h('button.header-user', {
        type: 'button',
        'aria-haspopup': 'menu',
        'aria-expanded': open ? 'true' : 'false',
        onclick: () => setState({ userMenuOpen: !open })
      },
        h('div.header-user__avatar', user.initials),
        !isOverlay() && h('div.header-user__text', { style: { lineHeight: 1.25 } },
          h('div.header-user__name', user.name),
          h('div.header-user__role', user.role)
        ),
        icon(open ? 'expand_less' : 'expand_more', { size: 18, color: 'var(--muted-2)' })
      ),

      open && h('div.menu', { role: 'menu' },
        h('div.menu__head',
          h('div.avatar.avatar--md', { style: { background: 'var(--brand)' } }, user.initials),
          h('div', { style: { minWidth: 0 } },
            h('div.menu__name.truncate', user.name),
            h('div.menu__mail.truncate', user.email)
          )
        ),
        h('div.menu__group',
          item('My profile', 'account_circle', () => go('profile')),
          item('Change password', 'lock_reset', () => go('profile', { profileTab: 'security' }))
        ),
        h('div.menu__rule'),
        h('div.menu__group',
          item('Sign out', 'logout', signOut, { danger: true })
        )
      )
    );
  }

  Ivora.define('components/header', { header: header });
})();
