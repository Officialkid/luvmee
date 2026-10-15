'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      if (!supabase) {
        setStatus('error');
        setErrorMessage('Supabase client is not configured.');
        return;
      }

      try {
        // 1. Check for authorization code in search params (PKCE flow)
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }
          setStatus('success');
          // Redirect to home after 1.5 seconds
          setTimeout(() => {
            router.push('/');
          }, 1500);
          return;
        }

        // 2. Check for hash fragments (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (error) {
              setStatus('error');
              setErrorMessage(error.message);
              return;
            }
            setStatus('success');
            setTimeout(() => {
              router.push('/');
            }, 1500);
            return;
          }
        }

        // 3. Fallback: check if session already exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 1500);
          return;
        }

        setStatus('error');
        setErrorMessage('No valid authentication token found in URL.');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message || 'An unexpected error occurred during authentication.');
      }
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FCE7ED] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg border border-pink-100 text-center">
        {status === 'verifying' && (
          <div>
            <div className="w-12 h-12 border-4 border-[#E85D75] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-[#542838] mb-2">Authenticating...</h2>
            <p className="text-gray-600 text-sm">Verifying your secure LUVMEE credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-12 h-12 bg-pink-100 text-[#E85D75] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ❤️
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#542838] mb-2">Authenticated!</h2>
            <p className="text-gray-600 text-sm">Welcome back to LUVMEE. Redirecting you now...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#542838] mb-2">Authentication Failed</h2>
            <p className="text-red-600 text-sm mb-6">{errorMessage}</p>
            <a
              href="/"
              className="inline-block bg-[#E85D75] hover:bg-[#d44860] text-white font-medium px-6 py-2.5 rounded-xl transition"
            >
              Return Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FCE7ED] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#E85D75] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
