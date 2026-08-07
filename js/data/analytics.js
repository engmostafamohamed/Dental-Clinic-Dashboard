/**
 * analytics.js — Marketing-site traffic data.
 * @module data/analytics
 */
(function () {
  'use strict';

  const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

  /** Scale factor applied to the 7-day baseline for headline totals. */
  const RANGE_MULTIPLIER = {
    'Last 7 days': 1,
    'Last 30 days': 4.1,
    'Last 90 days': 11.6
  };

  /** Visit trend per range: [label, visits]. */
  const TREND = {
    'Last 7 days':  [['Mon', 268], ['Tue', 312], ['Wed', 295], ['Thu', 341], ['Fri', 386], ['Sat', 214], ['Sun', 178]],
    'Last 30 days': [['W1', 1840], ['W2', 2015], ['W3', 1962], ['W4', 2211]],
    'Last 90 days': [['May', 6420], ['Jun', 7185], ['Jul', 8043], ['Aug', 2260]]
  };

  const PAGES = [
    { path: '/',                       name: 'Home',             views: 2214, uniq: 1698, time: '1m 48s', exit: 34 },
    { path: '/services',               name: 'Services',         views: 1486, uniq: 1122, time: '2m 12s', exit: 28 },
    { path: '/book',                   name: 'Book a visit',     views: 968,  uniq: 842,  time: '3m 04s', exit: 19 },
    { path: '/team',                   name: 'Meet the team',    views: 742,  uniq: 611,  time: '1m 32s', exit: 41 },
    { path: '/services/whitening',     name: 'Teeth whitening',  views: 536,  uniq: 458,  time: '2m 41s', exit: 31 },
    { path: '/faq',                    name: 'FAQ',              views: 421,  uniq: 366,  time: '1m 19s', exit: 52 },
    { path: '/services/orthodontics',  name: 'Orthodontics',     views: 318,  uniq: 284,  time: '2m 55s', exit: 26 },
    { path: '/contact',                name: 'Contact',          views: 264,  uniq: 231,  time: '0m 58s', exit: 47 }
  ];

  /** `flag` is a representative flag colour, drawn as a small swatch. */
  const COUNTRIES = [
    { name: 'United States',        flag: '#3c3b6e', visitors: 3184, forms: 61, wa: 88 },
    { name: 'Saudi Arabia',         flag: '#165d31', visitors: 862,  forms: 22, wa: 74 },
    { name: 'United Kingdom',       flag: '#012169', visitors: 411,  forms: 9,  wa: 12 },
    { name: 'Canada',               flag: '#c0362c', visitors: 268,  forms: 6,  wa: 9 },
    { name: 'United Arab Emirates', flag: '#0e7a70', visitors: 184,  forms: 4,  wa: 17 },
    { name: 'Germany',              flag: '#e0a43a', visitors: 96,   forms: 1,  wa: 2 }
  ];

  const CITIES = [
    { name: 'Portland',  country: 'United States',        visitors: 1842, forms: 44, wa: 52 },
    { name: 'Seattle',   country: 'United States',        visitors: 604,  forms: 9,  wa: 14 },
    { name: 'Riyadh',    country: 'Saudi Arabia',         visitors: 488,  forms: 13, wa: 41 },
    { name: 'Jeddah',    country: 'Saudi Arabia',         visitors: 264,  forms: 7,  wa: 24 },
    { name: 'Vancouver', country: 'United States',        visitors: 231,  forms: 5,  wa: 8 },
    { name: 'London',    country: 'United Kingdom',       visitors: 208,  forms: 5,  wa: 6 },
    { name: 'Dubai',     country: 'United Arab Emirates', visitors: 147,  forms: 3,  wa: 14 },
    { name: 'Toronto',   country: 'Canada',               visitors: 132,  forms: 3,  wa: 5 }
  ];

  /** Tracked call-to-action clicks. */
  const BUTTONS = [
    { label: 'WhatsApp — floating bubble',  page: 'All pages', icon: 'chat',                    clicks: 121, tone: 'ok' },
    { label: 'WhatsApp — hero button',      page: '/',         icon: 'chat',                    clicks: 48,  tone: 'ok' },
    { label: 'WhatsApp — contact section',  page: '/contact',  icon: 'chat',                    clicks: 33,  tone: 'ok' },
    { label: 'Booking form submit',         page: '/book',     icon: 'assignment_turned_in',    clicks: 71,  tone: 'brand' },
    { label: 'Booking form submit',         page: '/contact',  icon: 'assignment_turned_in',    clicks: 32,  tone: 'brand' },
    { label: 'Call (503) 555-0142',         page: 'All pages', icon: 'call',                    clicks: 58,  tone: 'info' }
  ];

  /** Live visitor feed. */
  const VISITORS = [
    { when: '14:32', city: 'Portland',  country: 'United States',        device: 'smartphone', pages: ['/', '/services', '/book'],                          action: 'form',     dur: '4m 12s' },
    { when: '14:19', city: 'Riyadh',    country: 'Saudi Arabia',         device: 'smartphone', pages: ['/', '/services/whitening'],                         action: 'whatsapp', dur: '2m 48s' },
    { when: '13:57', city: 'Seattle',   country: 'United States',        device: 'computer',   pages: ['/', '/team', '/faq'],                               action: 'none',     dur: '3m 05s' },
    { when: '13:41', city: 'Jeddah',    country: 'Saudi Arabia',         device: 'smartphone', pages: ['/', '/contact'],                                    action: 'whatsapp', dur: '1m 36s' },
    { when: '13:22', city: 'London',    country: 'United Kingdom',       device: 'tablet_mac', pages: ['/', '/services'],                                   action: 'none',     dur: '1m 02s' },
    { when: '12:58', city: 'Portland',  country: 'United States',        device: 'computer',   pages: ['/', '/services', '/services/orthodontics', '/book'], action: 'form',    dur: '6m 21s' },
    { when: '12:44', city: 'Dubai',     country: 'United Arab Emirates', device: 'smartphone', pages: ['/'],                                                action: 'call',     dur: '0m 34s' },
    { when: '12:11', city: 'Toronto',   country: 'Canada',               device: 'computer',   pages: ['/', '/faq'],                                        action: 'none',     dur: '1m 48s' }
  ];

  /** Visitor outcome → label, icon and colours. */
  const ACTIONS = {
    form:     { label: 'Submitted form', icon: 'assignment_turned_in', ink: 'var(--brand)', bg: 'var(--brand-soft)' },
    whatsapp: { label: 'WhatsApp',       icon: 'chat',                 ink: 'var(--ok)',    bg: 'var(--ok-soft)' },
    call:     { label: 'Called',         icon: 'call',                 ink: 'var(--info)',  bg: 'var(--info-soft)' },
    none:     { label: 'Browsed only',   icon: 'remove',               ink: 'var(--muted)', bg: 'var(--surface-2)' }
  };

  /** Tone key → CSS custom property, for the button-click list. */
  const TONE_VARS = {
    ok: 'var(--ok)',
    brand: 'var(--brand)',
    info: 'var(--info)'
  };

  Ivora.define('data/analytics', {
    RANGES: RANGES,
    RANGE_MULTIPLIER: RANGE_MULTIPLIER,
    TREND: TREND,
    PAGES: PAGES,
    COUNTRIES: COUNTRIES,
    CITIES: CITIES,
    BUTTONS: BUTTONS,
    VISITORS: VISITORS,
    ACTIONS: ACTIONS,
    TONE_VARS: TONE_VARS
  });
})();
