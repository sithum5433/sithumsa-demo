import { useState } from 'react';
import { ArrowLeft, CarFront, Lock, Sparkles } from 'lucide-react';
import { apiRequest, setCsrfToken } from '../api/client.js';

export function AdminGate({ onAuthenticated, onBackToStorefront }) {
  const [username, setUsername] = useState('Sithum');
  const [password, setPassword] = useState('DemoShowroom#2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enterDemo = async (u = username, p = password) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { username: u || 'Sithum', password: p || 'DemoShowroom#2026' },
      });
      setCsrfToken(data.csrfToken);
      onAuthenticated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await enterDemo(username, password);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#05070B] px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBackToStorefront}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-[#E5C158] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Public Showroom
        </button>

        <div className="rounded-3xl border border-[#D4AF37]/30 bg-[#0B0F17] p-7 shadow-2xl sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#E5C158]">
              <CarFront className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif-lux text-xl font-bold text-white">
                Owner &amp; POS Static Demo
              </h1>
              <p className="text-xs text-slate-400">
                Browser-only preview (changes save locally in this browser)
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => enterDemo('Sithum', 'DemoShowroom#2026')}
            className="btn-primary mt-6 w-full py-3.5 text-sm"
          >
            <Sparkles className="h-4 w-4" />
            Enter Owner &amp; POS Demo (No Password Required)
          </button>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3 text-[11px] text-slate-500">
            <div className="h-px flex-1 bg-white/10" />
            <span>or sign in with demo credentials</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Owner Username</label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#05070B] px-3.5 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Demo Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#05070B] px-3.5 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-luxury-outline w-full py-3">
              <Lock className="h-4 w-4" />
              {loading ? 'Opening Portal...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
