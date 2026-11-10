'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * /auth/gu2k/callback
 *
 * GU2K redirects the user's browser here after they approve on the consent page:
 *   http://localhost:3001/auth/gu2k/callback?code=<64-char-code>&state=...
 *
 * This page:
 *  1. Extracts the `code` from the URL
 *  2. POSTs it to the Arena backend at POST /auth/gu2k/callback
 *     (the backend exchanges it with GU2K server-to-server — client_secret never in the browser)
 *  3. Stores the returned Arena JWT in the auth store
 *  4. Redirects to /dashboard
 */
export default function Gu2kCallbackPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code  = params.get('code');
    const error = params.get('error');

    if (error) {
      setErrorMsg(`GU2K denied access: ${params.get('error_description') ?? error}`);
      setStatus('error');
      return;
    }

    if (!code) {
      setErrorMsg('No authorization code received from GU2K.');
      setStatus('error');
      return;
    }

    const arenaApiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

    fetch(`${arenaApiBase}/auth/gu2k/callback`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message ?? 'Authentication failed.');
        }
        return json;
      })
      .then((json) => {
        const { accessToken, user } = json.data;

        // Store in Zustand auth store (same shape as regular login)
        setToken(accessToken);
        setUser({
          id:       user.id,
          email:    user.email,
          role:     user.role,
          avatarUrl: user.avatarUrl,
          username:  user.username,
        });

        router.replace('/');
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setStatus('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">Sign-in Failed</h1>
          <p className="text-gray-500">{errorMsg}</p>
          <a
            href="/login"
            className="inline-block mt-4 px-6 py-3 bg-[#7300E5] text-white rounded-xl font-semibold hover:bg-[#5f00bd] transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md space-y-6">
        {/* Animated spinner */}
        <div className="flex justify-center">
          <div
            className="w-14 h-14 rounded-full border-4 border-purple-100 border-t-[#7300E5] animate-spin"
            role="status"
            aria-label="Loading"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Signing you in…</h1>
          <p className="text-gray-500 text-sm">
            Verifying your GU2K credentials. This only takes a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
