/**
 * session.js — The signed-in user, and signing out.
 *
 * There is no real authentication in this build, so "the session" is the
 * demo user plus whatever the profile screen has edited. Keeping it behind
 * this module means the header, the profile page and the auth screens all
 * read the account from one place — and swapping in a real session later is
 * a change to this file alone.
 *
 * @module core/session
 */
(function () {
  'use strict';

  var { CLINIC } = Ivora.require('data/index');

  /**
   * Live copy of the account. Edits from the profile screen land here so the
   * header reflects them immediately.
   */
  const user = { ...CLINIC.user };

  /** Merge changes into the account and refresh derived fields. */
  function updateUser(patch) {
    Object.assign(user, patch);
    if (patch.name) {
      user.initials = String(patch.name)
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
  }

  /**
   * Resolve a path to a file in pages/ from wherever we currently are.
   *
   * The app runs from two depths — `index.html` at the root and the files in
   * `pages/` — so a hard-coded relative link would break on one of them.
   */
  function pagePath(file) {
    const inPages = /[/\\]pages[/\\][^/\\]*$/.test(location.pathname);
    return (inPages ? '' : 'pages/') + file;
  }

  /** Path back to the dashboard, from either depth. */
  function dashboardPath() {
    const inPages = /[/\\]pages[/\\][^/\\]*$/.test(location.pathname);
    return inPages ? '../index.html' : 'index.html';
  }

  /**
   * Sign out and return to the login screen.
   *
   * Theme and language are intentionally left in localStorage: they are
   * device preferences, not credentials, and clearing them would make the
   * login page flash back to light mode for a dark-mode user.
   */
  function signOut() {
    location.href = pagePath('login.html');
  }

  Ivora.define('core/session', {
    user: user,
    updateUser: updateUser,
    signOut: signOut,
    pagePath: pagePath,
    dashboardPath: dashboardPath
  });
})();
