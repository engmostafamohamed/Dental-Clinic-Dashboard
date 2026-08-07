/**
 * index.js — Data barrel.
 *
 * Every module imports demo data from here rather than reaching into
 * individual files, so swapping the static fixtures for a real API means
 * changing this one module.
 *
 * @module data
 */
(function () {
  'use strict';



  Ivora.define('data/index', Object.assign({}, Ivora.require('data/clinic'), Ivora.require('data/patients'), Ivora.require('data/treatments'), Ivora.require('data/finance'), Ivora.require('data/inventory'), Ivora.require('data/website'), Ivora.require('data/analytics'), Ivora.require('data/support')));
})();
