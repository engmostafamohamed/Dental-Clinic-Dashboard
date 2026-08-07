/**
 * ivora.js — Tiny module registry.
 *
 * The application is split across ~50 plain <script> files. This gives them a
 * way to share code without leaking names onto `window`: each file wraps its
 * body in an IIFE, pulls in what it needs with `Ivora.require(...)`, and
 * publishes what it offers with `Ivora.define(...)`.
 *
 * That keeps every file in its own scope, which matters — several modules
 * legitimately declare the same local names (`COLS`, `HEAD`, `label`,
 * `save`…), and at shared global scope those would be fatal redeclarations.
 *
 * There is no lazy loading and no dependency resolution: scripts run in the
 * order the HTML lists them, which is dependency-first. If that order is ever
 * wrong, `require` throws immediately with the name of the missing module
 * rather than failing later with a confusing `undefined`.
 *
 * MUST be the first script on the page.
 */
window.Ivora = (function () {
  'use strict';

  var registry = {};

  return {
    /**
     * Publish a module's public surface.
     * @param {string} id       Path without extension, e.g. 'core/format'.
     * @param {object} exports
     */
    define: function (id, exports) {
      registry[id] = exports;
    },

    /**
     * Retrieve a previously defined module.
     * @param {string} id
     * @returns {object}
     */
    require: function (id) {
      var mod = registry[id];
      if (!mod) {
        throw new Error(
          'Ivora: module "' + id + '" is not loaded yet.\n' +
          'Add <script src="js/' + id + '.js"></script> to the page, ' +
          'and make sure it comes before the file that needs it.'
        );
      }
      return mod;
    },

    /** Module ids currently loaded — handy when debugging in the console. */
    loaded: function () {
      return Object.keys(registry).sort();
    }
  };
})();
