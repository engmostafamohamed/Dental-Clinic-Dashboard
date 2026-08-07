/**
 * theme.js — Colour scheme and text direction.
 *
 * Both are attributes on <html>: `data-theme` drives the token overrides in
 * tokens.css, `dir`/`lang` drive the RTL layout. Preferences persist via the
 * store's localStorage helpers.
 *
 * @module core/theme
 */
(function () {
  'use strict';

  var { state, setState, loadPrefs, savePrefs } = Ivora.require('core/store');

  /** Apply the current theme/language to the document element. */
  function syncDocument() {
    const root = document.documentElement;
    const dir = state.lang === 'ar' ? 'rtl' : 'ltr';

    if (root.getAttribute('data-theme') !== state.theme) {
      root.setAttribute('data-theme', state.theme);
    }
    if (root.getAttribute('lang') !== state.lang) {
      root.setAttribute('lang', state.lang);
    }
    if (root.getAttribute('dir') !== dir) {
      root.setAttribute('dir', dir);
    }

    // Only the theme persists; see restorePreferences().
    savePrefs({ theme: state.theme });
  }

  /**
   * Resolve the startup theme: a saved preference wins, otherwise follow the
   * operating system.
   */
  function restorePreferences() {
    const saved = loadPrefs();
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    setState({
      theme: saved.theme || (prefersDark ? 'dark' : 'light'),
      // Language deliberately does NOT come from storage. English/LTR is the
      // default on every load; Arabic is an explicit per-session choice made
      // from the header. Theme still persists — that is a device preference,
      // whereas a stuck RTL layout is disorienting to come back to.
      lang: 'en'
    });
    syncDocument();
  }

  function toggleTheme() {
    setState({ theme: state.theme === 'dark' ? 'light' : 'dark' });
  }

  function setLanguage(lang) {
    setState({ lang });
  }

  const isDark = () => state.theme === 'dark';
  const isRtl = () => state.lang === 'ar';

  Ivora.define('core/theme', {
    syncDocument: syncDocument,
    restorePreferences: restorePreferences,
    toggleTheme: toggleTheme,
    setLanguage: setLanguage,
    isDark: isDark,
    isRtl: isRtl
  });
})();
