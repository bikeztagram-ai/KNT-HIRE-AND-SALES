import React, { useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { signIn } from './lib/auth';

export default function SignInPage({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError(''); setBusy(true);
    try { await signIn(email.trim(), password); onSignedIn?.(); }
    catch (err) { setError(err?.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <div className="auth-card">
      <div className="brand-mark auth-mark">KNT</div>
      <p className="eyebrow">KNT WORKSPACE</p>
      <h1>Engineer sign in</h1>
      <p className="muted">Sign in to access the shared KNT jobs and fleet workspace.</p>
      <form onSubmit={submit} className="auth-form">
        <label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        {error && <div className="auth-error">{error}</div>}
        <button className="primary wide" disabled={busy}>{busy ? 'Signing in…' : <><LogIn size={18}/> Sign in</>}</button>
      </form>
      <p className="privacy-note"><LockKeyhole size={14}/> No credentials are stored in the application.</p>
    </div>
  </main>;
}
