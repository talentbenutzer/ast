'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      <div className="w-full max-w-md space-y-8 bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter mb-2">AST</h1>
          <p className="text-white/50 text-sm">Bitte Passwort eingeben, um fortzufahren.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium animate-shake">
              Ungültiges Passwort. Bitte erneut versuchen.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Wird geprüft...' : 'Anmelden'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-white/20 text-[10px] uppercase tracking-widest">
            Interner Zugriff • Höllental
          </p>
        </div>
      </div>
    </div>
  );
}
