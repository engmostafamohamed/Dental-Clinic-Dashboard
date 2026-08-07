/**
 * finance.js — Accounts, billing, purchases and the dashboard chart series.
 * @module data/finance
 */
(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Accounts
     -------------------------------------------------------------------------- */
  const ACCOUNTS = [
    { label: 'FREE CASH',      amount: '$4,012,409', icon: 'account_balance_wallet', tint: 'var(--brand)',  note: 'General operating cash for day-to-day needs' },
    { label: 'DRUG PURCHASE',  amount: '$4,120,130', icon: 'medication',             tint: 'var(--info)',   note: 'No rek. 124 1245 3567 0987' },
    { label: 'TREATMENT FUND', amount: '$3,341,700', icon: 'dentistry',              tint: 'var(--purple)', note: 'Reserved for chairside treatment costs' },
    { label: 'STOCK FUND',     amount: '$2,139,209', icon: 'inventory_2',            tint: 'var(--warn)',   note: 'Restocking consumables and materials' }
  ];

  const INACTIVE_ACCOUNTS = [
    { label: 'MONTHLY RENT',    amount: '$6,123,434', icon: 'home_work', note: '009 2345 2224 3446' },
    { label: 'EQUIPMENT LEASE', amount: '$3,246,245', icon: 'chair',     note: '004 3345 2234 5678' },
    { label: 'STAFF TRAINING',  amount: '$5,234,234', icon: 'school',    note: '004 3334 5556 2344' }
  ];

  /* --------------------------------------------------------------------------
     Sales / billing
     -------------------------------------------------------------------------- */
  const BILLS = [
    { id: '#RSV-0148', name: 'Marguerite Okonkwo', bills: '0/2', date: '24/07/2026', total: '$2,311.00', status: 'partial', isNew: true,
      lines: [{ id: '#1251', forWhat: 'Booking Fee', amount: '$100.00', state: 'unpaid' }, { id: '#1252', forWhat: '3 Treatment(s)', amount: '$2,211.00', state: 'pay' }] },
    { id: '#RSV-0147', name: 'Tobias Lindqvist',   bills: '0/2', date: '23/07/2026', total: '$535.00',   status: 'partial',
      lines: [{ id: '#1244', forWhat: 'Booking Fee', amount: '$100.00', state: 'unpaid' }, { id: '#1243', forWhat: '2 Treatment(s)', amount: '$435.00', state: 'pay' }] },
    { id: '#RSV-0146', name: 'Priya Raghunathan',  bills: '2/2', date: '19/07/2026', total: '$645.00',   status: 'paid',
      lines: [{ id: '#1241', forWhat: 'Booking Fee', amount: '$100.00', state: 'done' }, { id: '#1242', forWhat: '2 Treatment(s)', amount: '$545.00', state: 'done' }] },
    { id: '#RSV-0145', name: 'Desmond Achebe',     bills: '2/2', date: '19/07/2026', total: '$667.00',   status: 'paid',
      lines: [{ id: '#1240', forWhat: '1 Treatment(s)', amount: '$567.00', state: 'done' }] },
    { id: '#RSV-0144', name: 'Hannah Brightwater', bills: '1/2', date: '18/07/2026', total: '$343.00',   status: 'partial',
      lines: [{ id: '#1237', forWhat: 'Booking Fee', amount: '$100.00', state: 'done' }, { id: '#1238', forWhat: '1 Treatment(s)', amount: '$243.00', state: 'pay' }] },
    { id: '#RSV-0143', name: 'Yusuf Demirel',      bills: '2/2', date: '18/07/2026', total: '$900.00',   status: 'paid',
      lines: [{ id: '#1236', forWhat: '4 Treatment(s)', amount: '$750.00', state: 'done' }] },
    { id: '#RSV-0142', name: 'Clara Nightingale',  bills: '1/2', date: '17/07/2026', total: '$650.00',   status: 'unpaid',
      lines: [{ id: '#1234', forWhat: '2 Treatment(s)', amount: '$550.00', state: 'pay' }] },
    { id: '#RSV-0141', name: 'Emeka Balogun',      bills: '2/2', date: '16/07/2026', total: '$1,200.00', status: 'paid',
      lines: [{ id: '#1232', forWhat: '5 Treatment(s)', amount: '$1,000.00', state: 'done' }] }
  ];

  /** Accounts a payment can be credited to, shown inside the bill drawer. */
  const BILL_ACCOUNTS = [
    { name: 'Free cash',      icon: 'account_balance_wallet', tint: 'var(--brand)' },
    { name: 'Drug purchase',  icon: 'medication',             tint: 'var(--info)' },
    { name: 'Treatment fund', icon: 'dentistry',              tint: 'var(--purple)' },
    { name: 'Stock fund',     icon: 'inventory_2',            tint: 'var(--warn)' }
  ];

  const BILL_METHODS = [
    { name: 'Cash',            icon: 'payments' },
    { name: 'Credit card',     icon: 'credit_card' },
    { name: 'Debit card',      icon: 'contactless' },
    { name: 'Bank transfer',   icon: 'account_balance' },
    { name: 'Insurance claim', icon: 'health_and_safety' },
    { name: 'E-wallet',        icon: 'account_balance_wallet' }
  ];

  /** Payment methods page — the same methods plus commercial terms. */
  const PAY_METHODS = [
    { name: 'Cash',            icon: 'payments',          detail: 'Counted at end of shift',        fee: '0%',            used: '$41,200' },
    { name: 'Credit card',     icon: 'credit_card',       detail: 'Visa, Mastercard, Amex',         fee: '2.4% + $0.30',  used: '$68,940' },
    { name: 'Debit card',      icon: 'contactless',       detail: 'Chip and contactless',           fee: '1.1%',          used: '$22,410' },
    { name: 'Bank transfer',   icon: 'account_balance',   detail: 'ACH, 1–2 business days',         fee: '$0.80 flat',    used: '$14,300' },
    { name: 'Insurance claim', icon: 'health_and_safety', detail: 'Direct billing to 6 providers',  fee: 'Varies',        used: '$31,880' },
    { name: 'E-wallet',        icon: 'account_balance_wallet', detail: 'Apple Pay, Google Pay',     fee: '2.0%',          used: '$9,650' }
  ];

  /* --------------------------------------------------------------------------
     Purchases
     -------------------------------------------------------------------------- */
  const PURCHASES = [
    { id: '#PO-2214', vendor: 'Dentalku',           category: 'Restorative materials',  date: '28 Jul 2026', amount: '$4,280.00', status: 'paid' },
    { id: '#PO-2213', vendor: 'Barone LLC',         category: 'Anaesthetics',           date: '24 Jul 2026', amount: '$1,940.00', status: 'paid' },
    { id: '#PO-2212', vendor: 'K24',                category: 'Hygiene consumables',    date: '21 Jul 2026', amount: '$860.00',   status: 'due' },
    { id: '#PO-2211', vendor: 'Abstergo Ltd.',      category: 'Sterilisation supplies', date: '18 Jul 2026', amount: '$2,310.00', status: 'paid' },
    { id: '#PO-2210', vendor: 'Binford Ltd.',       category: 'Equipment servicing',    date: '14 Jul 2026', amount: '$5,600.00', status: 'due' },
    { id: '#PO-2209', vendor: 'Acme Co.',           category: 'Office and admin',       date: '09 Jul 2026', amount: '$430.00',   status: 'paid' },
    { id: '#PO-2208', vendor: 'Dentalku',           category: 'Orthodontic components', date: '04 Jul 2026', amount: '$7,120.00', status: 'paid' },
    { id: '#PO-2207', vendor: 'Biffco Enterprises', category: 'Imaging supplies',       date: '01 Jul 2026', amount: '$1,265.00', status: 'due' }
  ];

  /* --------------------------------------------------------------------------
     Dashboard chart series
     -------------------------------------------------------------------------- */

  /** Twelve months of total cash, in thousands. */
  const CASHFLOW = [
    { m: 'AUG', v: 92 },  { m: 'SEP', v: 104 }, { m: 'OCT', v: 99 },  { m: 'NOV', v: 122 },
    { m: 'DEC', v: 114 }, { m: 'JAN', v: 148 }, { m: 'FEB', v: 136 }, { m: 'MAR', v: 154 },
    { m: 'APR', v: 145 }, { m: 'MAY', v: 168 }, { m: 'JUN', v: 161 }, { m: 'JUL', v: 182 }
  ];

  /** Income vs expense, in thousands. */
  const INCOME_EXPENSE = [
    { m: 'FEB', i: 19.4, e: 8.8 },  { m: 'MAR', i: 22.6, e: 10.1 }, { m: 'APR', i: 28.9, e: 12.4 },
    { m: 'MAY', i: 20.8, e: 7.6 },  { m: 'JUN', i: 24.3, e: 9.5 },  { m: 'JUL', i: 25.2, e: 12.8 }
  ];

  const EXPENSE_CATEGORIES = [
    { name: 'Utilities',   color: '#0e7a70' },
    { name: 'Payroll',     color: '#3a51a8' },
    { name: 'Consumables', color: '#8a4bb8' },
    { name: 'Rent',        color: '#e0a43a' },
    { name: 'Other',       color: '#c0362c' }
  ];

  /** Expense totals per category, keyed by the range picker's value. */
  const EXPENSES = {
    '3 mo':  [26400, 15200, 12900, 4800, 2900],
    '6 mo':  [59553, 34408, 29115, 10587, 6677],
    '12 mo': [112400, 68900, 55300, 21400, 13100]
  };

  /** New vs returning patients, keyed by the range picker's value. */
  const PATIENT_STATS = {
    'This month':   { n: 28,  r: 142 },
    'This quarter': { n: 74,  r: 388 },
    'This year':    { n: 263, r: 1140 }
  };

  /** How many trailing months each cashflow range shows. */
  const CASHFLOW_RANGES = {
    'Last 12 months': 12,
    'Last 6 months': 6,
    'Last 3 months': 3
  };

  Ivora.define('data/finance', {
    ACCOUNTS: ACCOUNTS,
    INACTIVE_ACCOUNTS: INACTIVE_ACCOUNTS,
    BILLS: BILLS,
    BILL_ACCOUNTS: BILL_ACCOUNTS,
    BILL_METHODS: BILL_METHODS,
    PAY_METHODS: PAY_METHODS,
    PURCHASES: PURCHASES,
    CASHFLOW: CASHFLOW,
    INCOME_EXPENSE: INCOME_EXPENSE,
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
    EXPENSES: EXPENSES,
    PATIENT_STATS: PATIENT_STATS,
    CASHFLOW_RANGES: CASHFLOW_RANGES
  });
})();
