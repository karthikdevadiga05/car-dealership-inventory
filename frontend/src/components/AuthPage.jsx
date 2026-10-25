import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { inputClass, primaryBtn } from '../ui';
import Logo from './Logo';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (isLogin ? login(email, password) : register(email, password, name.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const tabClass = (active) =>
    `rounded-lg py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-indigo-700 ${
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700 hover:text-slate-900'
    }`;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-indigo-900 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
            Dealership inventory
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            Every car,
            <br />
            one clear view.
          </h1>
          <p className="mt-4 max-w-md text-lg text-indigo-100">
            Browse what is on the lot, check live stock and buy in a couple of clicks.
          </p>
        </div>
        <p className="text-sm text-indigo-200">Built with React, Express and PostgreSQL.</p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1">
            <button type="button" aria-pressed={isLogin} onClick={() => switchMode('login')} className={tabClass(isLogin)}>
              Sign in
            </button>
            <button type="button" aria-pressed={!isLogin} onClick={() => switchMode('register')} className={tabClass(!isLogin)}>
              Create account
            </button>
          </div>

          <h2 className="mt-8 text-3xl font-bold">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-slate-600">
            {isLogin ? 'Sign in to browse the inventory.' : 'It takes less than a minute.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
                <input
                  id="name"
                  required
                  maxLength={60}
                  autoComplete="name"
                  placeholder="e.g. Asha Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-indigo-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className={`${primaryBtn} w-full py-3`}>
              {busy ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}