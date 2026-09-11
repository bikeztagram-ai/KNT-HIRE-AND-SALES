import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (!supabase) return children;
  if (loading) return <div className="auth-shell"><div className="auth-card"><strong>Loading KNT…</strong><p className="muted">Checking your secure session.</p></div></div>;
  if (session) return children;

  async function signIn(event) {
    event.preventDefault();
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError(signInError.message);
  }

  return <div className="auth-shell"><form className="auth-card" onSubmit={signIn}>
    <div className="brand-mark auth-mark">KNT</div>
    <h1>KNT Hire & Sales</h1>
    <p className="muted">Sign in to the shared engineer workspace.</p>
    <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    {error && <div className="error-box" role="alert">{error}</div>}
    <button className="primary wide" type="submit">Sign in</button>
  </form></div>;
}
