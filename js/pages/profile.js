/**
 * profile.js — My Profile: account details, password change, sign out.
 *
 * Reached from the header's account menu rather than the sidebar, so it is
 * registered as a route but deliberately absent from NAV.
 *
 * @module pages/profile
 */
(function () {
  'use strict';

  var { h, icon, spacer } = Ivora.require('core/dom');
  var { state, setState } = Ivora.require('core/store');
  var { user, updateUser, signOut } = Ivora.require('core/session');
  var { toggleTheme, setLanguage } = Ivora.require('core/theme');
  var { card, button, tabs, badge, toggle, note } = Ivora.require('components/ui');
  var { CLINIC } = Ivora.require('data/index');

  const TABS = [
    { id: 'details', label: 'Account details' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' }
  ];

  /* ------------------------------------------------------------------------
     Shared field
     ------------------------------------------------------------------------ */
  function textField(label, value, onInput, opts = {}) {
    return h('div',
      h('label.field-label', { style: { display: 'block', marginBottom: '7px' } }, label),
      h('input.input', {
        type: opts.type || 'text',
        value: value || '',
        placeholder: opts.placeholder || '',
        readonly: opts.readonly || undefined,
        style: {
          height: '42px',
          borderRadius: '10px',
          background: opts.readonly ? 'var(--surface-2)' : 'var(--surface)',
          color: opts.readonly ? 'var(--muted)' : 'var(--ink)'
        },
        oninput: onInput ? (e) => onInput(e.target.value) : undefined
      }),
      opts.hint && h('div', {
        style: { fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }
      }, opts.hint)
    );
  }

  const twoUp = (...children) => h('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
      gap: '14px'
    }
  }, children);

  /* ------------------------------------------------------------------------
     Identity header
     ------------------------------------------------------------------------ */
  function identityCard() {
    return h('div.card.card--pad',
      h('div.row.row--wrap', { style: { gap: '16px' } },
        h('div.avatar.avatar--lg', { style: { background: 'var(--brand)' } }, user.initials),
        h('div', { style: { minWidth: 0 } },
          h('div', { style: { fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em' } }, user.name),
          h('div.row.row--wrap', { style: { gap: '8px', marginTop: '6px' } },
            badge(user.role.toUpperCase(), 'brand'),
            h('span.t-md.c-muted', user.title),
            h('span.c-muted-2', '·'),
            h('span.t-md.c-muted', CLINIC.name)
          )
        ),
        spacer(),
        button('Sign out', { icon: 'logout', onClick: signOut, cls: 'btn-signout' })
      )
    );
  }

  /* ------------------------------------------------------------------------
     Tab: account details
     ------------------------------------------------------------------------ */
  function detailsTab() {
    const save = () => {
      setState({ profileSaved: true });
      // Clear the confirmation on its own rather than leaving it up forever.
      setTimeout(() => setState({ profileSaved: false }), 2400);
    };

    return h('div.stack',
      card(
        h('div.card-head', h('span.card-title', 'Account details'), spacer(),
          state.profileSaved && h('span.pill.pill-ok', icon('check', { size: 14 }), 'Saved')
        ),
        h('div.stack',
          twoUp(
            textField('Full name', user.name, (v) => { updateUser({ name: v }); setState({}); }),
            textField('Job title', user.title, (v) => { updateUser({ title: v }); setState({}); })
          ),
          twoUp(
            textField('Email address', user.email, (v) => { updateUser({ email: v }); setState({}); }, { type: 'email' }),
            textField('Phone', user.phone, (v) => { updateUser({ phone: v }); setState({}); })
          ),
          twoUp(
            textField('Role', user.role, null, {
              readonly: true, hint: 'Only an owner can change access level.'
            }),
            textField('Clinic', CLINIC.name, null, { readonly: true })
          ),
          h('div.row', { style: { marginTop: '4px' } },
            button('Save changes', { variant: 'brand', onClick: save }),
            h('span.t-sm.c-muted', `Member since ${user.joined}`)
          )
        )
      )
    );
  }

  /* ------------------------------------------------------------------------
     Tab: security — change password
     ------------------------------------------------------------------------ */

  /** Validate the three password fields; returns an error map. */
  function passwordErrors() {
    const errors = {};
    if (!state.pwCurrent) errors.pwCurrent = 'Enter your current password.';
    if (!state.pwNew) errors.pwNew = 'Choose a new password.';
    else if (state.pwNew.length < 8) errors.pwNew = 'Use at least 8 characters.';
    else if (state.pwNew === state.pwCurrent) errors.pwNew = 'The new password must differ from the current one.';
    if (!state.pwConfirm) errors.pwConfirm = 'Repeat the new password.';
    else if (state.pwConfirm !== state.pwNew) errors.pwConfirm = 'Passwords do not match.';
    return errors;
  }

  /** Rough strength read-out — length plus variety of character classes. */
  function strengthOf(value) {
    if (!value) return null;
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^\w\s]/.test(value)) score++;

    if (score <= 2) return { label: 'Weak', pct: 33, color: 'var(--danger)' };
    if (score <= 3) return { label: 'Fair', pct: 66, color: 'var(--warn)' };
    return { label: 'Strong', pct: 100, color: 'var(--ok)' };
  }

  function passwordField(label, key, placeholder) {
    const message = state.pwErrors[key];

    return h('div',
      h('label.field-label', { style: { display: 'block', marginBottom: '7px' } }, label),
      h(`input.input${message ? '.is-invalid' : ''}`, {
        type: 'password',
        value: state[key] || '',
        placeholder,
        autocomplete: key === 'pwCurrent' ? 'current-password' : 'new-password',
        style: {
          height: '42px',
          borderRadius: '10px',
          borderColor: message ? 'var(--danger)' : undefined
        },
        oninput: (e) => {
          const patch = { [key]: e.target.value, pwDone: false };
          // Drop this field's error as soon as it is being corrected.
          if (message) {
            const next = { ...state.pwErrors };
            delete next[key];
            patch.pwErrors = next;
          }
          setState(patch);
        }
      }),
      message && h('div.row', {
        style: { gap: '6px', marginTop: '6px', fontSize: '11.5px', fontWeight: 600, color: 'var(--danger)' }
      }, icon('error', { size: 14 }), h('span', message))
    );
  }

  function securityTab() {
    const strength = strengthOf(state.pwNew);

    const submit = () => {
      const errors = passwordErrors();
      if (Object.keys(errors).length) return setState({ pwErrors: errors, pwDone: false });
      setState({ pwErrors: {}, pwCurrent: '', pwNew: '', pwConfirm: '', pwDone: true });
    };

    const securityRow = (iconName, title, sub, trailing) =>
      h('div.row.row--wrap', {
        style: {
          gap: '12px', padding: '13px 0', borderTop: '1px solid var(--line-soft)'
        }
      },
        h('div.itile', { style: { background: 'var(--surface-2)' } }, icon(iconName, { size: 18 })),
        h('div', { style: { minWidth: 0, flex: '1' } },
          h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, title),
          h('div.t-sm.c-muted', sub)
        ),
        trailing
      );

    return h('div.stack',
      card(
        h('div.card-head', h('span.card-title', 'Change password'), spacer()),

        state.pwDone && h('div', { style: { marginBottom: '14px' } },
          note('Password updated. Use the new one next time you sign in.', 'brand', 'check_circle')),

        h('div.stack', { style: { maxWidth: '440px' } },
          passwordField('Current password', 'pwCurrent', 'Enter your current password'),
          h('div',
            passwordField('New password', 'pwNew', 'At least 8 characters'),
            strength && h('div', { style: { marginTop: '9px' } },
              h('div.row', { style: { gap: '9px' } },
                h('div.bar', { style: { flex: '1' } },
                  h('div.bar__fill', { style: { width: `${strength.pct}%`, background: strength.color } })
                ),
                h('span', {
                  style: { fontSize: '11px', fontWeight: 700, color: strength.color, minWidth: '44px' }
                }, strength.label)
              )
            )
          ),
          passwordField('Confirm new password', 'pwConfirm', 'Repeat the new password'),
          h('div.row', { style: { marginTop: '4px' } },
            button('Update password', { variant: 'brand', onClick: submit }),
            button('Cancel', {
              onClick: () => setState({
                pwCurrent: '', pwNew: '', pwConfirm: '', pwErrors: {}, pwDone: false
              })
            })
          )
        )
      ),

      card(
        h('div.card-head', h('span.card-title', 'Security')),
        securityRow('encrypted', 'Two-factor authentication',
          user.twoFactor ? 'Enabled — authenticator app' : 'Not enabled',
          toggle(user.twoFactor, () => { updateUser({ twoFactor: !user.twoFactor }); setState({}); })),
        securityRow('schedule', 'Last sign-in', user.lastSignIn,
          badge('THIS DEVICE', 'ok')),
        securityRow('devices', 'Active sessions', '2 devices signed in',
          button('Sign out all', { size: 'sm', onClick: signOut }))
      )
    );
  }

  /* ------------------------------------------------------------------------
     Tab: preferences
     ------------------------------------------------------------------------ */
  function preferencesTab() {
    const row = (title, sub, control) =>
      h('div.row.row--wrap', {
        style: { gap: '12px', padding: '14px 0', borderTop: '1px solid var(--line-soft)' }
      },
        h('div', { style: { minWidth: 0, flex: '1' } },
          h('div', { style: { fontSize: '12.5px', fontWeight: 700 } }, title),
          h('div.t-sm.c-muted', sub)
        ),
        control
      );

    const langBtn = (code, label) =>
      h(`button.chip${state.lang === code ? '.is-on' : ''}`, {
        type: 'button', onclick: () => setLanguage(code)
      }, label);

    return card(
      h('div.card-head', h('span.card-title', 'Preferences')),
      row('Appearance',
        state.theme === 'dark' ? 'Dark theme' : 'Light theme',
        button(state.theme === 'dark' ? 'Switch to light' : 'Switch to dark', {
          icon: state.theme === 'dark' ? 'light_mode' : 'dark_mode',
          size: 'sm',
          onClick: toggleTheme
        })),
      row('Language',
        state.lang === 'ar' ? 'العربية — right to left' : 'English — left to right',
        h('div.row', { style: { gap: '8px' } }, langBtn('en', 'English'), langBtn('ar', 'العربية'))),
      row('Email notifications', 'Daily schedule summary at 07:00', toggle(true, () => {})),
      row('Desktop notifications', 'New bookings and cancellations', toggle(false, () => {}))
    );
  }

  const PANELS = {
    details: detailsTab,
    security: securityTab,
    preferences: preferencesTab
  };

  /* ------------------------------------------------------------------------
     Page
     ------------------------------------------------------------------------ */
  function profilePage() {
    const active = PANELS[state.profileTab] ? state.profileTab : 'details';

    return h('div.stack',
      identityCard(),
      tabs(TABS, active, (id) => setState({ profileTab: id })),
      PANELS[active]()
    );
  }

  Ivora.define('pages/profile', { profilePage: profilePage });
})();
