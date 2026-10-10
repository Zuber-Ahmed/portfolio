import { useState } from 'react';
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

import {
  authConfigured,
  confirmPasswordReset,
  requestPasswordReset,
  signIn,
} from '@/app/services/wedding/authService';

export default function AdminLogin({ onSignedIn }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signin') {
        await signIn(email, password, remember);
        onSignedIn();
      } else if (mode === 'forgot') {
        await requestPasswordReset(email);
        setMode('confirm');
        setMessage('A password reset code has been sent to your email.');
      } else {
        await confirmPasswordReset(email, code, password);
        setMode('signin');
        setPassword('');
        setCode('');
        setMessage('Password updated. You can now sign in.');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === 'signin'
      ? 'Sign in'
      : mode === 'forgot'
        ? 'Forgot password'
        : 'Set new password';

  return (
    <main className="admin-login-page">
      <section className="admin-login-wrap">
        <div className="admin-monogram" aria-hidden="true">
          Z<span>&amp;</span>B
        </div>
        <p className="admin-kicker">Wedding Admin</p>
        <h1>Zuber &amp; Bisma</h1>
        <div className="admin-login-card">
          {mode !== 'signin' && (
            <button
              className="admin-back-button"
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}>
              <FiArrowLeft /> Back to sign in
            </button>
          )}
          <h2>{title}</h2>
          <p>
            {mode === 'signin'
              ? 'Manage guests and wedding details.'
              : 'Use the administrator email to reset the password.'}
          </p>
          {!authConfigured && (
            <div className="admin-alert error">
              Authentication is not configured for this build.
            </div>
          )}
          {message && <div className="admin-alert success">{message}</div>}
          {error && <div className="admin-alert error">{error}</div>}
          <form onSubmit={submit}>
            <label>
              Email
              <span className="admin-input-wrap">
                <FiMail />
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </span>
            </label>
            {mode === 'confirm' && (
              <label>
                Reset code
                <input
                  value={code}
                  onChange={event => setCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </label>
            )}
            {mode !== 'forgot' && (
              <label>
                {mode === 'confirm' ? 'New password' : 'Password'}
                <span className="admin-input-wrap">
                  <FiLock />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    onClick={() => setShowPassword(value => !value)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </span>
              </label>
            )}
            {mode === 'signin' && (
              <div className="admin-login-options">
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={event => setRemember(event.target.checked)}
                  />{' '}
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                  }}>
                  Forgot password?
                </button>
              </div>
            )}
            <button
              className="admin-primary-button wide"
              type="submit"
              disabled={busy || !authConfigured}>
              {busy
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign In'
                  : mode === 'forgot'
                    ? 'Send Reset Code'
                    : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
