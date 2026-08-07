/**
 * auth.js — Sign in and password recovery.
 *
 * These screens live outside the app shell, so this file is deliberately
 * self-contained: it needs only `ivora.js` and `core/dom.js`. It does not
 * pull in the store, which would drag the entire data layer onto a login
 * page for no benefit.
 *
 * Which screen renders is declared by the HTML file:
 *   window.IVORA_AUTH_SCREEN = 'login' | 'forgot' | 'reset';
 *
 * There is no backend. Submitting a valid form shows a brief pending state
 * and then continues to the dashboard — the point is the interface and its
 * validation, not authentication.
 */
(function () {
  'use strict';

  var { h, icon, mount } = Ivora.require('core/dom');
  var { translateTree } = Ivora.require('core/i18n');

  /* ------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------
     Read directly rather than through core/theme.js, which depends on the
     store. Keeps these pages to three scripts.
     ------------------------------------------------------------------------ */
  function applyTheme() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('ivora.prefs') || 'null');
    } catch {
      saved = null;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = (saved && saved.theme) || (prefersDark ? 'dark' : 'light');
    // Matches core/theme.js: English/LTR always starts a session.
    const lang = 'en';

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  /* ------------------------------------------------------------------------
     Validation
     ------------------------------------------------------------------------ */

  // Deliberately permissive: something@something.tld. Stricter patterns
  // reject valid addresses, and only a server can really tell.
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const RULES = {
    email: (v) => {
      if (!v.trim()) return 'Enter your email address.';
      if (!EMAIL.test(v.trim())) return 'That does not look like a valid email address.';
      return null;
    },
    password: (v) => {
      if (!v) return 'Enter your password.';
      if (v.length < 6) return 'Password must be at least 6 characters.';
      return null;
    },
    newPassword: (v) => {
      if (!v) return 'Choose a new password.';
      if (v.length < 8) return 'Use at least 8 characters.';
      return null;
    }
  };

  /** Form state, keyed by field name. */
  const values = {};
  const errors = {};
  let submitting = false;
  let done = false;

  /* ------------------------------------------------------------------------
     Field builders
     ------------------------------------------------------------------------ */

  function errorLine(name) {
    if (!errors[name]) return null;
    return h('div.auth__error', icon('error', { size: 14 }), h('span', errors[name]));
  }

  /**
   * @param {object} opts `{ name, label, type, placeholder, autocomplete }`
   */
  function field(opts) {
    const invalid = !!errors[opts.name];

    const input = h(`input.auth__input${invalid ? '.is-invalid' : ''}`, {
      type: opts.type || 'text',
      value: values[opts.name] || '',
      placeholder: opts.placeholder || '',
      autocomplete: opts.autocomplete,
      'aria-invalid': invalid ? 'true' : 'false',
      oninput: (e) => {
        values[opts.name] = e.target.value;
        // Clear the error as soon as the user starts correcting it; nagging
        // while someone is mid-fix is just noise.
        if (errors[opts.name]) {
          delete errors[opts.name];
          render();
        }
      }
    });

    return h('div',
      h('label.auth__label', opts.label),
      input,
      errorLine(opts.name)
    );
  }

  /** Password field with a show/hide toggle. */
  const revealed = {};

  function passwordField(opts) {
    const shown = !!revealed[opts.name];
    const invalid = !!errors[opts.name];

    return h('div',
      h('div', { style: { display: 'flex', alignItems: 'center' } },
        h('label.auth__label', { style: { flex: '1' } }, opts.label),
        opts.aside
      ),
      h('div.auth__password',
        h(`input.auth__input${invalid ? '.is-invalid' : ''}`, {
          type: shown ? 'text' : 'password',
          value: values[opts.name] || '',
          placeholder: opts.placeholder || '',
          autocomplete: opts.autocomplete,
          'aria-invalid': invalid ? 'true' : 'false',
          oninput: (e) => {
            values[opts.name] = e.target.value;
            if (errors[opts.name]) { delete errors[opts.name]; render(); }
          }
        }),
        h('button.auth__reveal', {
          type: 'button',
          title: shown ? 'Hide password' : 'Show password',
          'aria-label': shown ? 'Hide password' : 'Show password',
          onclick: () => { revealed[opts.name] = !shown; render(); }
        }, icon(shown ? 'visibility_off' : 'visibility', { size: 19 }))
      ),
      errorLine(opts.name)
    );
  }

  function submitButton(label) {
    return h('button.auth__submit', {
      type: 'submit',
      disabled: submitting || undefined
    },
      submitting ? h('span.auth__spinner') : null,
      submitting ? 'Please wait…' : label
    );
  }

  /* ------------------------------------------------------------------------
     Screens
     ------------------------------------------------------------------------ */

  /** Validate the named fields; returns true when all pass. */
  function validate(checks) {
    let valid = true;
    for (const [name, rule] of Object.entries(checks)) {
      const message = RULES[rule](values[name] || '');
      if (message) { errors[name] = message; valid = false; }
      else delete errors[name];
    }
    return valid;
  }

  /** Fake the round trip, then run `after`. */
  function pretendRequest(after) {
    submitting = true;
    render();
    setTimeout(() => {
      submitting = false;
      after();
      render();
    }, 700);
  }

  function loginScreen() {
    return h('form.auth__card', {
      novalidate: true,
      onsubmit: (e) => {
        e.preventDefault();
        if (!validate({ email: 'email', password: 'password' })) return render();
        pretendRequest(() => { location.href = '../index.html'; });
      }
    },
      h('h1.auth__title', 'Welcome back'),
      h('p.auth__subtitle', 'Sign in to manage appointments, patients and billing.'),

      h('div.auth__fields',
        field({
          name: 'email', label: 'Email address', type: 'email',
          placeholder: 'you@clinic.com', autocomplete: 'username'
        }),
        passwordField({
          name: 'password', label: 'Password',
          placeholder: 'Enter your password', autocomplete: 'current-password',
          aside: h('a', { href: 'forgot-password.html', style: { fontSize: '12px', fontWeight: 600 } },
            'Forgot password?')
        }),
        h('div.auth__row',
          h('label.auth__remember',
            h('input', { type: 'checkbox', checked: values.remember || undefined,
              onchange: (e) => { values.remember = e.target.checked; } }),
            'Keep me signed in'
          )
        ),
        submitButton('Sign in')
      ),

      h('div.auth__divider', 'or'),
      h('div.auth__sso',
        h('button.auth__sso-btn', {
          type: 'button',
          // Single sign-on skips the form entirely: the identity provider
          // would have authenticated already, so go straight through.
          onclick: () => pretendRequest(() => { location.href = '../index.html'; })
        }, icon('badge', { size: 18 }), 'Staff SSO'),
        h('button.auth__sso-btn', {
          type: 'button',
          onclick: () => pretendRequest(() => { location.href = '../index.html'; })
        }, icon('key', { size: 18 }), 'Passkey')
      ),

      h('div.auth__hint',
        'Demo build — there is no server. Any valid email and a password of 6+ characters will sign you in.'
      ),

      h('div.auth__legal',
        'Protected health information. Access is logged and audited.')
    );
  }

  function forgotScreen() {
    if (done) {
      return h('div.auth__card',
        h('div', {
          style: {
            width: '46px', height: '46px', borderRadius: '13px', background: 'var(--ok-soft)',
            color: 'var(--ok)', display: 'grid', placeItems: 'center', marginBottom: '18px'
          }
        }, icon('mark_email_read', { size: 24 })),
        h('h1.auth__title', 'Check your inbox'),
        h('p.auth__subtitle',
          `If an account exists for ${values.email || 'that address'}, a reset link is on its way. ` +
          'The link expires in 30 minutes.'),
        h('div', { style: { marginTop: '26px' } },
          h('a.auth__submit', {
            href: 'reset-password.html',
            style: { textDecoration: 'none' }
          }, 'Open reset link')
        ),
        h('div.auth__foot', h('a', { href: 'login.html' }, 'Back to sign in'))
      );
    }

    return h('form.auth__card', {
      novalidate: true,
      onsubmit: (e) => {
        e.preventDefault();
        if (!validate({ email: 'email' })) return render();
        pretendRequest(() => { done = true; });
      }
    },
      h('h1.auth__title', 'Reset your password'),
      h('p.auth__subtitle',
        'Enter the email address on your account and we will send you a link to choose a new password.'),
      h('div.auth__fields',
        field({
          name: 'email', label: 'Email address', type: 'email',
          placeholder: 'you@clinic.com', autocomplete: 'username'
        }),
        submitButton('Send reset link')
      ),
      h('div.auth__foot', h('a', { href: 'login.html' }, 'Back to sign in'))
    );
  }

  function resetScreen() {
    if (done) {
      return h('div.auth__card',
        h('div', {
          style: {
            width: '46px', height: '46px', borderRadius: '13px', background: 'var(--ok-soft)',
            color: 'var(--ok)', display: 'grid', placeItems: 'center', marginBottom: '18px'
          }
        }, icon('check_circle', { size: 24 })),
        h('h1.auth__title', 'Password updated'),
        h('p.auth__subtitle', 'You can now sign in with your new password.'),
        h('div', { style: { marginTop: '26px' } },
          h('a.auth__submit', { href: 'login.html', style: { textDecoration: 'none' } }, 'Continue to sign in')
        )
      );
    }

    return h('form.auth__card', {
      novalidate: true,
      onsubmit: (e) => {
        e.preventDefault();
        const valid = validate({ password: 'newPassword' });
        // Confirmation is checked separately — it depends on another field.
        if ((values.confirm || '') !== (values.password || '')) {
          errors.confirm = 'Passwords do not match.';
          return render();
        }
        delete errors.confirm;
        if (!valid) return render();
        pretendRequest(() => { done = true; });
      }
    },
      h('h1.auth__title', 'Choose a new password'),
      h('p.auth__subtitle', 'Use at least 8 characters. A passphrase is easier to remember and harder to guess.'),
      h('div.auth__fields',
        passwordField({
          name: 'password', label: 'New password',
          placeholder: 'At least 8 characters', autocomplete: 'new-password'
        }),
        passwordField({
          name: 'confirm', label: 'Confirm new password',
          placeholder: 'Repeat the password', autocomplete: 'new-password'
        }),
        submitButton('Update password')
      ),
      h('div.auth__foot', h('a', { href: 'login.html' }, 'Back to sign in'))
    );
  }

  const SCREENS = { login: loginScreen, forgot: forgotScreen, reset: resetScreen };

  /* ------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------ */

  const BRAND_COPY = {
    login: {
      quote: 'Everything your clinic runs on, in one place.',
      text: 'Appointments, patient records, billing and your public website — managed from a single dashboard.'
    },
    forgot: {
      quote: 'Locked out happens.',
      text: 'Reset your password and get straight back to the chair. Your records stay exactly where you left them.'
    },
    reset: {
      quote: 'One last step.',
      text: 'Pick something memorable. You will use it every morning.'
    }
  };

  function brandSide(screen) {
    const copy = BRAND_COPY[screen] || BRAND_COPY.login;
    const stat = (value, label) => h('div',
      h('div.auth__stat-value', value),
      h('div.auth__stat-label', label)
    );

    return h('aside.auth__brand-side',
      h('div.auth__brand-inner',
        h('div.auth__brand-quote', copy.quote),
        h('p.auth__brand-text', copy.text),
        h('div.auth__stats',
          stat('72', 'Active patients'),
          stat('8', 'Practitioners'),
          stat('18 yrs', 'Serving Portland')
        )
      ),
      h('div.auth__brand-foot', '© 2026 Ivora Dental · Northgate Dental Clinic')
    );
  }

  function render() {
    const screen = window.IVORA_AUTH_SCREEN || 'login';
    const build = SCREENS[screen] || SCREENS.login;

    mount(document.getElementById('app'),
      h('div.auth',
        h('div.auth__form-side',
          h('a.auth__brandmark', { href: '../index.html', style: { textDecoration: 'none', color: 'inherit' } },
            h('div.auth__brandmark-icon', icon('dentistry', { fill: true, size: 20 })),
            h('span.auth__brandmark-name', 'Ivora')
          ),
          h('div.auth__body', build())
        ),
        brandSide(screen)
      )
    );

    if (document.documentElement.getAttribute('lang') === 'ar') {
      translateTree(document.getElementById('app'));
    }
  }

  applyTheme();
  render();
})();
