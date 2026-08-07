/**
 * website.js — The marketing site's content model.
 *
 * The Website Settings page is a small CMS. Each section carries `fields`
 * (edited once) and may carry a repeater: `itemFields` describing the shape
 * of an item, and `items` holding them.
 *
 * @module data/website
 */
(function () {
  'use strict';

  /**
   * Field descriptor factory.
   * @param {string} k      Key on the section/item object.
   * @param {string} label  Label shown in the editor.
   * @param {'text'|'area'|'image'|'toggle'|'color'|'icon'} type
   * @param {*} v           Default value.
   * @param {string[]} [opts] Options — colour swatches for `color`.
   */
  const F = (k, label, type, v, opts) => ({ k, label, type, v, opts });

  const SITE_SECTIONS = [
    {
      id: 'brand', name: 'Brand & Theme', icon: 'palette', locked: true, visible: true,
      blurb: 'Applies across every page',
      fields: [
        F('name', 'Site name', 'text', 'Ivora Dental'),
        F('tagline', 'Tagline', 'text', 'Gentle dentistry in Northeast Portland'),
        F('accent', 'Accent colour', 'color', '#0e7a70', ['#0e7a70', '#3a51a8', '#8a4bb8', '#b26a00']),
        F('logo', 'Logo mark', 'image', 'site-logo')
      ]
    },
    {
      id: 'hero', name: 'Hero', icon: 'wallpaper', visible: true,
      blurb: 'First thing visitors see',
      fields: [
        F('eyebrow', 'Eyebrow', 'text', 'Accepting new patients'),
        F('title', 'Headline', 'text', 'A calmer kind of dental care'),
        F('body', 'Subheadline', 'area', 'Same-day emergency slots, transparent pricing, and a team that explains everything before it happens.'),
        F('cta', 'Primary button', 'text', 'Book an appointment'),
        F('cta2', 'Secondary button', 'text', 'Call (503) 555-0142'),
        F('image', 'Hero image', 'image', 'site-hero')
      ]
    },
    {
      id: 'stats', name: 'Trust bar', icon: 'insights', visible: true,
      blurb: 'Numbers under the hero',
      itemLabel: 'Stat',
      itemFields: [F('title', 'Value', 'text', ''), F('text', 'Label', 'text', '')],
      items: [
        { id: 'st1', visible: true, title: '18 yrs',   text: 'Caring for Portland families' },
        { id: 'st2', visible: true, title: '12k+',     text: 'Treatments completed' },
        { id: 'st3', visible: true, title: '4.9★',     text: 'Average patient rating' },
        { id: 'st4', visible: true, title: 'Same day', text: 'Emergency appointments' }
      ]
    },
    {
      id: 'services', name: 'Services', icon: 'medical_services', visible: true,
      blurb: 'What the clinic offers',
      fields: [
        F('title', 'Section title', 'text', 'Everything your smile needs'),
        F('body', 'Intro', 'area', 'From routine hygiene to full cosmetic work, all under one roof.')
      ],
      itemLabel: 'Service',
      itemFields: [
        F('title', 'Name', 'text', ''),
        F('text', 'Description', 'area', ''),
        F('meta', 'Price from', 'text', ''),
        F('icon', 'Icon', 'icon', 'dentistry')
      ],
      items: [
        { id: 'sv1', visible: true,  icon: 'dentistry',          title: 'General checkup',   text: 'A full exam, X-rays where needed, and a plan you actually understand.', meta: '$50' },
        { id: 'sv2', visible: true,  icon: 'cleaning_services',  title: 'Hygiene & scaling', text: 'Deep cleaning that leaves gums calm rather than raw.',                  meta: '$140' },
        { id: 'sv3', visible: true,  icon: 'auto_awesome',       title: 'Teeth whitening',   text: 'Clinically supervised shade correction over three short visits.',       meta: '$300' },
        { id: 'sv4', visible: true,  icon: 'healing',            title: 'Root canal therapy', text: 'Modern rotary endodontics — most cases finish comfortably.',           meta: '$780' },
        { id: 'sv5', visible: true,  icon: 'orthopedics',        title: 'Orthodontics',      text: 'Metal and clear aligner options with monthly progress checks.',        meta: '$3,000' },
        { id: 'sv6', visible: false, icon: 'child_care',         title: 'Paediatric care',   text: 'First visits designed to be boring in the best possible way.',         meta: '$45' }
      ]
    },
    {
      id: 'about', name: 'Why choose us', icon: 'verified', visible: true,
      blurb: 'Practice story and differentiators',
      fields: [
        F('title', 'Section title', 'text', 'Dentistry without the dread'),
        F('body', 'Body copy', 'area', 'We built Ivora around the parts of dental visits people dislike most: the waiting, the surprise bills, and the feeling of being talked over.'),
        F('image', 'Photo', 'image', 'site-about')
      ],
      itemLabel: 'Point',
      itemFields: [F('title', 'Title', 'text', ''), F('text', 'Description', 'area', '')],
      items: [
        { id: 'ab1', visible: true, title: 'Quoted before we start', text: 'Every plan is priced in writing and approved by you first.' },
        { id: 'ab2', visible: true, title: 'On-time appointments',   text: 'We cap daily bookings so your slot stays your slot.' },
        { id: 'ab3', visible: true, title: 'Anxiety-aware team',     text: 'Signal to pause at any point — no explanation needed.' }
      ]
    },
    {
      id: 'doctors', name: 'Meet the team', icon: 'groups', visible: true,
      blurb: 'Dentist profiles',
      fields: [
        F('title', 'Section title', 'text', 'The people who will treat you'),
        F('live', 'Pull live from Staff List', 'toggle', true)
      ],
      itemLabel: 'Doctor',
      itemFields: [
        F('title', 'Name', 'text', ''),
        F('meta', 'Speciality', 'text', ''),
        F('text', 'Short bio', 'area', '')
      ],
      items: [
        { id: 'dr1', visible: true, title: 'Dr. Soap Mactavish', meta: 'Oral Surgery',      text: 'Twelve years in surgical dentistry and a very steady hand.' },
        { id: 'dr2', visible: true, title: 'Dr. Putri Larasati', meta: 'Endodontics',       text: 'Root canal specialist who has made the procedure genuinely routine.' },
        { id: 'dr3', visible: true, title: 'Dr. Dianne Russell', meta: 'General Dentistry', text: 'Family dentistry lead, and the person most kids ask for by name.' }
      ]
    },
    {
      id: 'testimonials', name: 'Patient stories', icon: 'format_quote', visible: true,
      blurb: 'Reviews and quotes',
      fields: [F('title', 'Section title', 'text', 'What patients tell us')],
      itemLabel: 'Testimonial',
      itemFields: [
        F('text', 'Quote', 'area', ''),
        F('title', 'Name', 'text', ''),
        F('meta', 'Context', 'text', '')
      ],
      items: [
        { id: 'tm1', visible: true, text: 'First dentist I have not had to talk myself into visiting. They walked me through the whole plan before touching anything.', title: 'Willa Jennings',  meta: 'Scaling & whitening' },
        { id: 'tm2', visible: true, text: 'Chipped a molar on a Sunday and was seen Monday morning. The quote I was given was the amount I paid.',                      title: 'Emeka Balogun',   meta: 'Emergency crown' },
        { id: 'tm3', visible: true, text: 'My daughter asks when her next appointment is. I still cannot quite believe it.',                                           title: 'Sofia Marchetti', meta: 'Family care' }
      ]
    },
    {
      id: 'faq', name: 'FAQ', icon: 'help', visible: true,
      blurb: 'Common questions',
      fields: [F('title', 'Section title', 'text', 'Questions we hear a lot')],
      itemLabel: 'Question',
      itemFields: [F('title', 'Question', 'text', ''), F('text', 'Answer', 'area', '')],
      items: [
        { id: 'fq1', visible: true,  title: 'Do you take my insurance?',        text: 'We bill directly to six major providers and can pre-authorise larger treatments before you commit.' },
        { id: 'fq2', visible: true,  title: 'What happens at a first visit?',   text: 'A full examination, any X-rays needed, and a written plan. No treatment happens on day one unless you are in pain.' },
        { id: 'fq3', visible: true,  title: 'Can I pay in instalments?',        text: 'Yes — treatments over $500 can be split across the course of care at no extra cost.' },
        { id: 'fq4', visible: false, title: 'Do you see children?',            text: 'We see patients from age three upward, with longer slots booked for first visits.' }
      ]
    },
    {
      id: 'gallery', name: 'Clinic gallery', icon: 'photo_library', visible: false,
      blurb: 'Photos of the practice',
      fields: [F('title', 'Section title', 'text', 'Inside the practice')],
      itemLabel: 'Photo',
      itemFields: [F('image', 'Image', 'image', ''), F('title', 'Caption', 'text', '')],
      items: [
        { id: 'gl1', visible: true, image: 'site-gallery-1', title: 'Reception' },
        { id: 'gl2', visible: true, image: 'site-gallery-2', title: 'Treatment room 02' },
        { id: 'gl3', visible: true, image: 'site-gallery-3', title: 'Imaging suite' }
      ]
    },
    {
      id: 'contact', name: 'Contact & booking', icon: 'call', visible: true,
      blurb: 'Address, hours, booking form',
      fields: [
        F('title', 'Section title', 'text', 'Book a visit'),
        F('body', 'Intro', 'area', 'Call us, or send a request and we will confirm within one working hour.'),
        F('address', 'Address', 'text', '1142 Alder St, Portland OR 97205'),
        F('phone', 'Phone', 'text', '(503) 555-0142'),
        F('email', 'Email', 'text', 'hello@ivoradental.com'),
        F('hours', 'Opening hours', 'area', 'Mon – Fri · 9:00 – 17:00\nSaturday · 9:00 – 13:00'),
        F('form', 'Show booking form', 'toggle', true)
      ]
    },
    {
      id: 'footer', name: 'Footer', icon: 'bottom_navigation', visible: true,
      blurb: 'Legal line and social links',
      fields: [F('note', 'Copyright line', 'text', '© 2026 Ivora Dental. All rights reserved.')],
      itemLabel: 'Link',
      itemFields: [F('title', 'Label', 'text', ''), F('meta', 'URL', 'text', '')],
      items: [
        { id: 'ft1', visible: true, title: 'Instagram',      meta: 'instagram.com/ivoradental' },
        { id: 'ft2', visible: true, title: 'Privacy policy', meta: '/privacy' },
        { id: 'ft3', visible: true, title: 'Careers',        meta: '/careers' }
      ]
    }
  ];

  /** Preview viewport presets: [id, icon, width]. */
  const DEVICES = [
    ['desktop', 'computer',   '100%'],
    ['tablet',  'tablet_mac', '820px'],
    ['mobile',  'smartphone', '390px']
  ];

  Ivora.define('data/website', { SITE_SECTIONS: SITE_SECTIONS, DEVICES: DEVICES });
})();
