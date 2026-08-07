/**
 * app.js — Application entry point.
 *
 * Wires the store to the DOM: one subscriber renders the whole shell on any
 * state change. Rendering is cheap because each page builds plain elements
 * and the browser only reflows what actually changed under the content root.
 *
 * @module app
 */
(function () {
  'use strict';

  var { h, mount, $ } = Ivora.require('core/dom');
  var { state, setState, subscribe, schedule } = Ivora.require('core/store');
  var { startRouter } = Ivora.require('core/router');
  var { restorePreferences, syncDocument } = Ivora.require('core/theme');

  var { sidebar, navScrim, closeNav } = Ivora.require('components/sidebar');
  var { header } = Ivora.require('components/header');
  var { searchPanel } = Ivora.require('components/search');
  var { renderOverlays } = Ivora.require('components/overlays');
  var { translateTree } = Ivora.require('core/i18n');

  var { pageFor } = Ivora.require('pages/index');

  /** Where the shell renders. */
  const root = document.getElementById('app');

  /** Build the entire UI tree for the current state. */
  function view() {
    return h('div.app',
      navScrim(),
      sidebar(),
      h('div.app-main',
        header(),
        h('main.app-content',
          searchPanel(),
          pageFor(state.page)
        )
      ),
      renderOverlays()
    );
  }

  /* ------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------
     A render replaces the DOM wholesale, which is simple and fast enough —
     but it destroys three pieces of transient browser state that belong to
     the user, not the app: scroll offsets, keyboard focus, and the text
     caret. Without restoring them, typing in any field would drop focus
     after a single character.

     Focus is re-found by structural path (the chain of child indices from
     the root) rather than by id, so no component has to opt in. A keystroke
     leaves the tree shape unchanged, so the path still resolves; the
     restore is guarded by tag and type so that if the shape *did* change we
     leave focus alone rather than moving it somewhere surprising.
     ------------------------------------------------------------------------ */

  /** Containers whose scroll position should survive a render. */
  const SCROLLABLE = ['.app-content', '.modal__body', '.drawer__body', '.rail__body', '.aside-nav'];

  /** Index path from `root` down to `el`, or null if it isn't inside. */
  function pathTo(el) {
    const path = [];
    let node = el;
    while (node && node !== root) {
      const parent = node.parentNode;
      if (!parent) return null;
      path.unshift(Array.prototype.indexOf.call(parent.childNodes, node));
      node = parent;
    }
    return node === root ? path : null;
  }

  /** Walk an index path back down from `root`. */
  function nodeAt(path) {
    let node = root;
    for (const i of path) {
      if (!node || !node.childNodes[i]) return null;
      node = node.childNodes[i];
    }
    return node;
  }

  /** Capture what the user is currently doing, so the render can hand it back. */
  function captureUiState() {
    const scroll = SCROLLABLE
      .map((sel) => {
        const el = $(sel);
        return el && el.scrollTop ? { sel, top: el.scrollTop } : null;
      })
      .filter(Boolean);

    const active = document.activeElement;
    const focusable = active && active !== document.body && root.contains(active);
    if (!focusable) return { scroll, focus: null };

    // Selection offsets only exist on text-like inputs.
    let selection = null;
    try {
      if (typeof active.selectionStart === 'number') {
        selection = { start: active.selectionStart, end: active.selectionEnd };
      }
    } catch {
      /* selectionStart throws on inputs that don't support it (e.g. number) */
    }

    return {
      scroll,
      focus: {
        path: pathTo(active),
        tag: active.tagName,
        type: active.getAttribute('type'),
        selection
      }
    };
  }

  /** Put scroll, focus and caret back after the tree has been rebuilt. */
  function restoreUiState(ui) {
    for (const { sel, top } of ui.scroll) {
      const el = $(sel);
      if (el) el.scrollTop = top;
    }

    if (!ui.focus || !ui.focus.path) return;

    const el = nodeAt(ui.focus.path);
    if (!el || el.nodeType !== 1) return;

    // Only restore if the same kind of control landed in the same place.
    if (el.tagName !== ui.focus.tag) return;
    if (el.getAttribute('type') !== ui.focus.type) return;
    if (typeof el.focus !== 'function') return;

    el.focus({ preventScroll: true });

    if (ui.focus.selection && typeof el.setSelectionRange === 'function') {
      try {
        el.setSelectionRange(ui.focus.selection.start, ui.focus.selection.end);
      } catch {
        /* control doesn't support selection ranges — focus alone is enough */
      }
    }
  }

  function render() {
    const ui = captureUiState();
    syncDocument();
    mount(root, view());

    // Translate the finished tree rather than every call site. See the note
    // at the top of core/i18n.js for why this runs post-render.
    if (state.lang === 'ar') translateTree(root);

    restoreUiState(ui);
  }

  /** A new page starts at the top, rather than inheriting the last one's offset. */
  function resetScroll() {
    const well = $('.app-content');
    if (well) well.scrollTop = 0;
  }

  function bindGlobalEvents() {
    // Escape closes whatever is topmost.
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (state.previewOpen) return setState({ previewOpen: false });
      if (state.modal) return setState({ modal: null });
      if (state.billOpen) return setState({ billOpen: false, bill: null });
      if (state.resv) return setState({ resv: null, panel: null });
      if (state.navOpen) return closeNav();
    });

    // The sidebar switches between docked and overlay at a width breakpoint,
    // so width is part of state rather than a pure CSS concern.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setState({ vw: window.innerWidth }), 100);
    });

    // Swallow drops that no component claimed.
    //
    // The browser's default action for an unhandled drop is to navigate to the
    // dragged payload. Releasing an appointment card over the sidebar, the
    // header, or an unavailable slot would therefore try to load a URL — and
    // on file:// that fails noisily with "Unsafe attempt to load URL …
    // 'file:' URLs are treated as unique security origins". It also means a
    // file dragged into the window would replace the app.
    //
    // A cell that accepts the drop has already called preventDefault, so
    // `defaultPrevented` distinguishes "handled" from "stray" and lets the
    // real drop targets keep their own cursor.
    document.addEventListener('dragover', (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
    });

    document.addEventListener('drop', (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
    });
  }

  function start() {
    restorePreferences();
    bindGlobalEvents();
    subscribe(render);
    startRouter(resetScroll);
    schedule();
  }

  start();

  Ivora.define('app', {});
})();
