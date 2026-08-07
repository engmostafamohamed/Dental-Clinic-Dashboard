/**
 * support.js — Saved reports and the customer-support inbox.
 * @module data/support
 */
(function () {
  'use strict';

  const REPORT_STATS = [
    { label: 'Reports generated',      value: '38',   sub: 'Last 90 days' },
    { label: 'Scheduled exports',      value: '6',    sub: 'Weekly and monthly' },
    { label: 'Avg. revenue / patient', value: '$412', sub: 'Up 6.2% vs Q1' },
    { label: 'Chair utilisation',      value: '78%',  sub: '4 chairs, 6 days a week' }
  ];

  const REPORTS = [
    { name: 'Monthly revenue summary',        period: 'Jul 2026',       generated: '01 Aug 2026', format: 'PDF' },
    { name: 'Treatment mix by dentist',       period: 'Q2 2026',        generated: '12 Jul 2026', format: 'XLSX' },
    { name: 'Outstanding balances ageing',    period: 'Jul 2026',       generated: '01 Aug 2026', format: 'PDF' },
    { name: 'Stock consumption',              period: 'Jun – Jul 2026', generated: '28 Jul 2026', format: 'CSV' },
    { name: 'New vs returning patients',      period: 'H1 2026',        generated: '03 Jul 2026', format: 'PDF' },
    { name: 'Insurance claim reconciliation', period: 'Jun 2026',       generated: '05 Jul 2026', format: 'XLSX' }
  ];

  /** Unread count shown on the support inbox. */
  const UNREAD_TICKETS = 3;

  /** Support inbox. `preview` is the truncated line shown in the list. */
  const TICKETS = [
    {
      from: 'Willa Jennings', subject: 'Rescheduling my Thursday appointment', time: '09:14',
      preview: 'Hi, something came up at work and I need to move…',
      body: 'Hi, something came up at work and I need to move my Thursday scaling appointment. Would Friday afternoon or the following Monday morning be possible? Happy to take whichever slot opens first.'
    },
    {
      from: 'Tobias Lindqvist', subject: 'Question about my bill #1243', time: '08:47',
      preview: 'I received two separate bills for one visit and…',
      body: 'I received two separate bills for one visit and wanted to check whether that is correct. One is for the booking fee and one for the treatment itself — should these not be combined into a single invoice?'
    },
    {
      from: 'Priya Raghunathan', subject: 'Insurance pre-authorisation', time: 'Yesterday',
      preview: 'My provider is asking for a treatment plan letter…',
      body: 'My provider is asking for a treatment plan letter before they will approve the crown work. Could you send that across this week so I can submit the claim in time?'
    },
    {
      from: 'Emeka Balogun', subject: 'Sensitivity after filling', time: 'Yesterday',
      preview: 'The tooth you filled last week is still sensitive…',
      body: 'The tooth you filled last week is still sensitive to cold. It is not painful, but I wanted to flag it in case it needs adjusting. Should I come in for a check?'
    },
    {
      from: 'Sofia Marchetti', subject: 'Requesting my X-ray records', time: '30 Jul',
      preview: 'I am moving out of state and my new dentist…',
      body: 'I am moving out of state and my new dentist has asked for copies of my most recent X-rays and treatment history. What is the process for requesting those?'
    }
  ];

  Ivora.define('data/support', {
    REPORT_STATS: REPORT_STATS,
    REPORTS: REPORTS,
    UNREAD_TICKETS: UNREAD_TICKETS,
    TICKETS: TICKETS
  });
})();
