/**
 * inventory.js — Consumable stock, purchase orders and fixed equipment.
 * @module data/inventory
 */
(function () {
  'use strict';

  /** Consumables. `status` is derived stock health: in / low / out. */
  const PRODUCTS = [
    { name: 'Articaine 4%',          category: 'Anaesthetics',           sku: 'ZKS8124', vendor: 'Barone LLC', stock: 0,   status: 'out', value: '$0.00' },
    { name: 'Lidocaine 2%',          category: 'Anaesthetics',           sku: 'ZKS8123', vendor: 'Dentalku',   stock: 124, status: 'in',  value: '$2,000' },
    { name: 'Doxycycline',           category: 'Periodontal Disease',    sku: 'ZKS8122', vendor: 'Dentalku',   stock: 62,  status: 'in',  value: '$1,500' },
    { name: 'Composite A2',          category: 'Restorative',            sku: 'ZKS8121', vendor: 'Barone LLC', stock: 2,   status: 'low', value: '$1,240' },
    { name: 'Orabase paste',         category: 'Anti-inflammatory',      sku: 'ZKS8120', vendor: 'Barone LLC', stock: 10,  status: 'low', value: '$1,800' },
    { name: 'Prophy paste',          category: 'Hygiene',                sku: 'ZKS8119', vendor: 'K24',        stock: 3,   status: 'low', value: '$420' },
    { name: 'PerioChip',             category: 'Plaque and Gingivitis',  sku: 'ZKS8118', vendor: 'K24',        stock: 124, status: 'in',  value: '$5,200' },
    { name: 'Chlorhexidine rinse',   category: 'Plaque and Gingivitis',  sku: 'ZKS8117', vendor: 'K24',        stock: 0,   status: 'out', value: '$0.00' },
    { name: 'Glass ionomer cement',  category: 'Restorative',            sku: 'ZKS8116', vendor: 'Dentalku',   stock: 84,  status: 'in',  value: '$3,300' }
  ];

  /** Purchase orders. `got`/`of` track how many deliveries have arrived. */
  const ORDERS = [
    { id: '#OS12KOS', items: 5,   total: '$1,500', created: '14 Jul 2026', vendor: 'Barone LLC',         status: 'pending',  got: 0, of: 3 },
    { id: '#OS11KOS', items: 890, total: '$1,270', created: '30 Jun 2026', vendor: 'Acme Co.',           status: 'pending',  got: 0, of: 3 },
    { id: '#OS10KOS', items: 204, total: '$1,124', created: '24 Jun 2026', vendor: 'Abstergo Ltd.',      status: 'complete', got: 3, of: 3 },
    { id: '#OS09KOS', items: 564, total: '$1,420', created: '06 Jun 2026', vendor: 'Binford Ltd.',       status: 'pending',  got: 0, of: 3 },
    { id: '#OS08KOS', items: 324, total: '$1,080', created: '11 May 2026', vendor: 'K24',                status: 'partial',  got: 2, of: 4 },
    { id: '#OS07KOS', items: 80,  total: '$700',   created: '31 Mar 2026', vendor: 'Dentalku',           status: 'complete', got: 3, of: 3 },
    { id: '#OS06KOS', items: 2,   total: '$5,000', created: '13 Mar 2026', vendor: 'K24',                status: 'complete', got: 3, of: 3 },
    { id: '#OS05KOS', items: 1,   total: '$2,000', created: '02 Feb 2026', vendor: 'Biffco Enterprises', status: 'complete', got: 3, of: 3 }
  ];

  /** Fixed equipment. `status`: used (in service) / idle / draft (not commissioned). */
  const PERIPHERALS = [
    { name: 'Dental air compressor, 40 L gas tank', sku: 'MSC750A-35', category: 'Support device',  room: 'Room 02',   status: 'used',  value: '$3,198.00' },
    { name: 'Autoclave steriliser 18 L',            sku: 'AUT180B-11', category: 'Sterilisation',   room: 'Room 01',   status: 'used',  value: '$4,420.00' },
    { name: 'Intraoral camera, wired',              sku: 'ICM220C-04', category: 'Imaging',         room: 'Room 03',   status: 'idle',  value: '$1,150.00' },
    { name: 'Dental chair unit, hydraulic',         sku: 'DCU900X-21', category: 'Chairside',       room: 'Room 02',   status: 'used',  value: '$12,800.00' },
    { name: 'Curing light, LED cordless',           sku: 'CLT110D-07', category: 'Chairside',       room: 'Room 01',   status: 'draft', value: '$390.00' },
    { name: 'Ultrasonic scaler',                    sku: 'USC340E-16', category: 'Hygiene',         room: 'Room 03',   status: 'used',  value: '$980.00' },
    { name: 'Panoramic X-ray unit',                 sku: 'PXR500F-02', category: 'Imaging',         room: 'Radiology', status: 'used',  value: '$28,400.00' },
    { name: 'Suction pump, dual',                   sku: 'SPD220G-09', category: 'Support device',  room: 'Room 02',   status: 'idle',  value: '$2,110.00' }
  ];

  /** Line items presented by the "receive delivery" modal. */
  const RECEIVABLE = [
    { name: 'Orthodontic brackets, ceramic', sku: '213-2311', qty: 24 },
    { name: 'Molar bands, stainless',        sku: '213-2321', qty: 40 }
  ];

  /** Stock status → badge styling and label. */
  const STOCK_STATUS = {
    in:  { label: 'IN STOCK',  cls: 'badge-ok' },
    low: { label: 'LOW STOCK', cls: 'badge-warn' },
    out: { label: 'OUT',       cls: 'badge-danger' }
  };

  /** Order status → badge styling and label. */
  const ORDER_STATUS = {
    complete: { label: 'COMPLETE', cls: 'badge-ok' },
    partial:  { label: 'PARTIAL',  cls: 'badge-warn' },
    pending:  { label: 'PENDING',  cls: 'badge-muted' }
  };

  /** Equipment status → badge styling and label. */
  const ASSET_STATUS = {
    used:  { label: 'IN USE',   cls: 'badge-ok' },
    idle:  { label: 'NOT USED', cls: 'badge-danger' },
    draft: { label: 'DRAFT',    cls: 'badge-neutral' }
  };

  Ivora.define('data/inventory', {
    PRODUCTS: PRODUCTS,
    ORDERS: ORDERS,
    PERIPHERALS: PERIPHERALS,
    RECEIVABLE: RECEIVABLE,
    STOCK_STATUS: STOCK_STATUS,
    ORDER_STATUS: ORDER_STATUS,
    ASSET_STATUS: ASSET_STATUS
  });
})();
