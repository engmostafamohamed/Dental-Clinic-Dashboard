/**
 * treatments.js — Service catalogue and chairside clinical vocabulary.
 * @module data/treatments
 */
(function () {
  'use strict';

  /** The clinic's published price list. */
  const TREATMENTS = [
    { name: 'General Checkup',     price: '$50',    duration: '± 1 hour',                 visit: 'single', rating: 4.6, reviews: 128, sample: true },
    { name: 'Teeth Whitening',     price: '$300',   duration: '± 1 hour / treatment',     visit: 'multi',  rating: 4.2, reviews: 64,  sample: true },
    { name: 'Teeth Cleaning',      price: '$75',    duration: '± 1 hour',                 visit: 'single', rating: 3.8, reviews: 48 },
    { name: 'Tooth Extraction',    price: '$300',   duration: '± 2 hours / treatment',    visit: 'multi',  rating: 4.5, reviews: 110 },
    { name: 'Tooth Fillings',      price: '$210',   duration: '± 1.5 hours',              visit: 'single', rating: 3.2, reviews: 75 },
    { name: 'Tooth Scaling',       price: '$140',   duration: '± 1.5 hours',              visit: 'single', rating: 4.5, reviews: 186 },
    { name: 'Tooth Braces (Metal)', price: '$3,000', duration: '± 1.5 hours / treatment', visit: 'multi',  rating: 4.5, reviews: 220 },
    { name: 'Veneers',             price: '$925',   duration: '± 1.5 hours / treatment',  visit: 'multi',  rating: 4.0, reviews: 32 },
    { name: 'Crowns',              price: '$500',   duration: '± 1.5 hours',              visit: 'single', rating: 4.3, reviews: 41 },
    { name: 'Bonding',             price: '$190',   duration: '± 1.5 hours',              visit: 'single', rating: 4.0, reviews: 4 }
  ];

  /** Findings a dentist can record against a tooth. */
  const CONDITIONS = ['Caries', 'Pulpitis', 'Fracture', 'Impacted', 'Gingivitis', 'Attrition', 'Discoloration'];

  /** Treatments split by the two chairside workflows. */
  const MEDICAL_TREATMENTS = ['Filling canal', 'Root canal', 'Tooth extraction', 'Dental crown', 'Tooth scaling', 'Fluoride application'];
  const COSMETIC_TREATMENTS = ['Teeth whitening', 'Veneers', 'Dental bonding', 'Metal braces'];

  /** Visit count and unit price per treatment, used to cost a plan. */
  const TREATMENT_META = {
    'Filling canal':        { visits: 1, price: 220 },
    'Root canal':           { visits: 4, price: 780 },
    'Tooth extraction':     { visits: 1, price: 300 },
    'Dental crown':         { visits: 2, price: 500 },
    'Tooth scaling':        { visits: 1, price: 140 },
    'Fluoride application': { visits: 1, price: 60 },
    'Teeth whitening':      { visits: 3, price: 300 },
    'Veneers':              { visits: 3, price: 925 },
    'Dental bonding':       { visits: 1, price: 190 },
    'Metal braces':         { visits: 6, price: 3000 }
  };

  /** Look up treatment metadata, with a sane default for unknown names. */
  const treatmentMeta = (name) => TREATMENT_META[name] || { visits: 1, price: 150 };

  /** True when a treatment belongs to the cosmetic workflow. */
  const isCosmetic = (name) => COSMETIC_TREATMENTS.includes(name);

  /** Reasons a patient or dentist may decline a proposed treatment. */
  const DECLINE_REASONS = ['Doctor not allowed', 'Patient disagree', 'Not enough time'];

  /**
   * The chairside check-up wizard. `step` is the numbered stage shown in the
   * stepper; `sub` distinguishes the medical (1) and cosmetic (2) passes.
   */
  const CHECKUP_PAGES = [
    { step: 1, sub: 0, title: 'Medical data',     subtitle: 'Confirm the patient record and today’s vitals' },
    { step: 2, sub: 1, title: 'Medical service',  subtitle: 'Select a problem tooth to record findings' },
    { step: 2, sub: 2, title: 'Cosmetic service', subtitle: 'Select a tooth for cosmetic work' },
    { step: 3, sub: 0, title: 'Oral check',       subtitle: 'Habits and soft-tissue findings' },
    { step: 4, sub: 1, title: 'Medical service',  subtitle: 'The results of the examination of all teeth' },
    { step: 4, sub: 2, title: 'Cosmetic service', subtitle: 'Confirm cosmetic work with the patient' }
  ];

  /** Blank clinical record for a patient with no chart yet. */
  const EMPTY_CLINICAL = Object.freeze({
    teeth: {}, agree: {}, record: {}, visits: {}, checkupDone: false, recordDone: false
  });

  /** Key for a specific visit within a multi-visit treatment. */
  const visitKey = (treatment, n) => `${treatment}#${n}`;

  Ivora.define('data/treatments', {
    TREATMENTS: TREATMENTS,
    CONDITIONS: CONDITIONS,
    MEDICAL_TREATMENTS: MEDICAL_TREATMENTS,
    COSMETIC_TREATMENTS: COSMETIC_TREATMENTS,
    treatmentMeta: treatmentMeta,
    isCosmetic: isCosmetic,
    DECLINE_REASONS: DECLINE_REASONS,
    CHECKUP_PAGES: CHECKUP_PAGES,
    EMPTY_CLINICAL: EMPTY_CLINICAL,
    visitKey: visitKey
  });
})();
